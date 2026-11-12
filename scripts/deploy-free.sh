#!/bin/sh
# ==============================================================================
# Free deployment of the Faculty Self-Assessment form
#
#   Frontend  -> Cloudflare Pages   (free, always on)
#   API       -> Render free tier   (sleeps after 15 min idle)
#   Database  -> Neon free Postgres (you paste DATABASE_URL into .env)
#
# Usage:
#   cp .env.example .env      # fill in sections A and B
#   sh scripts/deploy-free.sh [--yes] [--api-only | --frontend-only]
#
# Safe to run again: it finds the existing services and updates them.
# Needs: sh, curl, git, node 18+ and npm.
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

RENDER=${RENDER_API_BASE:-https://api.render.com/v1}
CF=${CF_API_BASE:-https://api.cloudflare.com/client/v4}

# ------------------------------------------------------------------ checks ----
step "Checking setup"
require_cmd curl git node npm
load_env
APP_NAME=${APP_NAME:-facultyform}
validate_app_name
require_vars DATABASE_URL RENDER_API_KEY CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
case $DATABASE_URL in postgres://* | postgresql://*) ;; *) die "DATABASE_URL must start with postgresql://" ;; esac
case $DATABASE_URL in *ep-example-123456*) die "DATABASE_URL is still the example value — paste your Neon connection string." ;; esac
ensure_admin_key

REPO_URL=$(git_repo_url)
BRANCH=$(git_branch)
SERVICE_NAME="$APP_NAME-api"
REGION=${RENDER_REGION:-singapore}
ok "App: $APP_NAME   Repo: $REPO_URL ($BRANCH)   Region: $REGION"
[ "$DO_API" = 0 ] || check_git_pushed "$BRANCH"

# ---------------------------------------------------- 1. Cloudflare project ----
step "Cloudflare Pages project '$APP_NAME'"
AUTH_HEADER="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
http GET "$CF/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$APP_NAME"
if [ "$HTTP_STATUS" = 404 ]; then
  info "Creating project…"
  http POST "$CF/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
    "{\"name\":\"$APP_NAME\",\"production_branch\":\"main\"}"
  http_ok || die "Could not create Pages project ($HTTP_STATUS): $(resp | jget 'd.errors')"
elif ! http_ok; then
  die "Cloudflare API error ($HTTP_STATUS): $(resp | jget 'd.errors') — check CLOUDFLARE_API_TOKEN (needs Cloudflare Pages: Edit) and CLOUDFLARE_ACCOUNT_ID."
fi
PAGES_DOMAIN=$(resp | jget 'd.result.subdomain')
[ -n "$PAGES_DOMAIN" ] || PAGES_DOMAIN="$APP_NAME.pages.dev"
FRONTEND_URL="https://$PAGES_DOMAIN"
ok "Frontend URL: $FRONTEND_URL"

# -------------------------------------------------------- 2. Render service ----
AUTH_HEADER="Authorization: Bearer $RENDER_API_KEY"

render_owner() {
  if [ -n "${RENDER_OWNER_ID:-}" ]; then printf '%s' "$RENDER_OWNER_ID"; return; fi
  http GET "$RENDER/owners?limit=20"
  http_ok || die "Render API error ($HTTP_STATUS): $(resp) — check RENDER_API_KEY."
  resp | jget 'd[0] && d[0].owner.id'
}

render_find_service() {
  SVC_NAME=$SERVICE_NAME; export SVC_NAME
  http GET "$RENDER/services?name=$SERVICE_NAME&ownerId=$OWNER_ID&limit=50"
  http_ok || die "Render API error ($HTTP_STATUS): $(resp)"
  resp | jget '(d.find(x => x.service && x.service.name === process.env.SVC_NAME) || {service: {}}).service.id'
}

render_env_json() {
  ALLOWED_ORIGINS=$(allowed_origins "$FRONTEND_URL")
  export ALLOWED_ORIGINS
  node -e '
    const e = process.env;
    const vars = {
      NODE_ENV: "production",
      NODE_VERSION: "20",
      TRUST_PROXY: "1",
      DATABASE_URL: e.DATABASE_URL,
      DB_SSL_VERIFY: e.DB_SSL_VERIFY || "true",
      ADMIN_API_KEY: e.ADMIN_API_KEY,
      ALLOWED_ORIGINS: e.ALLOWED_ORIGINS,
    };
    process.stdout.write(JSON.stringify(Object.entries(vars).map(([key, value]) => ({ key, value }))));
  '
}

render_wait_for_deploy() {
  _sid=$1; _did=$2
  info "Waiting for Render to build and start the API (free tier: usually 2–6 min)…"
  _last=''; _i=0
  while [ $_i -lt 120 ]; do
    http GET "$RENDER/services/$_sid/deploys/$_did"
    _st=$(resp | jget '(d.deploy || d).status')
    if [ "$_st" != "$_last" ]; then info "status: $_st"; _last=$_st; fi
    case $_st in
      live) ok "API deploy is live"; return 0 ;;
      build_failed | update_failed | canceled | pre_deploy_failed | deactivated)
        die "Render deploy $_st. See logs: https://dashboard.render.com/web/$_sid/logs" ;;
    esac
    _i=$((_i + 1)); sleep 10
  done
  die "Timed out waiting for Render. Check https://dashboard.render.com/web/$_sid"
}

