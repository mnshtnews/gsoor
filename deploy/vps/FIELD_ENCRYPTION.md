# VPS field-encryption key management

Production can use the `vps-keyring` provider instead of Azure Key Vault. The API uses envelope encryption: every field receives a fresh AES-256 data key, and the host-held 256-bit key ring wraps that data key. Docker Compose mounts `secrets/field-encryption-keyring.json` read-only into the API container; the runtime image runs as UID/GID 10001.

## Existing data is the first deployment gate

Do not enable `VPS_FIELD_ENCRYPTION=true` until the key ring contains the key that encrypted the existing data. The provider can read the old local AES-GCM format when its original key is retained as `legacyDirectKeyId`. It cannot decrypt Azure Key Vault envelopes without the original Key Vault key and credentials. It fails closed on those records; it will not replace or discard them.

The encrypted database fields are `Cases.SubjectName`, `Cases.SubjectContactPhone`, `Cases.ConcernDescription`, `Cases.ApplicantPhoneE164`, and `AlertEmailSubscriptions.Email`. Before switching providers, use a PostgreSQL backup and determine which encrypted fields are present and which provider encrypted them. If any Azure-encrypted fields exist, keep Azure available and migrate/decrypt/re-encrypt those fields with a reviewed one-time migration before removing Azure. Never just generate a replacement key. A zero count of sensitive records is not enough if other tables contain encrypted fields; inspect the model's encrypted properties.

## VPS installation

1. Deploy the source changes to `/opt/gsoor` and preserve the existing PostgreSQL volume and `.env`.
2. As root, run `cd /opt/gsoor/deploy/vps && bash ./mode.sh live`.
3. The script imports the existing `FIELD_ENCRYPTION_LOCAL_KEY` to a protected key ring if no ring exists, changes that env setting to empty, sets production flags and recreates services. It refuses to invent a live key when neither a key ring nor a preserved key exists.
4. Confirm the API is healthy and submit a harmless encryption-backed workflow in staging before using live Atmaen reports.

Twilio Verify values are still required for SMS OTP. Azure Translator is an independent feature; it may remain configured or disabled separately.

## Backup and rotation

Back up `secrets/field-encryption-keyring.json` separately from the database, encrypt the backup, restrict access, and test restoration. A database backup without the matching ring cannot recover encrypted fields. A ring backup without database encryption is also sensitive. Keep old key versions in `keys` while any envelopes refer to them. For rotation, add a new 32-byte key under a new ID and set `currentKeyId` to it; retain old keys for decryption. `legacyDirectKeyId` must continue to identify the original direct AES-GCM key until all legacy-format values have been re-encrypted.

This VPS-local design avoids an Azure subscription and helps protect database-only backups. The VPS stores both the application and key, so it does not provide protection against complete VPS compromise or independent key custody. For stronger isolation, use a separately managed KMS/HSM and tested recovery procedures.
