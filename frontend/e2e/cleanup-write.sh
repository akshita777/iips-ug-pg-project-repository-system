#!/usr/bin/env bash
# Deletes every row the E2E_WRITE run created, then removes the storage objects.
# Idempotent: safe to run twice or after a partial run. Reads secrets from
# backend/.env.local (never committed, never logged).
set -u
HERE="$(dirname "$0")"
ART="$HERE/.auth/write-artifacts.json"
ENV="$HERE/../../backend/.env.local"

if [[ ! -f "$ART" ]]; then
  echo "cleanup: no artifacts file, nothing to do"
  exit 0
fi

# shellcheck disable=SC1090
set -a; source "$ENV"; set +a
export PGPASSWORD="$DB_PASSWORD"
PSQL=(psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-postgres}" -v ON_ERROR_STOP=1 -t -A -c)

jq -e . "$ART" >/dev/null 2>&1 || { echo "cleanup: artifacts file is not valid JSON"; exit 0; }
PID=$(jq -r '.projectId // empty' "$ART")
[[ -z "$PID" ]] && { echo "cleanup: no project id recorded"; exit 0; }
echo "cleanup: removing probe project $PID and its rows"

"${PSQL[@]}" "DELETE FROM evaluations WHERE project_id = $PID;
DELETE FROM code_reviews WHERE project_id = $PID;
DELETE FROM submission_versions WHERE project_id = $PID;
DELETE FROM team_members WHERE project_id = $PID;
DELETE FROM wiki_pages WHERE project_id = $PID;
DELETE FROM guide_allocations WHERE project_id = $PID;
DELETE FROM notifications WHERE project_id = $PID;" 2>&1 | tail -2

# Preferences reference students, not projects.
"${PSQL[@]}" "DELETE FROM guide_preferences WHERE student_id IN (5, 6);" 2>&1 | tail -1

SID=$(jq -r '.slotId // empty' "$ART")
[[ -n "$SID" ]] && "${PSQL[@]}" "DELETE FROM review_slots WHERE id = $SID;" 2>&1 | tail -1

WID=$(jq -r '.windowId // empty' "$ART")
[[ -n "$WID" ]] && "${PSQL[@]}" "DELETE FROM deadline_windows WHERE id = $WID;" 2>&1 | tail -1

RID=$(jq -r '.rubricId // empty' "$ART")
[[ -n "$RID" ]] && "${PSQL[@]}" "DELETE FROM rubrics WHERE id = $RID;" 2>&1 | tail -1

if [[ "$(jq -r '.mentorCreated // false' "$ART")" == "true" ]]; then
  MID=$(jq -r '.mentorId // empty' "$ART")
  [[ -n "$MID" ]] && "${PSQL[@]}" "DELETE FROM batch_mentors WHERE id = $MID;" 2>&1 | tail -1
fi

"${PSQL[@]}" "DELETE FROM projects WHERE id = $PID;" 2>&1 | tail -1

# Fresh accounts created by the register-form tests (no children, safe).
"${PSQL[@]}" "DELETE FROM users WHERE email LIKE 'e2e-new-%@test.local';" 2>&1 | tail -1

# Storage objects uploaded during the run.
if [[ -n "${SUPABASE_URL:-}" && -n "${SUPABASE_SERVICE_KEY:-}" ]]; then
  BUCKET="${STORAGE_BUCKET:-project-files}"
  for OBJ in $(jq -r '.versionPaths // [] | .[]' "$ART"); do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
      "$SUPABASE_URL/storage/v1/object/$BUCKET/$OBJ" \
      -H "apikey: $SUPABASE_SERVICE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
    echo "storage delete $OBJ -> $CODE"
  done
fi

mv "$ART" "$ART.cleaned-$(date +%s)"
echo "cleanup: done"
