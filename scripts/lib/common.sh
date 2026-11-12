# shellcheck shell=sh
# Shared helpers for scripts/deploy-*.sh  (POSIX sh — works with sh, dash, bash, zsh)

# ---------------------------------------------------------------- output ----
if [ -t 1 ]; then
  C_RED=$(printf '\033[31m'); C_GRN=$(printf '\033[32m'); C_YLW=$(printf '\033[33m')
  C_CYN=$(printf '\033[36m'); C_BLD=$(printf '\033[1m'); C_OFF=$(printf '\033[0m')
else
  C_RED=''; C_GRN=''; C_YLW=''; C_CYN=''; C_BLD=''; C_OFF=''
fi

step() { printf '\n%s==> %s%s\n' "$C_BLD$C_CYN" "$*" "$C_OFF"; }
info() { printf '    %s\n' "$*"; }
ok()   { printf '    %s✓ %s%s\n' "$C_GRN" "$*" "$C_OFF"; }
warn() { printf '    %s! %s%s\n' "$C_YLW" "$*" "$C_OFF" >&2; }
die()  { printf '\n%s✗ %s%s\n' "$C_RED" "$*" "$C_OFF" >&2; exit 1; }

# ----------------------------------------------------------------- setup ----
ROOT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE=${ENV_FILE:-$ROOT_DIR/.env}

TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t deploy)
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM

require_cmd() {
  for _c in "$@"; do
    command -v "$_c" >/dev/null 2>&1 || die "'$_c' is required but not installed."
  done
}

require_vars() {
  _missing=''
  for _v in "$@"; do
    eval "_val=\${$_v:-}"
    [ -n "$_val" ] || _missing="$_missing $_v"
  done
  [ -z "$_missing" ] || die "Missing values in $ENV_FILE:$_missing"
}

# Reads KEY=value lines WITHOUT executing them, so URLs containing & ? $ are safe.
# Values already set in the real environment win over the file.
load_env() {
  [ -f "$ENV_FILE" ] || die "No $ENV_FILE found. Run:  cp .env.example .env   and fill it in."
  _n=0
  while IFS= read -r _line || [ -n "$_line" ]; do
    _n=$((_n + 1))
    _line=$(printf '%s' "$_line" | tr -d '\r' | sed 's/^[[:space:]]*//')
    case $_line in '' | \#*) continue ;; esac
    case $_line in *=*) ;; *) warn "$ENV_FILE line $_n ignored (no '=')"; continue ;; esac
    _key=$(printf '%s' "${_line%%=*}" | sed 's/^[[:space:]]*export[[:space:]][[:space:]]*//; s/^[[:space:]]*//; s/[[:space:]]*$//')
    _val=$(printf '%s' "${_line#*=}" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')
    case $_key in '' | [0-9]* | *[!A-Za-z0-9_]*) warn "$ENV_FILE line $_n ignored (bad name '$_key')"; continue ;; esac
    case $_val in
      \"*\") _val=${_val#\"}; _val=${_val%\"} ;;
      \'*\') _val=${_val#\'}; _val=${_val%\'} ;;
    esac
    eval "_cur=\${$_key:-}"
    [ -n "$_cur" ] || export "$_key=$_val"
  done < "$ENV_FILE"
}

# Writes KEY=value into .env (replacing an empty or existing line).
save_env_value() {
  _k=$1; _v=$2
  if grep -q "^$_k=" "$ENV_FILE"; then
    sed "s|^$_k=.*|$_k=$_v|" "$ENV_FILE" > "$TMP_DIR/env.new" && cat "$TMP_DIR/env.new" > "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$_k" "$_v" >> "$ENV_FILE"
  fi
}

ensure_admin_key() {
  if [ -z "${ADMIN_API_KEY:-}" ]; then
    ADMIN_API_KEY=$(node -e "process.stdout.write(require('crypto').randomBytes(24).toString('hex'))")
    export ADMIN_API_KEY
    save_env_value ADMIN_API_KEY "$ADMIN_API_KEY"
    ok "Generated ADMIN_API_KEY and saved it to .env"
  fi
}

