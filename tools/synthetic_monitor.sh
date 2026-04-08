#!/usr/bin/env bash
# Synthetic monitoring script for WonderQuest Learning
# Usage: BASE_URL=https://... bash synthetic_monitor.sh [--quiet]

set -euo pipefail

BASE_URL="${BASE_URL:-https://wonderquest-learning.onrender.com}"
QUIET=0
if [[ "${1:-}" == "--quiet" ]]; then
  QUIET=1
fi

PASS=0
FAIL=0
FAILURES=()

check() {
  local name="$1"
  local url="$2"
  local expected_status="$3"        # e.g. "200" or "200|30[0-9]" or "401|403"
  local body_pattern="${4:-}"       # optional grep pattern to match in body

  local response
  response=$(curl -s -o /tmp/wq_monitor_body -w "%{http_code}" \
    --max-time 15 \
    -L \
    -H "User-Agent: WonderQuest-SyntheticMonitor/1.0" \
    "$url" 2>/dev/null || echo "000")

  local body
  body=$(cat /tmp/wq_monitor_body 2>/dev/null || echo "")

  local status_ok=0
  if echo "$response" | grep -qE "^(${expected_status})$"; then
    status_ok=1
  fi

  local body_ok=1
  if [[ -n "$body_pattern" ]]; then
    body_ok=0
    if echo "$body" | grep -qE "$body_pattern"; then
      body_ok=1
    fi
  fi

  if [[ $status_ok -eq 1 && $body_ok -eq 1 ]]; then
    PASS=$((PASS + 1))
    if [[ $QUIET -eq 0 ]]; then
      printf "  PASS  %-50s (HTTP %s)\n" "$name" "$response"
    fi
  else
    FAIL=$((FAIL + 1))
    local reason=""
    if [[ $status_ok -eq 0 ]]; then
      reason="got HTTP $response, expected $expected_status"
    else
      reason="HTTP $response OK but body did not match pattern: $body_pattern"
    fi
    FAILURES+=("FAIL  $name — $reason")
    if [[ $QUIET -eq 0 ]]; then
      printf "  FAIL  %-50s (HTTP %s — expected %s)\n" "$name" "$response" "$expected_status"
    fi
  fi
}

echo ""
echo "WonderQuest Synthetic Monitor"
echo "Target: $BASE_URL"
echo "----------------------------------------"
if [[ $QUIET -eq 0 ]]; then
  echo ""
fi

# 1. Health endpoint
check "GET /api/health → 200 + ok" \
  "$BASE_URL/api/health" \
  "200" \
  '"ok"[[:space:]]*:[[:space:]]*(true|"ok")'

# 2. Home page
check "GET / → 200" \
  "$BASE_URL/" \
  "200"

# 3. Parent portal (auth redirect acceptable)
check "GET /parent → 200 or 3xx" \
  "$BASE_URL/parent" \
  "200|30[0-9]"

# 4. Teacher portal (auth redirect acceptable)
check "GET /teacher → 200 or 3xx" \
  "$BASE_URL/teacher" \
  "200|30[0-9]"

# 5. Owner portal (auth redirect acceptable)
check "GET /owner → 200 or 3xx" \
  "$BASE_URL/owner" \
  "200|30[0-9]"

# 6. Child portal
check "GET /child → 200" \
  "$BASE_URL/child" \
  "200"

# 7. Play page (auth redirect acceptable)
check "GET /play → 200 or 3xx" \
  "$BASE_URL/play" \
  "200|30[0-9]"

# 8. Auth gate: /api/child/quest without auth → 401 or 403
check "GET /api/child/quest (no auth) → 401 or 403" \
  "$BASE_URL/api/child/quest" \
  "401|403"

# 9. Auth gate: /api/teacher/class without auth → 401 or 403
check "GET /api/teacher/class (no auth) → 401 or 403" \
  "$BASE_URL/api/teacher/class" \
  "401|403"

# 10. Auth gate: /api/owner/overview without auth → 401 or 403
check "GET /api/owner/overview (no auth) → 401 or 403" \
  "$BASE_URL/api/owner/overview" \
  "401|403"

TOTAL=$((PASS + FAIL))

echo ""
echo "========================================"
echo "Summary: $PASS/$TOTAL checks passed"

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for f in "${FAILURES[@]}"; do
    echo "  $f"
  done
fi

echo ""

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi

exit 0
