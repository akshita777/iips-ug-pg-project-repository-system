#!/usr/bin/env bash
# One-time seed of E2E test accounts against the running backend.
# Approved write: creates 6 accounts tagged e2e-*. Rerun-safe (skips existing).
# Usage: ./seed-e2e-users.sh [BASE_URL]
set -euo pipefail
BASE="${1:-http://localhost:8080}"
PW='E2eTest123!'

register() { # name email role roll semester
  local name="$1" email="$2" role="$3" roll="${4:-}" sem="${5:-}"
  # Skip if the account already exists (login succeeds).
  if curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "$BASE/api/v1/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$email\",\"password\":\"$PW\"}" | grep -q "200"; then
    echo "EXISTS $email"
    return 0
  fi
  local body="{\"name\":\"$name\",\"email\":\"$email\",\"password\":\"$PW\",\"role\":\"$role\""
  [[ -n "$roll" ]] && body+=",\"rollNumber\":\"$roll\",\"semester\":$sem"
  body+="}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -X POST "$BASE/api/v1/auth/register" \
      -H "Content-Type: application/json" -d "$body")
  echo "$code $email"
}

register "E2E Admin"        "e2e-admin@test.local"       "ADMIN"     "" "" 
register "E2E Coordinator"  "e2e-coordinator@test.local" "COORDINATOR" "" ""
register "E2E Guide"        "e2e-guide@test.local"       "FACULTY"   "" ""
register "E2E Evaluator"    "e2e-evaluator@test.local"   "EVALUATOR" "" ""
register "Aarav E2E"        "e2e-student-a@test.local"   "STUDENT"   "IC2k22-90" 6
register "Zara E2E"         "e2e-student-b@test.local"   "STUDENT"   "IC2k22-91" 6