validate_app_name() {
  case $APP_NAME in
    '' | -* | *- | *[!a-z0-9-]*) die "APP_NAME must be lowercase letters, digits and dashes (got '$APP_NAME')." ;;
  esac
  [ "${#APP_NAME}" -le 40 ] || die "APP_NAME must be 40 characters or fewer."
}

# ------------------------------------------------------------------ json ----
# Usage: <json on stdin> | jget 'd.service.id'
# Prints the value of a JS expression over the parsed JSON `d` (objects as JSON,
# nothing for null/undefined). Uses node so no jq is needed.
jget() {
  node -e '
    let d = null;
    try { d = JSON.parse(require("fs").readFileSync(0, "utf8") || "null"); } catch (e) {}
    let v;
    try { v = new Function("d", "return (" + process.argv[1] + ")")(d); } catch (e) {}
    if (v !== undefined && v !== null) process.stdout.write(typeof v === "object" ? JSON.stringify(v) : String(v));
  ' "$1"
}

# ----------------------------------------------------------------- http -----
# http METHOD URL [BODY] — needs AUTH_HEADER set. Sets HTTP_STATUS, body in $TMP_DIR/resp
http() {
  _m=$1; _u=$2; _b=${3:-}
  if [ -n "$_b" ]; then
    printf '%s' "$_b" > "$TMP_DIR/req"
    HTTP_STATUS=$(curl -sS -X "$_m" -H "$AUTH_HEADER" -H 'Accept: application/json' -H 'Content-Type: application/json' \
      --data-binary "@$TMP_DIR/req" -o "$TMP_DIR/resp" -w '%{http_code}' "$_u") || HTTP_STATUS=000
  else
    HTTP_STATUS=$(curl -sS -X "$_m" -H "$AUTH_HEADER" -H 'Accept: application/json' \
      -o "$TMP_DIR/resp" -w '%{http_code}' "$_u") || HTTP_STATUS=000
  fi
}
resp() { cat "$TMP_DIR/resp" 2>/dev/null; }
http_ok() { case $HTTP_STATUS in 2??) return 0 ;; *) return 1 ;; esac; }

