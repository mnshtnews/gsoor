"use client";

import { useCallback, useEffect, useState } from "react";
import { cms, type CmsSession } from "@/lib/cms-client";

type Country = { id: string; nameAr: string; nameEn: string; isoCode2: string };
type CrisisConfig = { isActive: boolean; title: string; summary: string; sourceName: string; sourceUrl: string; severity: "advisory" | "urgent" | "emergency"; affectedCountryIds: string[]; lastModifiedAtUtc: string | null };
type SubscriptionSettings = { enabled: boolean; activeSubscriptions: number; updatedAtUtc: string | null };
const EMPTY: CrisisConfig = { isActive: false, title: "", summary: "", sourceName: "", sourceUrl: "", severity: "urgent", affectedCountryIds: [], lastModifiedAtUtc: null };
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
    if (nextConfig.isActive && nextConfig.affectedCountryIds.length === 0) { setError("اختر دولة واحدة على الأقل قبل التفعيل."); return; }
    if (!canManage) return;
    if (!config.isActive && nextConfig.isActive && !window.confirm("سيظهر تنبيه الأزمة علنًا في الموقع. تأكد من مراجعة المعلومات والدول المحددة قبل التفعيل.")) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/cms-api/crisis", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextConfig) });
      if (!response.ok) throw new Error(await responseError(response));
      setConfig(await response.json() as CrisisConfig); setNotice("تم حفظ إعدادات وضع الأزمة.");
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

  function toggleCountry(id: string) {
    setConfig((current) => ({ ...current, affectedCountryIds: current.affectedCountryIds.includes(id) ? current.affectedCountryIds.filter((countryId) => countryId !== id) : [...current.affectedCountryIds, id] }));
  }

  const canManage = !!session?.roles?.some((role) => role === "EditorInChief" || role === "ManagingEditor");
  if (loading) return <div className="cms-page-stack"><p className="cms-hint">جارٍ تحميل وضع الأزمة…</p></div>;

  return <div className="cms-page-stack">
    <section className="cms-page-heading cms-crisis-heading"><div><span className="cms-eyebrow">إدارة الطوارئ التحريرية</span><h1>وضع الأزمة</h1><p>فعّل تنبيهًا عامًا للدول المتأثرة. لا يُعرض في الموقع أي إحصاء للحالات الخاصة.</p></div><span className={`cms-crisis-state${config.isActive ? " is-active" : ""}`}><i />{config.isActive ? "نشط على الموقع" : "غير نشط"}</span></section>
    {session?.authenticated && !canManage && <div className="cms-msg error" role="alert">تتطلب إدارة وضع الأزمة صلاحية مدير التحرير أو رئيس التحرير.</div>}
    {error && <div className="cms-msg error" role="alert">{error}<button className="cms-btn" type="button" disabled={loading} onClick={() => void load()}>{loading ? "جارٍ إعادة المحاولة…" : "إعادة المحاولة"}</button></div>}{notice && <div className="cms-msg ok" role="status">{notice}</div>}
    <section className="cms-card cms-crisis-card">
      <div className="cms-section-title"><div><h2>رسالة الأزمة العامة</h2><p className="cms-hint">استخدم معلومات موثوقة ومراجعة. تظهر الرسالة عند تفعيل الوضع فقط.</p></div></div>
      <div className="cms-crisis-form">
        <label className="cms-field"><span>عنوان التنبيه</span><input maxLength={200} value={config.title} onChange={(event) => setConfig({ ...config, title: event.target.value })} placeholder="مثال: تنبيه للمصريين في…" disabled={!canManage} /><small>{config.title.length} / 200</small></label>
        <label className="cms-field"><span>درجة التنبيه</span><select value={config.severity} onChange={(event) => setConfig({ ...config, severity: event.target.value as CrisisConfig["severity"] })} disabled={!canManage}>{Object.entries(SEVERITY).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="cms-field cms-crisis-summary"><span>ملخص موثّق</span><textarea maxLength={2000} rows={5} value={config.summary} onChange={(event) => setConfig({ ...config, summary: event.target.value })} placeholder="اكتب ما تأكد من مصادر موثوقة، وما لا يزال قيد المتابعة." disabled={!canManage} /><small>{config.summary.length} / 2000</small></label>
        <label className="cms-field"><span>اسم المصدر</span><input maxLength={160} value={config.sourceName} onChange={(event) => setConfig({ ...config, sourceName: event.target.value })} placeholder="مثال: بيان رسمي من…" disabled={!canManage} /></label>
        <label className="cms-field"><span>رابط المصدر</span><input type="url" maxLength={2048} dir="ltr" value={config.sourceUrl} onChange={(event) => setConfig({ ...config, sourceUrl: event.target.value })} placeholder="https://" disabled={!canManage} /></label>
      </div>
      <div className="cms-crisis-country-header"><div><h3>الدول المتأثرة</h3><p className="cms-hint">يظهر التنبيه مع إشارة البلد للزوار. اختر الدول التي تشملها الرسالة فقط.</p></div><span>{config.affectedCountryIds.length} دولة</span></div>
      {countries.length ? <div className="cms-crisis-countries">{countries.map((country) => <label className={config.affectedCountryIds.includes(country.id) ? "selected" : ""} key={country.id}><input type="checkbox" checked={config.affectedCountryIds.includes(country.id)} onChange={() => toggleCountry(country.id)} disabled={!canManage} /><span>{country.nameAr}</span><small dir="ltr">{country.isoCode2}</small></label>)}</div> : error.includes("دليل الدول") ? <p className="cms-news-empty">تعذّر تحميل دليل الدول. أعد المحاولة، وإذا استمر العطل فتحقق من اتصال خدمة الـAPI.</p> : <p className="cms-news-empty">لا توجد دول في قاعدة البيانات. أضف بيانات الدول أولًا قبل تفعيل وضع الأزمة.</p>}
      <div className="cms-crisis-footer"><p className="cms-hint">آخر تحديث: {config.lastModifiedAtUtc ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(config.lastModifiedAtUtc)) : "لم يُحفظ بعد"}</p><div className="cms-actions"><button className="cms-btn danger" type="button" disabled={!canManage || saving || !config.isActive} onClick={() => void save({ ...config, isActive: false })}>{saving ? "جارٍ الحفظ…" : "إيقاف التنبيه"}</button><button className="cms-btn primary" type="button" disabled={!canManage || saving || countries.length === 0} onClick={() => void save({ ...config, isActive: true })}>{saving ? "جارٍ الحفظ…" : config.isActive ? "حفظ التعديلات" : "حفظ وتفعيل"}</button></div></div>
    </section>
    <section className="cms-card cms-alert-subscription-settings">
      <div className="cms-section-title"><div><h2>اشتراكات تنبيهات البريد</h2><p className="cms-hint">تحكم في استقبال اشتراكات جديدة. إيقاف الاستقبال لا يحذف العناوين المسجلة.</p></div><span className={`cms-crisis-state${subscriptions?.enabled ? " is-active" : ""}`}><i />{subscriptions?.enabled ? "الاستقبال مفتوح" : "الاستقبال مغلق"}</span></div>
      <p className="cms-hint">العناوين المسجلة حاليًا: <strong>{subscriptions?.activeSubscriptions ?? "—"}</strong>. تُحفظ البيانات مشفرة في قاعدة البيانات. ربط مزود البريد مطلوب قبل إرسال رسائل فعلية.</p>
      <div className="cms-actions"><button className={`cms-btn ${subscriptions?.enabled ? "danger" : "primary"}`} type="button" disabled={!canManage || saving || !subscriptions} onClick={() => void saveSubscriptionSettings(!subscriptions?.enabled)}>{saving ? "جارٍ الحفظ…" : subscriptions?.enabled ? "إيقاف استقبال الاشتراكات" : "فتح استقبال الاشتراكات"}</button></div>
    </section>
    <aside className="cms-crisis-guidance"><strong>حدود مهمة</strong><p>هذه الرسالة لا تمثل جهة طوارئ رسمية. بيانات حالات «اطمّن» سرية ولا تدخل في ملخص الأزمة العام. اربط أي تحديث صحفي بخبر منشور ومعتمد من سير العمل التحريري.</p></aside>
  </div>;
}
