#!/usr/bin/env bash

set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "[FAIL] curl is required but not installed"
  exit 1
fi

BASE_URL="${1:-${RENDER_BASE_URL:-}}"

if [[ -z "${BASE_URL}" ]]; then
  cat <<'EOF'
Usage:
  ./tools/render_post_setup_check.sh <render-base-url>

Example:
  ./tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com

You can also set:
  RENDER_BASE_URL=https://wonderquest-learning.onrender.com
EOF
  exit 1
fi

BASE_URL="${BASE_URL%/}"

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

fetch_route() {
  local route="$1"
  local tmp_file="$2"
  local url="${BASE_URL}${route}"

  local http_code
  http_code="$(curl -LsS -o "${tmp_file}" -w '%{http_code}' "${url}")"
  printf '%s\n' "${http_code}"
}

check_route_contains() {
  local route="$1"
  local expected="$2"
  local description="$3"
  local tmp_file

  tmp_file="$(mktemp)"
  local http_code
  http_code="$(fetch_route "${route}" "${tmp_file}")"

  if [[ "${http_code}" != "200" ]]; then
    fail "${description}: expected HTTP 200, got ${http_code}"
    rm -f "${tmp_file}"
    return
  fi

  if grep -Fq "${expected}" "${tmp_file}"; then
    pass "${description}"
  else
    fail "${description}: expected content not found"
  fi

  rm -f "${tmp_file}"
}

section "WonderQuest Render Post-Setup Check"
printf 'Base URL: %s\n' "${BASE_URL}"

section "Public Route Checks"
check_route_contains "/" "WonderQuest Learning" "Home page loads"
check_route_contains "/child" "Child journey" "Child route loads"
check_route_contains "/parent" "Parent journey" "Parent route loads"
check_route_contains "/owner" "Unlock owner console" "Owner gate loads"
check_route_contains "/teacher" "Unlock teacher dashboard" "Teacher gate loads"

section "Runtime Signal Checks"
home_tmp="$(mktemp)"
home_status="$(fetch_route "/" "${home_tmp}")"

if [[ "${home_status}" == "200" ]]; then
  if grep -Fq "showing fallback plan data" "${home_tmp}"; then
    warn "Home page is serving fallback launch data instead of live counts"
  else
    pass "Home page is not showing fallback launch-data warning"
  fi

  if grep -Fq "Supabase live" "${home_tmp}"; then
    pass "Home page shows live Supabase source signal"
  else
    warn "Home page does not explicitly show the live Supabase source signal"
  fi
else
  fail "Home page runtime signal check failed because HTTP status was ${home_status}"
fi

rm -f "${home_tmp}"

section "Summary"
printf 'Passes: %d\n' "${PASS_COUNT}"
printf 'Warnings: %d\n' "${WARN_COUNT}"
printf 'Failures: %d\n' "${FAIL_COUNT}"

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi

exit 0
