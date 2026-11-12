#!/bin/sh
# ==============================================================================
# AWS deployment of the Faculty Self-Assessment form   (NOT free: ~US$5–25/mo)
#
#   Frontend  -> S3 (private bucket) + CloudFront (HTTPS, SPA routing)
#   API       -> AWS App Runner, running the api-gateway Docker image from ECR
#   Database  -> whatever DATABASE_URL points to (RDS, or keep Neon)
#
# Usage:
#   cp .env.example .env      # fill in sections A and C
#   sh scripts/deploy-aws.sh [--yes] [--api-only | --frontend-only]
#
# Safe to run again: existing resources are found by name and updated.
# Needs: sh, aws CLI v2, docker, curl, node 18+, npm.
# ==============================================================================
set -eu

# shellcheck source=lib/common.sh
. "$(dirname -- "$0")/lib/common.sh"

DO_API=1
DO_WEB=1
for arg in "$@"; do
  case $arg in
    --yes | -y) ASSUME_YES=1 ;;
    --api-only) DO_WEB=0 ;;
    --frontend-only) DO_API=0 ;;
    -h | --help) sed -n '2,16p' "$0"; exit 0 ;;
    *) die "Unknown option: $arg (see --help)" ;;
  esac
done

export AWS_PAGER=""   # never open `less` on output

# ------------------------------------------------------------------ checks ----
step "Checking setup"
require_cmd aws curl node npm
[ "$DO_API" = 0 ] || require_cmd docker
load_env
APP_NAME=${APP_NAME:-facultyform}
validate_app_name
require_vars DATABASE_URL AWS_REGION
case $DATABASE_URL in postgres://* | postgresql://*) ;; *) die "DATABASE_URL must start with postgresql://" ;; esac
case $DATABASE_URL in *ep-example-123456*) die "DATABASE_URL is still the example value." ;; esac
ensure_admin_key

# Empty credentials in .env must not shadow a working `aws configure` profile.
[ -n "${AWS_ACCESS_KEY_ID:-}" ] || unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
[ -n "${AWS_SESSION_TOKEN:-}" ] || unset AWS_SESSION_TOKEN
[ -n "${AWS_PROFILE:-}" ] || unset AWS_PROFILE
export AWS_REGION AWS_DEFAULT_REGION="$AWS_REGION"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>"$TMP_DIR/sts") \
  || die "AWS credentials don't work: $(cat "$TMP_DIR/sts")"
ok "AWS account $ACCOUNT_ID, region $AWS_REGION"

SERVICE_NAME="$APP_NAME-api"
ECR_REPO="$APP_NAME-api"
ROLE_NAME="$APP_NAME-apprunner-ecr-access"
BUCKET=${AWS_S3_BUCKET:-$APP_NAME-web-$ACCOUNT_ID}
CF_COMMENT="$APP_NAME-web"
OAC_NAME="$APP_NAME-web-oac"
REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
CPU=${APPRUNNER_CPU:-0.25 vCPU}
MEMORY=${APPRUNNER_MEMORY:-0.5 GB}

# none() turns the aws CLI's "None" into an empty string
none() { [ "$1" = None ] && printf '' || printf '%s' "$1"; }

# --------------------------------------------- 1. S3 bucket + CloudFront ----
step "Frontend hosting: S3 bucket '$BUCKET' + CloudFront"
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  ok "Bucket exists"
else
  if [ "$AWS_REGION" = us-east-1 ]; then
    aws s3api create-bucket --bucket "$BUCKET" >/dev/null
  else
    aws s3api create-bucket --bucket "$BUCKET" --create-bucket-configuration "LocationConstraint=$AWS_REGION" >/dev/null
  fi \
    || die "Could not create bucket '$BUCKET' (names are global — set AWS_S3_BUCKET in .env)."
  ok "Created bucket"
fi
aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

OAC_ID=$(none "$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='$OAC_NAME'].Id | [0]" --output text)")
if [ -z "$OAC_ID" ]; then
  OAC_ID=$(aws cloudfront create-origin-access-control --origin-access-control-config \
    "Name=$OAC_NAME,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
    --query OriginAccessControl.Id --output text)
  ok "Created origin access control $OAC_ID"
fi

