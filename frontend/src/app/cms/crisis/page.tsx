"use client";

import { LocalizedContent } from "@/components/LocalizedContent";

import { useCallback, useEffect, useState } from "react";
import { cms, type CmsSession } from "@/lib/cms-client";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { cmsMedia } from "@/lib/cms-media-client";

type Country = { id: string; nameAr: string; nameEn: string; isoCode2: string };
type CrisisConfig = { isActive: boolean; title: string; summary: string; sourceName: string; sourceUrl: string; severity: "advisory" | "urgent" | "emergency"; affectedCountryIds: string[]; soundAssetId: string | null; soundUrl: string | null; soundRepeatIntervalSeconds: number; lastModifiedAtUtc: string | null };
type SubscriptionSettings = { enabled: boolean; activeSubscriptions: number; updatedAtUtc: string | null };
const EMPTY: CrisisConfig = { isActive: false, title: "", summary: "", sourceName: "", sourceUrl: "", severity: "urgent", affectedCountryIds: [], soundAssetId: null, soundUrl: null, soundRepeatIntervalSeconds: 60, lastModifiedAtUtc: null };
const SEVERITY: Record<CrisisConfig["severity"], string> = { advisory: "تنبيه", urgent: "عاجل", emergency: "طوارئ" };

async function responseError(response: Response) {
  try {
    const body = await response.json() as { message?: string; title?: string };
    if (response.status === 401) return "انتهت جلسة الدخول. سجّل الدخول مجددًا ثم أعد المحاولة.";
    if (response.status === 403) return "الخادم لم يمنح هذه الجلسة صلاحية إدارة وضع الأزمة. تحقق من دور الحساب ثم أعد تسجيل الدخول.";
    return body.message ?? body.title ?? `تعذّر إتمام الطلب (${response.status}).`;
  } catch { return `تعذّر إتمام الطلب (${response.status}).`; }
}

