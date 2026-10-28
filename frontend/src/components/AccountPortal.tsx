"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

type Place = { cityId: string; cityNameAr: string; countryNameAr: string | null };
type Session = { authenticated: true; staff?: boolean; roles?: string[]; profile: { privacyLevel: string; countryNameAr: string | null; regionNameAr: string | null; cityNameAr: string | null; places: Place[] } };
type Country = { id: string; nameAr: string; nameEn: string; isoCode2: string };
type City = { id: string; countryId: string; nameAr: string; nameEn: string };
type AuthMode = "login" | "register" | "forgot";
const PRIVACY_LABELS: Record<string, string> = { NoLocation: "بدون موقع", CountryOnly: "الدولة فقط", Region: "المنطقة", City: "المدينة" };

export function AccountPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [locale, setLocale] = useState<"ar" | "en" | "fr">("ar");
  const t = (value: string) => translateUi(locale, value);
  useEffect(() => { const value = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jusoor_locale="))?.split("=")[1]; setLocale(parseLocale(value ? decodeURIComponent(value) : null)); }, []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPassword, setOtpPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState("NoLocation");

  async function refreshSession() {
    const response = await fetch("/account-api/session", { cache: "no-store" }).catch(() => null);
    if (!response?.ok) { setSession(null); return; }
    const current = await response.json() as Session;
    if (current.staff) { window.location.replace("/cms"); return; }
    setSession(current);
    setPrivacyLevel(current.profile.privacyLevel);
    const catalog = await fetch("/account-api/geography", { cache: "no-store" }).then((r) => r.ok ? r.json() as Promise<Country[]> : []).catch(() => []);
    setCountries(catalog);
    const currentCountry = catalog.find((country) => country.nameAr === current.profile.countryNameAr);
    setCountryId(currentCountry?.id ?? "");
  }

  useEffect(() => {
    void refreshSession().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "signup") setMode("register");
    else if (tab === "forgot") setMode("forgot");
  }, []);

  useEffect(() => {
    if (!countryId) { setCities([]); setCityId(""); return; }
    let active = true;
    fetch(`/account-api/geography?countryId=${encodeURIComponent(countryId)}`, { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<City[]> : [])
      .then((items) => { if (active) setCities(items); })
      .catch(() => { if (active) setCities([]); });
    return () => { active = false; };
  }, [countryId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const action = otpStep ? "verify" : mode === "register" ? "register" : "login";
    const email = otpStep ? otpEmail : String(data.get("email") ?? "").trim();
    const password = otpStep ? otpPassword : String(data.get("password") ?? "");
    const payload = otpStep ? { action, email, code: otpCode.trim() } : {
      action, email, password, displayName: mode === "register" ? data.get("displayName") : undefined,
    };
    const response = await fetch("/account-api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const result = await response?.json().catch(() => ({})) as { message?: string; staff?: boolean; requiresEmailOtp?: boolean; email?: string } | undefined;
    // Email OTP is a registration-only step. Never let an upstream 202
    // response switch a login attempt into the registration verification flow.
    if (action === "register" && response?.status === 202 && result?.requiresEmailOtp) {
      setOtpEmail(result.email ?? email); setOtpPassword(password); setOtpCode(""); setOtpStep(true);
      setMessage(result.message ?? "أرسلنا رمز تحقق إلى بريدك الإلكتروني.");
    } else if (response?.ok) {
      setOtpStep(false); setOtpPassword(""); setOtpCode("");
      if (result?.staff) {
        const requested = new URLSearchParams(window.location.search).get("returnTo");
        const target = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/cms";
        window.location.assign(target); return;
      }
      await refreshSession(); window.dispatchEvent(new Event("jusoor:session-change"));
    } else setMessage(result?.message ?? "تعذّر الاتصال بالخادم. حاول مجددًا.");
    setBusy(false);
  }

  async function resendCode() {
    if (!otpEmail || !otpPassword) return;
    setBusy(true); setMessage("");
    const response = await fetch("/account-api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resend", email: otpEmail, password: otpPassword, purpose: "register" }) }).catch(() => null);
    const result = await response?.json().catch(() => ({})) as { message?: string; requiresEmailOtp?: boolean } | undefined;
    setMessage(result?.message ?? (response?.ok ? "أرسلنا رمزًا جديدًا إلى بريدك." : "تعذّر إرسال رمز جديد."));
    setBusy(false);
  }
  async function saveLocation() {
    setBusy(true); setMessage("");
    const privacyCode = privacyLevel === "CountryOnly" ? 1 : privacyLevel === "City" ? 3 : 0;
    const payload = { privacyLevel: privacyCode, countryId: privacyLevel === "NoLocation" ? null : countryId || null, regionId: null, cityId: privacyLevel === "City" ? cityId || null : null };
    const response = await fetch("/account-api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    const result = await response?.json().catch(() => ({})) as { message?: string } | undefined;
    if (response?.ok) { setMessage("تم حفظ إعدادات الموقع."); await refreshSession(); }
    else setMessage(result?.message ?? "تعذّر حفظ إعدادات الموقع.");
    setBusy(false);
  }

  async function followCity() {
    if (!cityId) return;
    setBusy(true); setMessage("");
    const response = await fetch("/account-api/profile/places", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cityId }) }).catch(() => null);
    if (response?.ok) { setMessage("أضيفت المدينة إلى قائمة المتابعة."); await refreshSession(); }
    else { const error = await response?.json().catch(() => ({})) as { message?: string } | undefined; setMessage(error?.message ?? "تعذّر إضافة المدينة."); }
    setBusy(false);
  }

  async function removePlace(place: Place) {
    setBusy(true); setMessage("");
    const response = await fetch(`/account-api/profile/places?cityId=${encodeURIComponent(place.cityId)}`, { method: "DELETE" }).catch(() => null);
    if (response?.ok) { setMessage("أزيلت المدينة من قائمة المتابعة."); await refreshSession(); }
    else setMessage("تعذّر إزالة المدينة.");
    setBusy(false);
  }

  async function logout() {
    await fetch("/account-api/session", { method: "DELETE" }); setSession(null); setMessage("تم تسجيل الخروج."); window.dispatchEvent(new Event("jusoor:session-change"));
  }

  if (loading) return <section className="account-card auth-account-card" dir={locale === "ar" ? "rtl" : "ltr"} aria-busy="true"><p>{t("جارٍ تحميل الحساب…" )}</p></section>;
  if (session) return <section className="account-card auth-account-card account-profile-card" dir={locale === "ar" ? "rtl" : "ltr"} aria-live="polite"><span className="eyebrow">{t("ملف المهجر" )}</span><h1>{t("مرحبًا بك في جسور" )}</h1>
    <p>{t("مستوى مشاركة الموقع:")} <strong>{t(PRIVACY_LABELS[session.profile.privacyLevel] ?? "غير محدد")}</strong></p>
    <p>{t("الموقع المسجل:")} {[session.profile.cityNameAr, session.profile.regionNameAr, session.profile.countryNameAr].filter(Boolean).join("، ") || t("لم تضف موقعًا")}</p>
    <h2>{t("إعدادات الموقع" )}</h2><label>{t("مستوى مشاركة الموقع")}<select value={privacyLevel} onChange={(event) => setPrivacyLevel(event.target.value)}><option value="NoLocation">{t("بدون موقع")}</option><option value="CountryOnly">{t("الدولة فقط")}</option><option value="City">{t("المدينة")}</option></select></label>
    {privacyLevel !== "NoLocation" && <label>{t("الدولة" )}<select value={countryId} onChange={(event) => { setCountryId(event.target.value); setCityId(""); }}><option value="">{t("اختر الدولة" )}</option>{countries.map((country) => <option key={country.id} value={country.id}>{locale === "ar" ? country.nameAr : country.nameEn}</option>)}</select></label>}
    {privacyLevel === "City" && <label>{t("المدينة" )}<select value={cityId} onChange={(event) => setCityId(event.target.value)}><option value="">{t("اختر مدينة")}</option>{cities.map((city) => <option key={city.id} value={city.id}>{locale === "ar" ? city.nameAr : city.nameEn}</option>)}</select></label>}
    <button type="button" className="btn btn-primary" onClick={saveLocation} disabled={busy || (privacyLevel !== "NoLocation" && !countryId) || (privacyLevel === "City" && !cityId)}>{t("حفظ الموقع" )}</button>
    <h2>{t("مدن تتابعها" )}</h2><div className="account-follow-row"><select aria-label={t("اختر مدينة للمتابعة")} value={cityId} onChange={(event) => setCityId(event.target.value)}><option value="">{t("اختر مدينة" )}</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.nameAr}</option>)}</select><button type="button" className="btn btn-primary" onClick={followCity} disabled={busy || !cityId}>{t("إضافة" )}</button></div>
    {session.profile.places.length ? <ul className="account-places">{session.profile.places.map((place) => <li key={place.cityId}><span>{place.cityNameAr}{place.countryNameAr ? `، ${place.countryNameAr}` : ""}</span><button type="button" onClick={() => removePlace(place)} disabled={busy} aria-label={`إزالة ${place.cityNameAr}`}>{t("إزالة" )}</button></li>)}</ul> : <p>{t("لا تتابع مدنًا بعد." )}</p>}
    {message && <p className="account-message" role="status">{t(message)}</p>}<p className="account-note">{t("يمكنك اختيار «بدون موقع» في أي وقت. لا يعرض الملف موقعك الدقيق للجمهور." )}</p><button type="button" className="btn btn-outline" onClick={logout}>{t("تسجيل الخروج" )}</button>
  </section>;

  function changeMode(next: AuthMode) {
    setMode(next);
    setOtpStep(false);
    setOtpEmail("");
    setOtpPassword("");
    setOtpCode("");
    setMessage("");
    const url = new URL(window.location.href);
    if (next === "login") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next === "register" ? "signup" : "forgot");
    window.history.replaceState(null, "", url);
  }

  return <section className="account-card auth-account-card" dir={locale === "ar" ? "rtl" : "ltr"}>
    <h1>{t(otpStep ? "تأكيد البريد الإلكتروني" : mode === "login" ? "تسجيل الدخول" : mode === "register" ? "إنشاء حساب" : "استعادة كلمة المرور")}</h1>
    <p>{t(otpStep ? "أدخل رمز التحقق المكوّن من 6 أرقام الذي أرسلناه إلى بريدك." : mode === "login" ? "استخدم حسابك للوصول إلى الملف الشخصي وخدمات جسور." : mode === "register" ? "أنشئ حسابك لمتابعة خدمات جسور للمصريين بالخارج." : "استعادة كلمة المرور غير متاحة في نسخة التجربة الحالية.")}</p>
    {!otpStep && <div className="auth-tabs" role="tablist" aria-label={t("خيارات الحساب")}>
      <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>{t("دخول" )}</button>
      <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>{t("إنشاء حساب" )}</button>
      <button type="button" role="tab" aria-selected={mode === "forgot"} className={mode === "forgot" ? "active" : ""} onClick={() => changeMode("forgot")}>{t("نسيت كلمة السر" )}</button>
    </div>}
    {mode === "forgot" && !otpStep ? <div className="auth-recovery-note" role="status">{t("لا تتوفر حاليًا خدمة إعادة تعيين كلمة المرور. تواصل مع فريق جسور لاستعادة الوصول إلى حسابك." )}</div> : <form className="auth-form" onSubmit={submit}>
      {otpStep ? <><label className="auth-field">{t("البريد الإلكتروني")}<input value={otpEmail} readOnly /></label><label className="auth-field">{t("رمز التحقق")}<input name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label></> : <>{mode === "register" && <label className="auth-field">{t("الاسم بالكامل" )}<input name="displayName" autoComplete="name" required maxLength={100} /></label>}<label className="auth-field">{t("البريد الإلكتروني" )}<input name="email" type="email" autoComplete="email" required maxLength={256} /></label><label className="auth-field">{t("كلمة المرور" )}<span className="auth-password"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} maxLength={128} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{t(showPassword ? "إخفاء" : "إظهار")}</button></span></label></>}      {!otpStep && mode === "login" && <button className="auth-forgot-link" type="button" onClick={() => changeMode("forgot")}>{t("نسيت كلمة المرور؟" )}</button>}
      {!otpStep && mode === "register" && <label className="auth-terms"><input type="checkbox" required /> {t("أوافق على")} <a href="/privacy" target="_blank" rel="noreferrer">{t("سياسة الخصوصية" )}</a></label>}
      {message && <p className="account-message" role="alert">{t(message)}</p>}
      <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>{busy ? t("جارٍ التنفيذ…") : t(otpStep ? "تأكيد الرمز" : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب وإرسال الرمز")}</button>{otpStep && <button className="auth-forgot-link" type="button" onClick={() => void resendCode()} disabled={busy}>{t("إعادة إرسال الرمز")}</button>}
    </form>}
    {mode !== "forgot" && !otpStep && <p className="auth-form-footer">{mode === "login" ? <>مستخدم جديد؟ <button type="button" onClick={() => changeMode("register")}>{t("أنشئ حسابًا" )}</button></> : <>لديك حساب؟ <button type="button" onClick={() => changeMode("login")}>{t("سجّل الدخول" )}</button></>}</p>}
  </section>;
}