if [ "$DO_API" = 1 ] || [ "$DO_WEB" = 1 ]; then
  step "Render web service '$SERVICE_NAME'"
  OWNER_ID=$(render_owner)
  [ -n "$OWNER_ID" ] || die "No Render workspace found for this API key."
  SERVICE_ID=$(render_find_service)
fi

if [ "$DO_API" = 1 ]; then
  ENV_JSON=$(render_env_json)
  export ENV_JSON OWNER_ID REPO_URL BRANCH SERVICE_NAME REGION

  if [ -z "$SERVICE_ID" ]; then
    info "Creating free web service…"
    BODY=$(node -e '
      const e = process.env;
      process.stdout.write(JSON.stringify({
        type: "web_service",
        name: e.SERVICE_NAME,
        ownerId: e.OWNER_ID,
        repo: e.REPO_URL,
        branch: e.BRANCH,
        rootDir: "api-gateway",
        autoDeploy: "yes",
        envVars: JSON.parse(e.ENV_JSON),
        serviceDetails: {
          runtime: "node",
          plan: "free",
          region: e.REGION,
          healthCheckPath: "/health",
          envSpecificDetails: { buildCommand: "npm ci --omit=dev", startCommand: "npm start" },
        },
      }));
    ')
    http POST "$RENDER/services" "$BODY"
    if ! http_ok; then
      MSG=$(resp | jget 'd.message || d')
      case $MSG in
        *[Rr]epo* | *[Gg]it[Hh]ub*)
          die "Render can't read $REPO_URL ($HTTP_STATUS: $MSG).
    Connect GitHub to Render once: dashboard.render.com -> New -> Web Service -> GitHub -> grant access to this repo. Then re-run." ;;
        *) die "Could not create Render service ($HTTP_STATUS): $MSG" ;;
      esac
    fi
    SERVICE_ID=$(resp | jget '(d.service || d).id')
    DEPLOY_ID=$(resp | jget 'd.deployId')
    ok "Created service $SERVICE_ID"
    if [ -z "$DEPLOY_ID" ]; then
      sleep 5
      http GET "$RENDER/services/$SERVICE_ID/deploys?limit=1"
      DEPLOY_ID=$(resp | jget 'd[0] && (d[0].deploy || d[0]).id')
    fi
  else
    ok "Found existing service $SERVICE_ID — updating"
    http PUT "$RENDER/services/$SERVICE_ID/env-vars" "$ENV_JSON"
    http_ok || die "Could not update env vars ($HTTP_STATUS): $(resp)"
    ok "Environment variables updated"
    BODY=$(node -e '
      const e = process.env;
      process.stdout.write(JSON.stringify({
        branch: e.BRANCH,
        rootDir: "api-gateway",
        serviceDetails: {
          healthCheckPath: "/health",
          envSpecificDetails: { buildCommand: "npm ci --omit=dev", startCommand: "npm start" },
        },
      }));
    ')
    http PATCH "$RENDER/services/$SERVICE_ID" "$BODY"
    http_ok || warn "Could not update service settings ($HTTP_STATUS): $(resp | jget 'd.message || d')"
    http POST "$RENDER/services/$SERVICE_ID/deploys" '{"clearCache":"do_not_clear"}'
    http_ok || die "Could not start deploy ($HTTP_STATUS): $(resp)"
    DEPLOY_ID=$(resp | jget '(d.deploy || d).id')
  fi
  [ -n "$DEPLOY_ID" ] || die "Render did not return a deploy id: $(resp)"
  render_wait_for_deploy "$SERVICE_ID" "$DEPLOY_ID"
fi

if [ -z "${SERVICE_ID:-}" ]; then
  die "No Render service '$SERVICE_NAME' yet. Run without --frontend-only first."
fi
http GET "$RENDER/services/$SERVICE_ID"
API_URL=$(resp | jget '(d.service || d).serviceDetails && (d.service || d).serviceDetails.url')
[ -n "$API_URL" ] || die "Could not read the Render service URL: $(resp)"
API_URL=${API_URL%/}
ok "API URL: $API_URL"

# --------------------------------------------------------- 3. Frontend ----
if [ "$DO_WEB" = 1 ]; then
  build_frontend "$API_URL"
  step "Uploading to Cloudflare Pages"
  CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID \
    npx --yes wrangler@4 pages deploy "$ROOT_DIR/frontend/dist" \
      --project-name "$APP_NAME" --branch main --commit-dirty=true \
    || die "Cloudflare Pages upload failed."
  ok "Frontend deployed"
fi

# ------------------------------------------------------------ 4. Verify ----
smoke_test "$FRONTEND_URL" "$API_URL"

printf '\n%s%sDeployed!%s\n' "$C_BLD" "$C_GRN" "$C_OFF"
printf '  Form:        %s\n' "$FRONTEND_URL"
printf '  API:         %s   (first request after 15 min idle takes ~50 s)\n' "$API_URL"
printf '  Submissions: curl -H "x-admin-key: $ADMIN_API_KEY" %s/api/assessments\n' "$API_URL"
printf '               (ADMIN_API_KEY is in your .env)\n\n'
