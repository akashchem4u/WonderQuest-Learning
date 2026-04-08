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

check_route_status() {
  local route="$1"
  local expected_status="$2"
  local description="$3"
  local method="${4:-GET}"
  local tmp_file

  tmp_file="$(mktemp)"
  local http_code
  http_code="$(curl -LsS -X "${method}" -o "${tmp_file}" -w '%{http_code}' "${BASE_URL}${route}")"

  if [[ "${http_code}" == "${expected_status}" ]]; then
    pass "${description}"
  else
    fail "${description}: expected HTTP ${expected_status}, got ${http_code}"
  fi

  rm -f "${tmp_file}"
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

check_route_contains_any() {
  local route="$1"
  local description="$2"
  shift 2
  local tmp_file

  tmp_file="$(mktemp)"
  local http_code
  http_code="$(fetch_route "${route}" "${tmp_file}")"

  if [[ "${http_code}" != "200" ]]; then
    fail "${description}: expected HTTP 200, got ${http_code}"
    rm -f "${tmp_file}"
    return
  fi

  local expected
  for expected in "$@"; do
    if grep -Fq "${expected}" "${tmp_file}"; then
      pass "${description}"
      rm -f "${tmp_file}"
      return
    fi
  done

  fail "${description}: expected content not found"
  rm -f "${tmp_file}"
}

section "WonderQuest Render Post-Setup Check"
printf 'Base URL: %s\n' "${BASE_URL}"

section "Public Route Checks"
check_route_contains "/" "WonderQuest Learning" "Home page loads"
check_route_contains_any "/child" "Child route loads" \
  "Start your adventure" \
  "Sign in to continue your quests." \
  "Sign In & Play"
check_route_contains_any "/parent" "Parent route loads" \
  "Family Hub" \
  "learning adventure" \
  "This portal is for parents and guardians only."
check_route_contains_any "/owner" "Owner gate loads" \
  "Ops Console" \
  "WQ Console" \
  "Good morning"
check_route_contains_any "/teacher" "Teacher gate loads" \
  "Sign in to teacher dashboard" \
  "Teacher access" \
  "Enter your teacher username and password."

section "Runtime Signal Checks"
home_tmp="$(mktemp)"
home_status="$(fetch_route "/" "${home_tmp}")"

if [[ "${home_status}" == "200" ]]; then
  if grep -Fq "showing fallback plan data" "${home_tmp}"; then
    warn "Home page is serving fallback launch data instead of live counts"
  else
    pass "Home page is not showing fallback launch-data warning"
  fi

  if grep -Fq "All systems operational" "${home_tmp}" || \
    grep -Fq "Live learning flows" "${home_tmp}" || \
    grep -Fq "Supabase live" "${home_tmp}"; then
    pass "Home page shows live Supabase source signal"
  else
    warn "Home page does not explicitly show the live Supabase source signal"
  fi
else
  fail "Home page runtime signal check failed because HTTP status was ${home_status}"
fi

rm -f "${home_tmp}"

health_tmp="$(mktemp)"
health_status="$(fetch_route "/api/health" "${health_tmp}")"

if [[ "${health_status}" != "200" ]]; then
  fail "Health route returns HTTP 200: got ${health_status}"
else
  pass "Health route returns HTTP 200"

  if grep -Fq '"status":"ok"' "${health_tmp}"; then
    pass "Health route reports ok"
  else
    fail 'Health route did not report `"status":"ok"`'
  fi

  if grep -Fq '"liveQuestionGenerationEnabled":true' "${health_tmp}"; then
    pass "Health route reports live question generation enabled"
  else
    warn "Health route does not report live question generation enabled"
  fi
fi

rm -f "${health_tmp}"

section "Auth Gate Checks"
check_route_status "/api/parent/activity" "401" "Parent activity route is parent-gated"
check_route_status "/api/parent/reset-child-pin" "401" "Parent reset-child-pin route is parent-gated" "POST"
check_route_status "/api/teacher/class" "401" "Teacher class route is teacher-gated"
check_route_status "/api/teacher/skills" "401" "Teacher skills route is teacher-gated"
check_route_status "/api/teacher/interventions" "401" "Teacher interventions route is teacher-gated"
check_route_status "/api/owner/overview" "401" "Owner overview route is owner-gated"
check_route_status "/api/owner/feedback" "401" "Owner feedback route is owner-gated"

section "Summary"
printf 'Passes: %d\n' "${PASS_COUNT}"
printf 'Warnings: %d\n' "${WARN_COUNT}"
printf 'Failures: %d\n' "${FAIL_COUNT}"

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  exit 1
fi

exit 0