# ------------------------------------------------------------------ git -----
git_repo_url() {
  _url=${GIT_REPO_URL:-$(git -C "$ROOT_DIR" remote get-url origin 2>/dev/null || true)}
  [ -n "$_url" ] || die "Set GIT_REPO_URL in .env (no git remote 'origin' found)."
  case $_url in
    git@github.com:*) _url="https://github.com/${_url#git@github.com:}" ;;
    ssh://git@github.com/*) _url="https://github.com/${_url#ssh://git@github.com/}" ;;
  esac
  # strip credentials, local proxies and .git
  _url=$(printf '%s' "$_url" | sed -E 's#^https?://[^@/]*@#https://#; s#\.git$##')
  case $_url in
    https://github.com/*/* | https://gitlab.com/*/* | https://bitbucket.org/*/*) ;;
    *) _path=$(printf '%s' "$_url" | sed -E 's#^https?://[^/]+/(git/)?##')
       case $_path in */*) _url="https://github.com/$_path" ;; *) die "Can't work out the GitHub URL from '$_url'. Set GIT_REPO_URL in .env." ;; esac ;;
  esac
  printf '%s' "$_url"
}

git_branch() {
  _b=${DEPLOY_BRANCH:-$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}
  [ "$_b" != HEAD ] || _b=main
  printf '%s' "$_b"
}

# Warns when the cloud would build something different from your working copy.
check_git_pushed() {
  _branch=$1
  command -v git >/dev/null 2>&1 || return 0
  git -C "$ROOT_DIR" rev-parse >/dev/null 2>&1 || return 0
  if [ -n "$(git -C "$ROOT_DIR" status --porcelain --untracked-files=no 2>/dev/null)" ]; then
    warn "You have uncommitted changes. The API is built from GitHub, so they won't be included."
  fi
  _local=$(git -C "$ROOT_DIR" rev-parse HEAD 2>/dev/null || true)
  _remote=$(git -C "$ROOT_DIR" ls-remote origin "refs/heads/$_branch" 2>/dev/null | cut -f1)
  if [ -z "$_remote" ]; then
    warn "Branch '$_branch' is not on GitHub yet. Push it first:  git push -u origin $_branch"
    confirm_or_exit
  elif [ "$_local" != "$_remote" ]; then
    warn "Your local '$_branch' differs from GitHub. Push first so the API matches:  git push origin $_branch"
    confirm_or_exit
  fi
}

confirm_or_exit() {
  [ "${ASSUME_YES:-}" = 1 ] && return 0
  if [ -t 0 ]; then
    printf '    Continue anyway? [y/N] '
    read -r _ans
    case $_ans in y | Y | yes | YES) return 0 ;; *) die "Aborted." ;; esac
  fi
}

# -------------------------------------------------------------- frontend ----
build_frontend() {
  _api=$1
  step "Building frontend (API: $_api)"
  (
    cd "$ROOT_DIR/frontend" || exit 1
    if [ -f package-lock.json ]; then npm ci --no-audit --no-fund --loglevel=error; else npm install --no-audit --no-fund; fi
    VITE_API_URL="$_api" npm run build --silent
  ) || die "Frontend build failed."
  [ -f "$ROOT_DIR/frontend/dist/index.html" ] || die "Build produced no frontend/dist/index.html"
  ok "Built frontend/dist"
}

allowed_origins() {
  _o=$1
  if [ -n "${EXTRA_ALLOWED_ORIGINS:-}" ]; then _o="$_o,$EXTRA_ALLOWED_ORIGINS"; fi
  printf '%s' "$_o" | tr -d ' '
}

# smoke_test FRONTEND_URL API_URL
smoke_test() {
  _fe=$1; _api=$2
  step "Smoke tests"
  _h=$(curl -sS -m 90 -o "$TMP_DIR/health" -w '%{http_code}' "$_api/health" || true)
  if [ "$_h" = 200 ]; then ok "API health: $(cat "$TMP_DIR/health")"; else warn "API health returned $_h: $(cat "$TMP_DIR/health" 2>/dev/null)"; fi

  _c=$(curl -sS -m 30 -o /dev/null -w '%{http_code}' -X OPTIONS -H "Origin: $_fe" \
    -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type' \
    "$_api/api/assessments" || true)
  case $_c in 2??) ok "CORS allows $_fe" ;; *) warn "CORS preflight from $_fe returned $_c" ;; esac

  _a=$(curl -sS -m 30 -o /dev/null -w '%{http_code}' "$_api/api/assessments" || true)
  [ "$_a" = 401 ] && ok "Submission list is protected by ADMIN_API_KEY" || warn "GET /api/assessments without key returned $_a (expected 401)"

  # An empty login is rejected with 400 when accounts work, 503 when the database isn't reachable.
  _l=$(curl -sS -m 30 -o "$TMP_DIR/login" -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d '{}' "$_api/api/auth/login" || true)
  case $_l in
    400) ok "Login API is up (accounts database reachable)" ;;
    *) warn "POST /api/auth/login returned $_l (expected 400): $(cat "$TMP_DIR/login" 2>/dev/null)" ;;
  esac

  _f=$(curl -sS -m 30 -o /dev/null -w '%{http_code}' "$_fe/form/personal" || true)
  [ "$_f" = 200 ] && ok "Frontend is serving ($_fe)" || warn "Frontend returned $_f (a new CDN can take a few minutes)"
  _lp=$(curl -sS -m 30 -o /dev/null -w '%{http_code}' "$_fe/login" || true)
  [ "$_lp" = 200 ] && ok "Login page is serving" || warn "Login page returned $_lp"
}
