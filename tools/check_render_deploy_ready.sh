#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${REPO_ROOT}/app"
ENV_FILE="${APP_DIR}/.env.local"
RENDER_FILE="${REPO_ROOT}/render.yaml"

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '[PASS] %s\n' "$1"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf '[WARN] %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '[FAIL] %s\n' "$1"
}

section() {
  printf '\n== %s ==\n' "$1"
}

env_value() {
  local key="$1"
  if [[ ! -f "${ENV_FILE}" ]]; then
    return 1
  fi

  local line
  line="$(grep -E "^${key}=" "${ENV_FILE}" | tail -n 1 || true)"
  if [[ -z "${line}" ]]; then
    return 1
  fi

  printf '%s\n' "${line#*=}"
}

check_required_file() {
  local path="$1"
  local label="$2"

  if [[ -f "${path}" ]]; then
    pass "${label} exists"
  else
    fail "${label} is missing at ${path}"
  fi
}

check_required_env() {
  local key="$1"

  if value="$(env_value "${key}")" && [[ -n "${value}" ]]; then
    pass "${key} present in app/.env.local"
  else
    fail "${key} missing from app/.env.local"
  fi
}

section "WonderQuest Render Deploy Readiness"
printf 'Repo: %s\n' "${REPO_ROOT}"

section "File Checks"
check_required_file "${RENDER_FILE}" "render.yaml"
check_required_file "${APP_DIR}/package.json" "app/package.json"
check_required_file "${APP_DIR}/src/app/page.tsx" "app entry page"

section "Environment Checks"
if [[ -f "${ENV_FILE}" ]]; then
  pass "app/.env.local exists"
else
  fail "app/.env.local is missing"
fi

required_envs=(
  NEXT_PUBLIC_APP_NAME
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_DB_HOST
  SUPABASE_DB_PORT
  SUPABASE_DB_NAME
  SUPABASE_DB_USER
  SUPABASE_DB_PASSWORD
  SUPABASE_DB_SSLMODE
  OWNER_ACCESS_CODE
  TEACHER_ACCESS_CODE
)

for key in "${required_envs[@]}"; do
  check_required_env "${key}"
done

db_host="$(env_value SUPABASE_DB_HOST || true)"
db_user="$(env_value SUPABASE_DB_USER || true)"
db_sslmode="$(env_value SUPABASE_DB_SSLMODE || true)"
owner_code="$(env_value OWNER_ACCESS_CODE || true)"
teacher_code="$(env_value TEACHER_ACCESS_CODE || true)"

if [[ -n "${db_host}" ]]; then
  if [[ "${db_host}" == *"pooler.supabase.com" ]]; then
    pass "SUPABASE_DB_HOST uses Supabase session pooler"
  else
    fail "SUPABASE_DB_HOST is not using the Supabase session pooler host"
  fi

  if [[ "${db_host}" == db.* ]]; then
    fail "SUPABASE_DB_HOST looks like the direct database host; Render needs the pooler host"
  fi
fi

if [[ -n "${db_user}" ]]; then
  if [[ "${db_user}" == "postgres" ]]; then
    fail "SUPABASE_DB_USER is plain postgres; Render should use the pooler username"
  elif [[ "${db_user}" == *.* ]]; then
    pass "SUPABASE_DB_USER looks like a pooler username"
  else
    warn "SUPABASE_DB_USER does not look like the usual pooler username format"
  fi
fi

if [[ "${db_sslmode}" == "require" ]]; then
  pass "SUPABASE_DB_SSLMODE is require"
else
  fail "SUPABASE_DB_SSLMODE should be require"
fi

for code_key in owner_code teacher_code; do
  code_value="${!code_key}"
  code_label="$( [[ "${code_key}" == "owner_code" ]] && echo OWNER_ACCESS_CODE || echo TEACHER_ACCESS_CODE )"

  if [[ -z "${code_value}" ]]; then
    fail "${code_label} is empty"
  elif [[ "${code_value}" == choose_* ]]; then
    fail "${code_label} still looks like a placeholder"
  else
    pass "${code_label} is populated"
  fi
done

section "Render Blueprint Checks"
if grep -q 'rootDir: app' "${RENDER_FILE}"; then
  pass "render.yaml rootDir points to app"
else
  fail "render.yaml rootDir is not set to app"
fi

if grep -q 'buildCommand: npm ci && npm run build' "${RENDER_FILE}"; then
  pass "render.yaml uses npm ci && npm run build"
else
  fail "render.yaml buildCommand is not the expected npm ci && npm run build"
fi

if grep -q 'startCommand: npm run start' "${RENDER_FILE}"; then
  pass "render.yaml uses npm run start"
else
  fail "render.yaml startCommand is not npm run start"
fi

section "Package Script Checks"
if node --input-type=module <<'EOF' "${APP_DIR}/package.json"
import fs from "node:fs";
const pkgPath = process.argv[1];
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const required = ["build", "start", "smoke:local"];
const missing = required.filter((key) => !pkg.scripts?.[key]);
if (missing.length) {
  console.error(`Missing scripts: ${missing.join(", ")}`);
  process.exit(1);
}
EOF
then
  pass "app/package.json has build, start, and smoke:local scripts"
else
  fail "app/package.json is missing one or more required scripts"
fi

section "Git Checks"
if git -C "${REPO_ROOT}" diff --quiet && git -C "${REPO_ROOT}" diff --cached --quiet; then
  pass "git worktree is clean"
else
  warn "git worktree has local changes"
fi

branch_name="$(git -C "${REPO_ROOT}" rev-parse --abbrev-ref HEAD)"
commit_hash="$(git -C "${REPO_ROOT}" rev-parse --short HEAD)"
printf 'Current branch: %s\n' "${branch_name}"
printf 'Current commit: %s\n' "${commit_hash}"

section "Build Check"
if (cd "${APP_DIR}" && npm run build >/tmp/wonderquest-render-build.log 2>&1); then
  pass "npm run build passed"
else
  fail "npm run build failed; see /tmp/wonderquest-render-build.log"
fi

section "Smoke Note"
warn "smoke:local is not run by this script because it requires the app server to be running separately"

section "Summary"
printf 'Passes: %d\n' "${PASS_COUNT}"
printf 'Warnings: %d\n' "${WARN_COUNT}"
printf 'Failures: %d\n' "${FAIL_COUNT}"

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi

exit 0