DIST_ID=$(none "$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='$CF_COMMENT'].Id | [0]" --output text)")
if [ -z "$DIST_ID" ]; then
  info "Creating CloudFront distribution (takes ~5–15 min to roll out worldwide)…"
  cat > "$TMP_DIR/dist.json" <<EOF
{
  "CallerReference": "$APP_NAME-$(date +%s)",
  "Comment": "$CF_COMMENT",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "HttpVersion": "http2and3",
  "PriceClass": "PriceClass_200",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "s3-$BUCKET",
      "DomainName": "$BUCKET.s3.$AWS_REGION.amazonaws.com",
      "S3OriginConfig": { "OriginAccessIdentity": "" },
      "OriginAccessControlId": "$OAC_ID"
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-$BUCKET",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true,
    "AllowedMethods": {
      "Quantity": 2, "Items": ["GET", "HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
    }
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      { "ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 0 },
      { "ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 0 }
    ]
  }
}
EOF
  DIST_ID=$(aws cloudfront create-distribution --distribution-config "file://$TMP_DIR/dist.json" \
    --query Distribution.Id --output text)
  ok "Created distribution $DIST_ID"
fi
CF_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query Distribution.DomainName --output text)
FRONTEND_URL="https://$CF_DOMAIN"

cat > "$TMP_DIR/policy.json" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontRead",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET/*",
    "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::$ACCOUNT_ID:distribution/$DIST_ID" } }
  }]
}
EOF
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "file://$TMP_DIR/policy.json"
ok "Frontend URL: $FRONTEND_URL"

# ------------------------------------------------- 2. API on App Runner ----
service_arn() {
  none "$(aws apprunner list-services \
    --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn | [0]" --output text)"
}

# wait_apprunner ARN [OPERATION_ID] — waits for that operation (default: the
# latest one) to finish; fails unless it succeeded.
wait_apprunner() {
  _arn=$1; _opid=${2:-}; _last=''; _i=0
  if [ -n "$_opid" ]; then _q="OperationSummaryList[?Id=='$_opid'].Status | [0]"; else _q='OperationSummaryList[0].Status'; fi
  info "Waiting for App Runner (usually 3–8 min)…"
  while [ $_i -lt 120 ]; do
    _op=$(aws apprunner list-operations --service-arn "$_arn" --max-results 20 \
      --query "$_q" --output text 2>/dev/null || echo UNKNOWN)
    if [ "$_op" != "$_last" ]; then info "status: $_op"; _last=$_op; fi
    case $_op in
      SUCCEEDED) ok "App Runner deployment succeeded"; return 0 ;;
      FAILED | ROLLBACK_SUCCEEDED | ROLLBACK_FAILED)
        die "App Runner deployment $_op. See logs in the console: App Runner -> $SERVICE_NAME -> Logs" ;;
    esac
    _i=$((_i + 1)); sleep 10
  done
  die "Timed out waiting for App Runner."
}

