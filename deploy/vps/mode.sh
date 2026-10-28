#!/usr/bin/env bash
# Switch between an isolated client demo and production without external Azure KMS.
#
#   bash ./mode.sh demo   -> Staging, local preview encryption, OTP disabled
#   bash ./mode.sh live   -> Production, VPS file key ring + Twilio Verify
#   bash ./mode.sh status -> show current mode
#
# The key ring is stored under deploy/vps/secrets and must be backed up
# separately from PostgreSQL. Keep old key versions until their ciphertext is gone.
set -euo pipefail
cd "$(dirname "$0")"
ENV_FILE=".env"
KEYRING_FILE="./secrets/field-encryption-keyring.json"
[ -f "$ENV_FILE" ] || { echo "ERROR: $(pwd)/.env not found (copy .env.example first)."; exit 1; }

get() { local k="$1"; grep -E "^${k}=" "$ENV_FILE" | tail -n1 | cut -d= -f2- || true; }
set_kv() {
  local k="$1" v="$2"
  if grep -qE "^${k}=" "$ENV_FILE"; then
    awk -v k="$k" -v v="$v" 'BEGIN{FS=OFS="="} $1==k{print k"="v; next} {print}' "$ENV_FILE" > "$ENV_FILE.tmp"
    cat "$ENV_FILE.tmp" > "$ENV_FILE"; rm -f "$ENV_FILE.tmp"
  else
    printf '%s=%s\n' "$k" "$v" >> "$ENV_FILE"
  fi
}
prepare_keyring() {
  local allow_generate="$1"
  if [ "$(id -u)" -ne 0 ]; then
    echo "ERROR: Run as root so the key file can be mounted read-only to API uid 10001."
    exit 1
  fi

  if [ ! -s "$KEYRING_FILE" ]; then
    local key
    key="$(get FIELD_ENCRYPTION_LOCAL_KEY)"
    if [ -z "$key" ]; then
      if [ "$allow_generate" = "true" ]; then
        key="$(openssl rand -base64 32 | tr -d '\n')"
        echo "Generated a new field-encryption key; it will not be printed."
      else
        echo "Cannot go live: no existing key ring or FIELD_ENCRYPTION_LOCAL_KEY to preserve."
        echo "Do not generate a replacement until you have confirmed existing encrypted data can be read."
        exit 1
      fi
    fi

    local decoded_bytes
    decoded_bytes="$(printf '%s' "$key" | openssl base64 -d -A 2>/dev/null | wc -c | tr -d ' ')"
    if [ "$decoded_bytes" != "32" ]; then
      echo "ERROR: FIELD_ENCRYPTION_LOCAL_KEY must be Base64 for exactly 32 random bytes."
      exit 1
    fi

    mkdir -p "$(dirname "$KEYRING_FILE")"
    local temporary_file="$KEYRING_FILE.tmp.$$"
    (umask 077; printf '{"currentKeyId":"v1","legacyDirectKeyId":"v1","keys":{"v1":"%s"}}\n' "$key" > "$temporary_file")
    mv "$temporary_file" "$KEYRING_FILE"
    echo "Created the protected VPS field-encryption key ring."
  fi

  chown root:10001 "$KEYRING_FILE"
  chmod 0440 "$KEYRING_FILE"
  # The mounted secret is now the sole application source for this key.
  set_kv FIELD_ENCRYPTION_LOCAL_KEY ""
}
restart() {
  [ "${NO_RESTART:-0}" = "1" ] && { echo "NO_RESTART=1 -> .env updated, containers untouched."; return; }
  docker compose --env-file "$ENV_FILE" -f docker-compose.yml config -q
  docker compose --env-file "$ENV_FILE" -f docker-compose.yml up -d --build
}

case "${1:-}" in
  demo)
    prepare_keyring true
    set_kv APP_ENVIRONMENT Staging
    set_kv CLIENT_DEMO_MODE true
    set_kv VPS_FIELD_ENCRYPTION false
    set_kv EMAIL_OTP_ENABLED false
    set_kv BOOTSTRAP_RUN_ON_STARTUP true
    echo "Mode: DEMO (Staging, isolated file key ring, Atmaen OTP disabled)"
    restart
    ;;
  live)
    missing=()
    for k in TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_VERIFY_SERVICE_SID EMAIL_BREVO_API_KEY EMAIL_FROM_ADDRESS EMAIL_OTP_HASHING_KEY; do
      [ -n "$(get "$k")" ] || missing+=("$k")
    done
    if [ "${#missing[@]}" -gt 0 ]; then
      echo "Cannot go live. Fill these in $(pwd)/.env first:"; printf '  - %s\n' "${missing[@]}"; exit 1
    fi
    prepare_keyring false
    set_kv EMAIL_OTP_ENABLED true
    set_kv APP_ENVIRONMENT Production
    set_kv CLIENT_DEMO_MODE false
    set_kv VPS_FIELD_ENCRYPTION true
    set_kv BOOTSTRAP_RUN_ON_STARTUP false
    echo "Mode: LIVE (Production, VPS file key ring + Twilio Verify + email OTP; Azure Key Vault not required)"
    echo "Legacy local AES-GCM fields remain readable while their key id remains in the ring."
    echo "Azure Key Vault-encrypted fields cannot be opened by this provider and need migration with their original key."
    restart
    ;;
  status)
    echo "APP_ENVIRONMENT=$(get APP_ENVIRONMENT)  CLIENT_DEMO_MODE=$(get CLIENT_DEMO_MODE)  VPS_FIELD_ENCRYPTION=$(get VPS_FIELD_ENCRYPTION)  EMAIL_OTP_ENABLED=$(get EMAIL_OTP_ENABLED)  BOOTSTRAP_RUN_ON_STARTUP=$(get BOOTSTRAP_RUN_ON_STARTUP)"
    ;;
  *) echo "Usage: $0 {demo|live|status}"; exit 1 ;;
esac