export default function CmsCrisisModePage() {
  const [session, setSession] = useState<CmsSession | null>(null);
  const [locale,setLocale]=useState<"ar"|"en"|"fr">("ar");
  const t=(value:string)=>translateUi(locale,value);
  useEffect(()=>{const value=document.cookie.split(";").map((part)=>part.trim()).find((part)=>part.startsWith("jusoor_locale="))?.split("=")[1];setLocale(parseLocale(value?decodeURIComponent(value):null));},[]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [config, setConfig] = useState<CrisisConfig>(EMPTY);
  const [subscriptions, setSubscriptions] = useState<SubscriptionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(""); setNotice("");
    try {
      // Resolve the CMS identity first. A failed data request must never be
      // mistaken for a missing newsroom role (the previous Promise.all did so).
      const currentSession = await cms.session();
      setSession(currentSession);
      if (!currentSession.authenticated) {
        setError("انتهت جلسة الدخول أو لم تعد صالحة. سجّل الدخول إلى لوحة التحرير مجددًا.");
        return;
      }

      const [countryResult, configResult, subscriptionResult] = await Promise.allSettled([
        fetch("/cms-api/crisis/countries", { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
          if (!response.ok) throw new Error(await responseError(response));
          return response.json() as Promise<Country[]>;
        }),
        fetch("/cms-api/crisis", { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
          if (!response.ok) throw new Error(await responseError(response));
          return response.json() as Promise<CrisisConfig>;
        }),
        fetch("/cms-api/alert-subscriptions/settings", { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
          if (!response.ok) throw new Error(await responseError(response));
          return response.json() as Promise<SubscriptionSettings>;
        }),
      ]);
      const loadErrors: string[] = [];
      if (countryResult.status === "fulfilled") setCountries(countryResult.value);
      else loadErrors.push(countryResult.reason instanceof Error ? `تعذّر تحميل دليل الدول: ${countryResult.reason.message}` : "تعذّر تحميل دليل الدول.");
      if (configResult.status === "fulfilled") setConfig(configResult.value);
      else loadErrors.push(configResult.reason instanceof Error ? configResult.reason.message : "تعذّر تحميل إعدادات الأزمة.");
      if (subscriptionResult.status === "fulfilled") setSubscriptions(subscriptionResult.value);
      else loadErrors.push(subscriptionResult.reason instanceof Error ? `تعذّر تحميل إعدادات الاشتراك: ${subscriptionResult.reason.message}` : "تعذّر تحميل إعدادات الاشتراك.");
      setError(loadErrors.join(" "));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذّر التحقق من جلسة التحرير.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save(nextConfig: CrisisConfig = config) {
    if (nextConfig.isActive && nextConfig.affectedCountryIds.length === 0) { setError(t("اختر دولة واحدة على الأقل قبل التفعيل.")); return; }
    if (!canManage) return;
    if (!config.isActive && nextConfig.isActive && !window.confirm(t("سيظهر تنبيه الأزمة علنًا في الموقع. تأكد من مراجعة المعلومات والدول المحددة قبل التفعيل."))) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/cms-api/crisis", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...nextConfig, soundUrl: undefined }) });
      if (!response.ok) throw new Error(await responseError(response));
      const saved = await response.json() as CrisisConfig; setConfig({ ...saved, soundUrl: nextConfig.soundUrl }); setNotice("تم حفظ إعدادات وضع الأزمة.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر حفظ الإعدادات."); }
    finally { setSaving(false); }
  }

  async function saveSubscriptionSettings(enabled: boolean) {
    if (!canManage || !subscriptions) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/cms-api/alert-subscriptions/settings", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
      if (!response.ok) throw new Error(await responseError(response));
      setSubscriptions(await response.json() as SubscriptionSettings);
      setNotice(enabled ? "تم فتح استقبال اشتراكات التنبيهات." : "تم إيقاف استقبال اشتراكات جديدة. ستظل الاشتراكات المحفوظة كما هي.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر حفظ إعداد الاشتراك."); }
    finally { setSaving(false); }
  }

  async function uploadCrisisSound(file?: File) {
    if (!file || !canManage) return;
    if (!["audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav"].includes(file.type)) { setError("ارفع ملف MP3 أو OGG أو WAV فقط."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const asset = await cmsMedia.upload(file, { altText: "نغمة تنبيه الأزمة", credit: "جسور", caption: "", focalPointX: null, focalPointY: null });
      setConfig(current => ({ ...current, soundAssetId: asset.id, soundUrl: asset.publicUrl }));
      setNotice("اكتمل رفع ملف الصوت. اضغط حفظ التعديلات لتفعيله على الموقع.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر رفع ملف الصوت."); }
    finally { setSaving(false); }
  }
  function toggleCountry(id: string) {
    setConfig((current) => ({ ...current, affectedCountryIds: current.affectedCountryIds.includes(id) ? current.affectedCountryIds.filter((countryId) => countryId !== id) : [...current.affectedCountryIds, id] }));
  }

  const canManage = !!session?.roles?.some((role) => role === "EditorInChief" || role === "ManagingEditor");
  if (loading) return <LocalizedContent>{<div className="cms-page-stack"><p className="cms-hint">{t("جارٍ تحميل وضع الأزمة…")}</p></div>}</LocalizedContent>;

  return <LocalizedContent>{<div className="cms-page-stack">
    <section className="cms-page-heading cms-crisis-heading"><div><span className="cms-eyebrow">{t("إدارة الطوارئ التحريرية")}</span><h1>{t("وضع الأزمة")}</h1><p>{t("فعّل تنبيهًا عامًا للدول المتأثرة. لا يُعرض في الموقع أي إحصاء للحالات الخاصة.")}</p></div><span className={`cms-crisis-state${config.isActive ? " is-active" : ""}`}><i />{config.isActive ? "نشط على الموقع" : "غير نشط"}</span></section>
    {session?.authenticated && !canManage && <div className="cms-msg error" role="alert">{t("تتطلب إدارة وضع الأزمة صلاحية مدير التحرير أو رئيس التحرير.")}</div>}
    {error && <div className="cms-msg error" role="alert">{t(error)}<button className="cms-btn" type="button" disabled={loading} onClick={() => void load()}>{loading ? "جارٍ إعادة المحاولة…" : "إعادة المحاولة"}</button></div>}{notice && <div className="cms-msg ok" role="status">{t(notice)}</div>}
    <section className="cms-card cms-crisis-card">
      <div className="cms-section-title"><div><h2>{t("رسالة الأزمة العامة")}</h2><p className="cms-hint">{t("استخدم معلومات موثوقة ومراجعة. تظهر الرسالة عند تفعيل الوضع فقط.")}</p></div></div>
      <div className="cms-crisis-form">
        <label className="cms-field"><span>{t("عنوان التنبيه")}</span><input maxLength={200} value={config.title} onChange={(event) => setConfig({ ...config, title: event.target.value })} placeholder="مثال: تنبيه للمصريين في…" disabled={!canManage} /><small>{config.title.length} / 200</small></label>
        <label className="cms-field"><span>{t("درجة التنبيه")}</span><select value={config.severity} onChange={(event) => setConfig({ ...config, severity: event.target.value as CrisisConfig["severity"] })} disabled={!canManage}>{Object.entries(SEVERITY).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
        <label className="cms-field cms-crisis-summary"><span>{t("ملخص موثّق")}</span><textarea maxLength={2000} rows={5} value={config.summary} onChange={(event) => setConfig({ ...config, summary: event.target.value })} placeholder={t("اكتب ما تأكد من مصادر موثوقة، وما لا يزال قيد المتابعة.")} disabled={!canManage} /><small>{config.summary.length} / 2000</small></label>
        <label className="cms-field"><span>{t("اسم المصدر")}</span><input maxLength={160} value={config.sourceName} onChange={(event) => setConfig({ ...config, sourceName: event.target.value })} placeholder={t("مثال: بيان رسمي من…")} disabled={!canManage} /></label>
        <label className="cms-field"><span>{t("رابط المصدر")}</span><input type="url" maxLength={2048} dir="ltr" value={config.sourceUrl} onChange={(event) => setConfig({ ...config, sourceUrl: event.target.value })} placeholder="https://" disabled={!canManage} /></label>
      </div>
      <div className="cms-crisis-sound-settings">
        <div className="cms-section-title"><div><h3>{t("صوت تنبيه الأزمة")}</h3><p className="cms-hint">{t("يُطلب من الزائر تشغيل الصوت يدويًا احترامًا لإعدادات المتصفح. الملفات المسموحة: MP3 وOGG وWAV بحد أقصى 10 ميجابايت.")}</p></div></div>
        <label className="cms-field"><span>{t("رفع نغمة التنبيه")}</span><input type="file" accept="audio/mpeg,audio/ogg,audio/wav,audio/x-wav,.mp3,.ogg,.oga,.wav" disabled={!canManage || saving} onChange={(event) => void uploadCrisisSound(event.target.files?.[0])} /></label>
        {config.soundUrl && <div className="cms-crisis-sound-preview"><audio controls preload="none" src={config.soundUrl}>{t("المتصفح لا يدعم تشغيل الصوت.")}</audio><button className="cms-btn danger" type="button" disabled={!canManage || saving} onClick={() => setConfig(current => ({ ...current, soundAssetId: null, soundUrl: null }))}>{t("إزالة الصوت")}</button></div>}
        <label className="cms-field"><span>{t("تكرار التنبيه (بالثواني)")}</span><input type="number" min={15} max={3600} step={5} value={config.soundRepeatIntervalSeconds} disabled={!canManage} onChange={(event) => setConfig({ ...config, soundRepeatIntervalSeconds: Number(event.target.value) })} /><small>{t("من 15 ثانية إلى ساعة واحدة.")}</small></label>
      </div>
      <div className="cms-crisis-country-header"><div><h3>{t("الدول المتأثرة")}</h3><p className="cms-hint">{t("يظهر التنبيه مع إشارة البلد للزوار. اختر الدول التي تشملها الرسالة فقط.")}</p></div><span>{config.affectedCountryIds.length} {t("دولة")}</span></div>
      {countries.length ? <div className="cms-crisis-countries">{countries.map((country) => <label className={config.affectedCountryIds.includes(country.id) ? "selected" : ""} key={country.id}><input type="checkbox" checked={config.affectedCountryIds.includes(country.id)} onChange={() => toggleCountry(country.id)} disabled={!canManage} /><span>{locale === "ar" ? country.nameAr : country.nameEn}</span><small dir="ltr">{country.isoCode2}</small></label>)}</div> : error.includes("دليل الدول") ? <p className="cms-news-empty">{t("تعذّر تحميل دليل الدول. أعد المحاولة، وإذا استمر العطل فتحقق من اتصال خدمة الـAPI.")}</p> : <p className="cms-news-empty">{t("لا توجد دول في قاعدة البيانات. أضف بيانات الدول أولًا قبل تفعيل وضع الأزمة.")}</p>}
      <div className="cms-crisis-footer"><p className="cms-hint">آخر تحديث: {config.lastModifiedAtUtc ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(config.lastModifiedAtUtc)) : "لم يُحفظ بعد"}</p><div className="cms-actions"><button className="cms-btn danger" type="button" disabled={!canManage || saving || !config.isActive} onClick={() => void save({ ...config, isActive: false })}>{saving ? t("جارٍ الحفظ…") : t("إيقاف التنبيه")}</button><button className="cms-btn primary" type="button" disabled={!canManage || saving || countries.length === 0} onClick={() => void save({ ...config, isActive: true })}>{saving ? t("جارٍ الحفظ…") : config.isActive ? t("حفظ التعديلات") : t("حفظ وتفعيل")}</button></div></div>
    </section>
    <section className="cms-card cms-alert-subscription-settings">
      <div className="cms-section-title"><div><h2>{t("اشتراكات تنبيهات البريد")}</h2><p className="cms-hint">{t("تحكم في استقبال اشتراكات جديدة. إيقاف الاستقبال لا يحذف العناوين المسجلة.")}</p></div><span className={`cms-crisis-state${subscriptions?.enabled ? " is-active" : ""}`}><i />{subscriptions?.enabled ? "الاستقبال مفتوح" : "الاستقبال مغلق"}</span></div>
      <p className="cms-hint">العناوين المسجلة حاليًا: <strong>{subscriptions?.activeSubscriptions ?? "—"}</strong>. تُحفظ البيانات مشفرة في قاعدة البيانات. ربط مزود البريد مطلوب قبل إرسال رسائل فعلية.</p>
      <div className="cms-actions"><button className={`cms-btn ${subscriptions?.enabled ? "danger" : "primary"}`} type="button" disabled={!canManage || saving || !subscriptions} onClick={() => void saveSubscriptionSettings(!subscriptions?.enabled)}>{saving ? t("جارٍ الحفظ…") : subscriptions?.enabled ? t("إيقاف استقبال الاشتراكات") : t("فتح استقبال الاشتراكات")}</button></div>
    </section>
    <aside className="cms-crisis-guidance"><strong>{t("حدود مهمة")}</strong><p>{t("هذه الرسالة لا تمثل جهة طوارئ رسمية. بيانات حالات «اطمّن» سرية ولا تدخل في ملخص الأزمة العام. اربط أي تحديث صحفي بخبر منشور ومعتمد من سير العمل التحريري.")}</p></aside>
  </div>}</LocalizedContent>;
}
