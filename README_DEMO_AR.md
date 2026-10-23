# تشغيل جسور في وضع العرض (Demo) بدون Twilio / Azure

## المشكلة كانت إيه؟
`deploy/vps/docker-compose.yml` كان مُعرّف قيم Twilio و Azure بـ `:?` يعني **إجبارية**.
لما كانت فاضية، `docker compose` كان بيقف قبل ما يشغّل أي حاجة.
والكود نفسه فيه وضع `ClientDemoMode` معمول للحالة دي (التشفير محلي، وتحقق الـ OTP متعطّل)، بس الـ compose ماكانش بيفعّله.

## اللي اتغيّر (4 ملفات)
| الملف | التغيير |
|---|---|
| `deploy/vps/docker-compose.yml` | Twilio/Azure بقوا اختياريين + مفتاح `CLIENT_DEMO_MODE` + 5 خانات حسابات |
| `deploy/vps/mode.sh` (جديد) | سكربت التبديل: `demo` / `live` / `status` |
| `deploy/vps/.env.example` | المتغيرات الجديدة |
| `backend/.../DevelopmentNewsroomSeeder.cs` | حقل `Role` اختياري (عشان 3 حسابات يبقوا كلهم `EditorInChief`) |

## الخطوات على السيرفر
1. فك الـ patch فوق المشروع (يستبدل الملفات الأربعة).
2. افتح `deploy/vps/.env` وضيف الحسابات في آخره (`NEWSROOM_1..3`).
3. شغّل:
   ```bash
   cd deploy/vps
   chmod +x mode.sh
   ./mode.sh demo
   ```
   السكربت بيظبط: `APP_ENVIRONMENT=Staging`, `CLIENT_DEMO_MODE=true`, `BOOTSTRAP_RUN_ON_STARTUP=true`، وبيولّد `FIELD_ENCRYPTION_LOCAL_KEY` لو مش موجود، وبعدين يعمل rebuild.
4. اتأكد:
   ```bash
   curl https://api.gosour.net/healthz
   docker compose --env-file .env -f docker-compose.yml logs api | tail -30
   ```
   لازم تلاقي تحذير `CLIENT DEMO MODE ENABLED` ورسالة `Development newsroom account ensured for role EditorInChief`.
5. دخول الـ CMS: `https://gosour.net/cms/login`

## لما تجيب قيم Twilio و Azure
1. حطهم في `deploy/vps/.env`:
   `FIELD_ENCRYPTION_KEY_VAULT_URI`, `FIELD_ENCRYPTION_KEY_NAME`, `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`
2. شغّل `./mode.sh live`. لو ناقص أي قيمة هيرفض ويقولك إيه الناقص.

للرجوع لوضع العرض في أي وقت: `./mode.sh demo`.

## تنبيهات
- في وضع العرض **إرسال حالات اطمّن (Atmaen) مش هيشتغل** (الـ OTP متعطّل عمداً)، فمتجربهوش قدام العميل.
- ماتدخّلش بيانات حقيقية لأي حالة في وضع العرض.
- الحسابات بتتعمل مرة واحدة؛ لو الحساب موجود، الباسورد **مش بيتغيّر** من الـ `.env`.
- لا تحفظ `deploy/vps/.env` في Git ولا ترفعه في zip (فيه JWT و Supabase service key).
