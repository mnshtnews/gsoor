#!/usr/bin/env bash
# Switch the deployment between CLIENT DEMO and LIVE (production) without touching code.
#
#   ./mode.sh demo   -> works with NO Twilio / Azure values (Atmaen phone-OTP is disabled)
#   ./mode.sh live   -> real Azure Key Vault + Twilio; refuses to switch until they are filled in
#   ./mode.sh status -> show the current mode
#
# Add NO_RESTART=1 to only edit .env and skip the docker rebuild.
set -euo pipefail
cd "$(dirname "$0")"
ENV_FILE=".env"
[ -f "$ENV_FILE" ] || { echo "ERROR: $(pwd)/.env not found (copy .env.example first)."; exit 1; }

get() { grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2- || true; }
set_kv() {
  local k="$1" v="$2"
  if grep -qE "^${k}=" "$ENV_FILE"; then
    awk -v k="$k" -v v="$v" 'BEGIN{FS=OFS="="} $1==k{print k"="v; next} {print}' "$ENV_FILE" > "$ENV_FILE.tmp"
    cat "$ENV_FILE.tmp" > "$ENV_FILE"; rm -f "$ENV_FILE.tmp"   # keep original file permissions
  else
    printf '%s=%s\n' "$k" "$v" >> "$ENV_FILE"
  fi
}
restart() {
  [ "${NO_RESTART:-0}" = "1" ] && { echo "NO_RESTART=1 -> .env updated, containers untouched."; return; }
  docker compose --env-file "$ENV_FILE" -f docker-compose.yml up -d --build
}

case "${1:-}" in
  demo)
    set_kv APP_ENVIRONMENT Staging
    set_kv CLIENT_DEMO_MODE true
    set_kv BOOTSTRAP_RUN_ON_STARTUP true      # applies migrations + creates the NEWSROOM_* accounts
    if [ -z "$(get FIELD_ENCRYPTION_LOCAL_KEY)" ]; then
      set_kv FIELD_ENCRYPTION_LOCAL_KEY "$(openssl rand -base64 32)"
      echo "Generated FIELD_ENCRYPTION_LOCAL_KEY (keep it stable; do not change it once data exists)."
    fi
    echo "Mode: DEMO  (Staging, Twilio/Azure not required, Atmaen OTP disabled)"
    restart
    ;;
  live)
    missing=()
    for k in FIELD_ENCRYPTION_KEY_VAULT_URI FIELD_ENCRYPTION_KEY_NAME AZURE_CLIENT_ID AZURE_TENANT_ID \
             AZURE_CLIENT_SECRET TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_VERIFY_SERVICE_SID; do
      [ -n "$(get "$k")" ] || missing+=("$k")
    done
    if [ "${#missing[@]}" -gt 0 ]; then
      echo "Cannot go live. Fill these in $(pwd)/.env first:"; printf '  - %s\n' "${missing[@]}"; exit 1
    fi
    set_kv APP_ENVIRONMENT Production
    set_kv CLIENT_DEMO_MODE false
    set_kv BOOTSTRAP_RUN_ON_STARTUP false
    echo "Mode: LIVE  (Production, Azure Key Vault + Twilio Verify)"
    echo "NOTE: anything encrypted with the demo local key is NOT readable via Azure Key Vault."
    echo "      In demo mode Atmaen OTP is off, so no Atmaen cases can exist yet - normally nothing is lost."
    echo "      Demo articles/media stay; clear them with scripts/reset-trial-content.sql if you want a clean start."
    restart
    ;;
  status)
    echo "APP_ENVIRONMENT=$(get APP_ENVIRONMENT)  CLIENT_DEMO_MODE=$(get CLIENT_DEMO_MODE)  BOOTSTRAP_RUN_ON_STARTUP=$(get BOOTSTRAP_RUN_ON_STARTUP)"
    ;;
  *) echo "Usage: $0 {demo|live|status}"; exit 1 ;;
esac