if [ "$DO_API" = 1 ]; then
  step "Container image in ECR"
  aws ecr describe-repositories --repository-names "$ECR_REPO" >/dev/null 2>&1 \
    || { aws ecr create-repository --repository-name "$ECR_REPO" \
           --image-scanning-configuration scanOnPush=true >/dev/null && ok "Created ECR repo $ECR_REPO"; }
  aws ecr get-login-password | docker login --username AWS --password-stdin "$REGISTRY" >/dev/null \
    || die "docker login to ECR failed."

  TAG=$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo build)-$(date +%Y%m%d%H%M%S)
  IMAGE="$REGISTRY/$ECR_REPO:$TAG"
  info "Building $IMAGE (linux/amd64)…"
  docker build --platform linux/amd64 -t "$IMAGE" "$ROOT_DIR/api-gateway" || die "docker build failed."
  docker push "$IMAGE" >/dev/null || die "docker push failed."
  ok "Pushed $IMAGE"

  step "IAM role for App Runner to pull from ECR"
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text 2>/dev/null || true)
  if [ -z "$ROLE_ARN" ]; then
    cat > "$TMP_DIR/trust.json" <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Principal": { "Service": "build.apprunner.amazonaws.com" }, "Action": "sts:AssumeRole" }]
}
EOF
    ROLE_ARN=$(aws iam create-role --role-name "$ROLE_NAME" \
      --assume-role-policy-document "file://$TMP_DIR/trust.json" --query Role.Arn --output text)
    aws iam attach-role-policy --role-name "$ROLE_NAME" \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
    info "Waiting for the new role to propagate…"
    sleep 15
    ok "Created $ROLE_NAME"
  else
    ok "Role exists"
  fi

  step "App Runner service '$SERVICE_NAME'"
  ALLOWED_ORIGINS=$(allowed_origins "$FRONTEND_URL")
  export ALLOWED_ORIGINS IMAGE ROLE_ARN CPU MEMORY
  node -e '
    const e = process.env, fs = require("fs"), dir = process.argv[1];
    fs.writeFileSync(dir + "/source.json", JSON.stringify({
      ImageRepository: {
        ImageIdentifier: e.IMAGE,
        ImageRepositoryType: "ECR",
        ImageConfiguration: {
          Port: "5000",
          RuntimeEnvironmentVariables: {
            NODE_ENV: "production",
            PORT: "5000",
            TRUST_PROXY: "1",
            DATABASE_URL: e.DATABASE_URL,
            DB_SSL_VERIFY: e.DB_SSL_VERIFY || "true",
            ADMIN_API_KEY: e.ADMIN_API_KEY,
            ALLOWED_ORIGINS: e.ALLOWED_ORIGINS,
          },
        },
      },
      AutoDeploymentsEnabled: false,
      AuthenticationConfiguration: { AccessRoleArn: e.ROLE_ARN },
    }));
    fs.writeFileSync(dir + "/instance.json", JSON.stringify({ Cpu: e.CPU, Memory: e.MEMORY }));
    fs.writeFileSync(dir + "/health.json", JSON.stringify({
      Protocol: "HTTP", Path: "/health", Interval: 10, Timeout: 5, HealthyThreshold: 1, UnhealthyThreshold: 5,
    }));
  ' "$TMP_DIR"

  SERVICE_ARN=$(service_arn)
  if [ -z "$SERVICE_ARN" ]; then
    OUT=$(aws apprunner create-service --service-name "$SERVICE_NAME" \
      --source-configuration "file://$TMP_DIR/source.json" \
      --instance-configuration "file://$TMP_DIR/instance.json" \
      --health-check-configuration "file://$TMP_DIR/health.json" \
      --query '[Service.ServiceArn, OperationId]' --output text) || die "create-service failed."
    SERVICE_ARN=$(printf '%s' "$OUT" | cut -f1)
    OP_ID=$(printf '%s' "$OUT" | cut -f2)
    ok "Created service"
  else
    STATUS=$(aws apprunner describe-service --service-arn "$SERVICE_ARN" --query Service.Status --output text)
    [ "$STATUS" != OPERATION_IN_PROGRESS ] || wait_apprunner "$SERVICE_ARN"
    OP_ID=$(aws apprunner update-service --service-arn "$SERVICE_ARN" \
      --source-configuration "file://$TMP_DIR/source.json" \
      --instance-configuration "file://$TMP_DIR/instance.json" \
      --health-check-configuration "file://$TMP_DIR/health.json" \
      --query OperationId --output text) || die "update-service failed."
    ok "Updating existing service"
  fi
  wait_apprunner "$SERVICE_ARN" "$(none "$OP_ID")"
fi

SERVICE_ARN=${SERVICE_ARN:-$(service_arn)}
[ -n "$SERVICE_ARN" ] || die "No App Runner service '$SERVICE_NAME' yet. Run without --frontend-only first."
API_URL="https://$(aws apprunner describe-service --service-arn "$SERVICE_ARN" --query Service.ServiceUrl --output text)"
ok "API URL: $API_URL"

# --------------------------------------------------- 3. Upload frontend ----
if [ "$DO_WEB" = 1 ]; then
  build_frontend "$API_URL"
  step "Uploading frontend to s3://$BUCKET"
  DIST="$ROOT_DIR/frontend/dist"
  # Hashed assets can be cached forever; index.html must always be fresh.
  aws s3 sync "$DIST" "s3://$BUCKET" --delete --exclude index.html \
    --cache-control 'public,max-age=31536000,immutable' --only-show-errors
  aws s3 cp "$DIST/index.html" "s3://$BUCKET/index.html" \
    --cache-control 'no-cache' --content-type 'text/html; charset=utf-8' --only-show-errors
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*' >/dev/null
  ok "Uploaded and invalidated CloudFront cache"
fi

# ------------------------------------------------------------ 4. Verify ----
DIST_STATUS=$(aws cloudfront get-distribution --id "$DIST_ID" --query Distribution.Status --output text)
[ "$DIST_STATUS" = Deployed ] || warn "CloudFront is still rolling out ($DIST_STATUS) — the form URL may 404 for a few minutes."
smoke_test "$FRONTEND_URL" "$API_URL"

printf '\n%s%sDeployed to AWS!%s\n' "$C_BLD" "$C_GRN" "$C_OFF"
printf '  Form:        %s\n' "$FRONTEND_URL"
printf '  API:         %s\n' "$API_URL"
printf '  Submissions: curl -H "x-admin-key: $ADMIN_API_KEY" %s/api/assessments\n' "$API_URL"
printf '               (ADMIN_API_KEY is in your .env)\n\n'
