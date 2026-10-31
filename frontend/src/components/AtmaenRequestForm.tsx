"use client";

import { useEffect, useState } from "react";
import { useUiLocale } from "@/lib/use-ui-locale";

type Country = { id: string; nameAr: string; nameEn: string; isoCode2: string };
type City = { id: string; countryId: string; nameAr: string; nameEn: string };
type Step = "details" | "verify" | "success";
type FormState = { countryId: string; cityId: string; subjectName: string; subjectContactPhone: string; concernDescription: string; shareCommunityUpdate: boolean; communityMessage: string; applicantPhoneE164: string; otpCode: string };

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const INITIAL: FormState = { countryId: "", cityId: "", subjectName: "", subjectContactPhone: "", concernDescription: "", shareCommunityUpdate: false, communityMessage: "", applicantPhoneE164: "", otpCode: "" };

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string; errors?: { message: string }[] };
    throw new Error(data.errors?.map((error) => error.message).join("، ") || data.message || "تعذّر إتمام الطلب الآن. حاول مرة أخرى لاحقًا.");
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}

export function AtmaenRequestForm() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState<Step>("details");
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { locale, t } = useUiLocale();

  useEffect(() => {
    let live = true;
    void request<Country[]>("/api/v1/geography/countries")
      .then((items) => { if (live) setCountries(items); })
      .catch((reason: unknown) => { if (live) setError(reason instanceof Error ? reason.message : t("تعذّر تحميل دليل الدول.")); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [t]);

  useEffect(() => {
    if (!form.countryId) { setCities([]); return; }
    let live = true;
    setForm((current) => ({ ...current, cityId: "" }));
    void request<City[]>(`/api/v1/geography/countries/${encodeURIComponent(form.countryId)}/cities`)
      .then((items) => { if (live) setCities(items); })
      .catch((reason: unknown) => { if (live) setError(reason instanceof Error ? reason.message : t("تعذّر تحميل المدن.")); });
    return () => { live = false; };
  }, [form.countryId, t]);

  function change<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!consented) { setError(t("يرجى الموافقة على استخدام البيانات لمعالجة البلاغ قبل المتابعة.")); return; }
    setBusy(true);
    try {
      await request("/api/v1/atmaen/verification-requests", { applicantPhoneE164: form.applicantPhoneE164.trim() });
      setStep("verify");
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("تعذّر إرسال رمز التحقق.")); }
    finally { setBusy(false); }
  }

  async function submitCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      await request("/api/v1/atmaen/cases", {
        countryId: form.countryId, cityId: form.cityId, subjectName: form.subjectName.trim(),
        subjectContactPhone: form.subjectContactPhone.trim() || null, concernDescription: form.concernDescription.trim(),
        applicantPhoneE164: form.applicantPhoneE164.trim(), otpCode: form.otpCode.trim(), shareCommunityUpdate: form.shareCommunityUpdate, communityMessage: form.shareCommunityUpdate ? form.communityMessage.trim() : null,
      });
      setStep("success");
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("تعذّر إرسال البلاغ.")); }
    finally { setBusy(false); }
  }

  return <section className="atmaen-form-card" aria-labelledby="atmaen-form-title" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="atmaen-form-head"><span className="atmaen-form-icon" aria-hidden="true">🛟</span><div><span className="atmaen-form-eyebrow">{t("خدمة جسور المجتمعية")}</span><h2 id="atmaen-form-title">{t("اطمّن على مغتربك")}</h2><p>{t("أرسل بلاغًا آمنًا عن شخص تريد الاطمئنان عليه. لن تظهر بيانات البلاغ للعموم.")}</p></div></div>
    {step !== "success" && <ol className="atmaen-steps" aria-label={t("خطوات إرسال البلاغ")}><li className={step === "details" ? "current" : "done"}><span>١</span><span>{t("تفاصيل البلاغ")}</span></li><li className={step === "verify" ? "current" : ""}><span>٢</span><span>{t("تأكيد رقمك")}</span></li></ol>}
    {error && <div className="atmaen-form-error" role="alert">{t(error)}</div>}
    {loading ? <div className="atmaen-form-loading" role="status">{t("جارٍ تحميل دليل الدول…")}</div> : countries.length === 0 ? <div className="atmaen-form-error" role="status">{t("خدمة البلاغات قيد التجهيز في هذه البيئة. يجب على إدارة جسور إضافة الدول والمدن من دليل المواقع قبل استقبال البلاغات.")}</div> : step === "success" ? <div className="atmaen-form-success" role="status"><span aria-hidden="true">✓</span><h3>{t("تم استلام البلاغ")}</h3><p>{t("وصلت المعلومات إلى فريق المتابعة المختص. لا تشارك بيانات الحالة أو أرقام التواصل علنًا.")}</p><a className="atmaen-submit" href="/atmaen/community">{t("تصفّح تحديثات المجتمع العامة")}</a><button type="button" className="atmaen-submit" onClick={() => { setForm(INITIAL); setConsented(false); setStep("details"); }}>{t("إرسال بلاغ آخر")}</button></div> : step === "details" ? <form className="atmaen-form" onSubmit={(event) => void sendCode(event)}>
      <div className="atmaen-form-grid">
        <label><span>{t("الدولة التي يوجد بها الشخص")} <b>*</b></span><select required value={form.countryId} onChange={(event) => change("countryId", event.target.value)}><option value="">{t("اختر الدولة")}</option>{countries.map((country) => <option key={country.id} value={country.id}>{locale === "ar" ? country.nameAr : country.nameEn}</option>)}</select></label>
        <label><span>{t("المدينة")} <b>*</b></span><select required value={form.cityId} onChange={(event) => change("cityId", event.target.value)} disabled={!form.countryId || cities.length === 0}><option value="">{!form.countryId ? t("اختر الدولة أولًا") : cities.length ? t("اختر المدينة") : t("لا توجد مدن مسجلة")}</option>{cities.map((city) => <option key={city.id} value={city.id}>{locale === "ar" ? city.nameAr : city.nameEn}</option>)}</select></label>
        <label><span>{t("اسم الشخص الذي تبحث عنه")} <b>*</b></span><input required maxLength={160} autoComplete="name" value={form.subjectName} onChange={(event) => change("subjectName", event.target.value)} /></label>
        <label><span>{t("رقم تواصل الشخص (اختياري)")}</span><input type="tel" dir="ltr" autoComplete="tel" placeholder="+1…" value={form.subjectContactPhone} onChange={(event) => change("subjectContactPhone", event.target.value)} /></label>
        <label className="wide"><span>{t("ما الذي يقلقك؟")} <b>*</b></span><textarea required minLength={10} maxLength={2000} rows={4} value={form.concernDescription} onChange={(event) => change("concernDescription", event.target.value)} placeholder={t("اشرح بإيجاز سبب طلب المساعدة…")} /><small>{form.concernDescription.length} / 2000</small></label>
        <label className="wide"><span>{t("رقم هاتفك لإرسال رمز التأكيد")} <b>*</b></span><input required type="tel" dir="ltr" autoComplete="tel" pattern="\+[1-9]\d{7,14}" placeholder="+201XXXXXXXXX" value={form.applicantPhoneE164} onChange={(event) => change("applicantPhoneE164", event.target.value)} /><small>{t("اكتب الرقم بالصيغة الدولية، مثل +201XXXXXXXXX.")}</small></label>
      </div>
      <label className="atmaen-community-consent"><input type="checkbox" checked={form.shareCommunityUpdate} onChange={(event) => change("shareCommunityUpdate", event.target.checked)} /><span>{t("أرغب في مشاركة تحديث عام منفصل في مجتمع الاطمئنان بعد تأكيد البلاغ. لن تُنشر بيانات البلاغ أو أسماء أو أرقام التواصل.")}</span></label>{form.shareCommunityUpdate && <label className="wide"><span>{t("التحديث العام الذي سيظهر للمجتمع")}</span><textarea required minLength={10} maxLength={1000} rows={3} value={form.communityMessage} onChange={(event) => change("communityMessage", event.target.value)} placeholder={t("اكتب معلومة عامة تساعد الآخرين دون أسماء أو أرقام أو تفاصيل خاصة…")} /><small>{form.communityMessage.length} / 1000</small></label>}      <label className="atmaen-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /><span>{t("أوافق على استخدام بيانات التواصل والمعلومات أعلاه لمعالجة هذا البلاغ والتواصل معي بشأنه.")} <strong>{t("لا ترسل معلومات طبية أو مالية أو كلمات مرور.")}</strong></span></label>
      <button className="atmaen-submit" disabled={busy || countries.length === 0 || cities.length === 0}>{busy ? t("جارٍ إرسال الرمز…") : t("إرسال رمز التأكيد")}<span aria-hidden="true">←</span></button>
    </form> : <form className="atmaen-form" onSubmit={(event) => void submitCase(event)}>
      <div className="atmaen-verify-callout"><span aria-hidden="true">✉</span><p>{t("أرسلنا رمز التحقق إلى")} <b dir="ltr">{form.applicantPhoneE164}</b>. {t("أدخله لتأكيد رقمك وإرسال البلاغ.")}</p></div>
      <label className="atmaen-otp-field"><span>{t("رمز التأكيد")}</span><input required dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" minLength={6} maxLength={6} value={form.otpCode} onChange={(event) => change("otpCode", event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" /></label>
      <div className="atmaen-verify-actions"><button type="button" className="atmaen-back" onClick={() => { setStep("details"); setError(""); }}>{t("تعديل البيانات")}</button><button className="atmaen-submit" disabled={busy}>{busy ? t("جارٍ إرسال البلاغ…") : t("تأكيد وإرسال البلاغ")}<span aria-hidden="true">←</span></button></div>
    </form>}
    <p className="atmaen-form-foot">{t("جسور منصة إعلامية وليست جهة طوارئ. إذا كان هناك خطر مباشر، تواصل مع خدمات الطوارئ المحلية والسفارة المصرية.")}</p>
  </section>;
}
