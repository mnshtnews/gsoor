"use client";

import Image from "next/image";
import { LocalizedContent } from "@/components/LocalizedContent";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cms, cmsSiteStructure, CmsError, PRESENTATION_DESKS, type CmsHomepageSection, type CmsSiteNavigationItem, type CmsSiteStructure, type CmsSocialLink } from "@/lib/cms-client";
import { cmsMedia } from "@/lib/cms-media-client";

const DEFAULT_LEADERSHIP: CmsSiteStructure["leadership"] = { logoAssetId: null, logoUrl: null, slogan: "صوت المصريين في الخارج", entries: [
  { id: "board-editor", title: "رئيس مجلس الإدارة ورئيس التحرير", name: "أحمد سليمان" },
  { id: "executive-editor", title: "رئيس التحرير التنفيذي", name: "أشرف جبريل" },
] };
const DEFAULT_STRUCTURE: CmsSiteStructure = { navigation: [], homepageSections: [], leadership: DEFAULT_LEADERSHIP, socialLinks: [
  { id: "facebook", name: "فيسبوك", href: "https://www.facebook.com/jswr.gosour", icon: "facebook", isVisible: true },
  { id: "x", name: "X", href: "https://x.com/gosour22", icon: "x", isVisible: true },
  { id: "instagram", name: "إنستجرام", href: "https://www.instagram.com/gosour22/", icon: "instagram", isVisible: true },
  { id: "youtube", name: "يوتيوب", href: "", icon: "youtube", isVisible: false },
], welcomeIntro: { isEnabled: false, assetId: null, videoUrl: null, fileName: null }, lastModifiedAtUtc: null };
const LAYOUTS = [{ value: "cards", label: "شبكة بطاقات" }, { value: "lead", label: "بطاقة رئيسية مع شبكة" }, { value: "columns", label: "عمودان" }] as const;

export default function SiteStructurePage() {
  const router = useRouter();
  const [structure, setStructure] = useState(DEFAULT_STRUCTURE);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newDesk, setNewDesk] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [introUploadBusy, setIntroUploadBusy] = useState(false);
  const [logoUploadBusy, setLogoUploadBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const session = await cms.session();
      if (!session.authenticated) { router.replace("/cms/login"); return; }
      const allowed = !!session.roles?.some((role) => ["EditorInChief", "ManagingEditor", "SystemAdmin"].includes(role));
      setCanManage(allowed);
      if (!allowed) { setError("إدارة هيكل الموقع متاحة لرئيس التحرير ومدير التحرير ومدير النظام."); return; }
      setStructure(await cmsSiteStructure.get());
      setDirty(false);
    } catch (cause) {
      if (cause instanceof CmsError && cause.status === 401) { router.replace("/cms/login"); return; }
      setError(cause instanceof Error ? cause.message : "تعذّر تحميل إعدادات الموقع.");
    } finally { setLoaded(true); }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const usedDesks = useMemo(() => new Set(structure.homepageSections.map((section) => section.deskSlug)), [structure.homepageSections]);
  const availableDesks = PRESENTATION_DESKS.filter((desk) => !usedDesks.has(desk.slug));
  const updateNav = (key: string, patch: Partial<CmsSiteNavigationItem>) => {
    setStructure((value) => ({ ...value, navigation: value.navigation.map((item) => item.key === key ? { ...item, ...patch } : item) }));
    setDirty(true); setNotice("");
  };
  const moveNav = (key: string, delta: -1 | 1) => {
    const item = structure.navigation.find((candidate) => candidate.key === key);
    if (!item) return;
    const group = structure.navigation.filter((candidate) => candidate.group === item.group).sort((a, b) => a.displayOrder - b.displayOrder);
    const index = group.findIndex((candidate) => candidate.key === key);
    const other = group[index + delta];
    if (!other) return;
    const newOrder = new Map(group.map((candidate, position) => [candidate.key, position]));
    newOrder.set(item.key, index + delta); newOrder.set(other.key, index);
    setStructure((value) => ({ ...value, navigation: value.navigation.map((candidate) => newOrder.has(candidate.key) ? { ...candidate, displayOrder: newOrder.get(candidate.key)! } : candidate) }));
    setDirty(true); setNotice("");
  };
  const updateSection = (key: string, patch: Partial<CmsHomepageSection>) => {
    setStructure((value) => ({ ...value, homepageSections: value.homepageSections.map((section) => section.key === key ? { ...section, ...patch } : section) }));
    setDirty(true); setNotice("");
  };
  const updateSocialLink = (id: string, patch: Partial<CmsSocialLink>) => {
    setStructure((current) => ({ ...current, socialLinks: current.socialLinks.map((link) => link.id === id ? { ...link, ...patch } : link) }));
    setDirty(true); setNotice("");
  };
  const addSocialLink = () => {
    if (structure.socialLinks.length >= 12) return;
    const id = "social-" + crypto.randomUUID().slice(0, 8);
    setStructure((current) => ({ ...current, socialLinks: [...current.socialLinks, { id, name: "", href: "", icon: "globe", isVisible: false }] }));
    setDirty(true); setNotice("");
  };
  const removeSocialLink = (id: string) => {
    setStructure((current) => ({ ...current, socialLinks: current.socialLinks.filter((link) => link.id !== id) }));
    setDirty(true); setNotice("");
  };
  async function uploadIntroVideo(file?: File) {
    if (!file) return;
    if (!["video/mp4", "video/webm"].includes(file.type)) { setError("اختر ملف فيديو MP4 أو WebM."); return; }
    setIntroUploadBusy(true); setError(""); setNotice("");
    try {
      const asset = await cmsMedia.upload(file, { altText: "الفيديو التعريفي لمنصة جسور", credit: "جسور", caption: "", focalPointX: null, focalPointY: null });
      setStructure((current) => ({ ...current, welcomeIntro: { ...current.welcomeIntro, assetId: asset.id, videoUrl: asset.publicUrl, fileName: asset.fileName } }));
      setDirty(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر رفع الفيديو التعريفي."); }
    finally { setIntroUploadBusy(false); }
  }
  const updateWelcomeIntro = (patch: Partial<CmsSiteStructure["welcomeIntro"]>) => {
    setStructure((current) => ({ ...current, welcomeIntro: { ...current.welcomeIntro, ...patch } })); setDirty(true); setNotice("");
  };
  async function uploadBrandLogo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("اختر ملف صورة للشعار."); return; }
    setLogoUploadBusy(true); setError(""); setNotice("");
    try {
      const asset = await cmsMedia.upload(file, { altText: "شعار جسور", credit: "جسور", caption: "", focalPointX: null, focalPointY: null });
      setStructure((current) => ({ ...current, leadership: { ...current.leadership, logoAssetId: asset.id, logoUrl: asset.publicUrl } }));
      setDirty(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر رفع الشعار."); }
    finally { setLogoUploadBusy(false); }
  }
  const updateLeadership = (id: string, patch: Partial<CmsSiteStructure["leadership"]["entries"][number]>) => {
    setStructure((current) => ({ ...current, leadership: { ...current.leadership, entries: current.leadership.entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry) } }));
    setDirty(true); setNotice("");
  };
  const addLeadership = () => {
    const id = `custom-${crypto.randomUUID()}`;
    setStructure((current) => ({ ...current, leadership: { ...current.leadership, entries: [...current.leadership.entries, { id, title: "", name: "" }] } }));
    setDirty(true); setNotice("");
  };
  const removeLeadership = (id: string) => {
    setStructure((current) => ({ ...current, leadership: { ...current.leadership, entries: current.leadership.entries.filter((entry) => entry.id !== id) } }));
    setDirty(true); setNotice("");
  };
  const moveSection = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= structure.homepageSections.length) return;
    setStructure((value) => { const sections = [...value.homepageSections]; [sections[index], sections[target]] = [sections[target], sections[index]]; return { ...value, homepageSections: sections.map((section, order) => ({ ...section, displayOrder: order })) }; });
    setDirty(true); setNotice("");
  };
  const addSection = () => {
    const desk = PRESENTATION_DESKS.find((item) => item.slug === newDesk);
    if (!desk) return;
    setStructure((value) => ({ ...value, homepageSections: [...value.homepageSections, { key: desk.slug, title: desk.label, deskSlug: desk.slug, layout: "cards", isEnabled: true, showOnWeb: true, showOnMobile: true, displayOrder: value.homepageSections.length }] }));
    setNewDesk(""); setDirty(true); setNotice("");
  };
  const removeSection = (key: string) => {
    setStructure((value) => ({ ...value, homepageSections: value.homepageSections.filter((section) => section.key !== key).map((section, displayOrder) => ({ ...section, displayOrder })) }));
    setDirty(true); setNotice("");
  };
  async function save() {
    setBusy(true); setError(""); setNotice("");
    try {
      if (structure.leadership.entries.length < 2 || structure.leadership.entries.length > 10) throw new Error("يمكنك إدارة الحقلين الأساسيين وإضافة حتى 8 حقول أخرى.");
      if (structure.leadership.entries.slice(2).some((entry) => !entry.title.trim())) throw new Error("اكتب مسمى لكل حقل إضافي قبل الحفظ.");
      const saved = await cmsSiteStructure.save({ navigation: structure.navigation.map((item) => ({ ...item, displayOrder: structure.navigation.filter((entry) => entry.group === item.group).sort((a, b) => a.displayOrder - b.displayOrder).findIndex((entry) => entry.key === item.key) })), homepageSections: structure.homepageSections.map((section, displayOrder) => ({ ...section, displayOrder })), leadership: structure.leadership, socialLinks: structure.socialLinks, welcomeVideoAssetId: structure.welcomeIntro.assetId, welcomeIntroEnabled: structure.welcomeIntro.isEnabled });
      setStructure(saved); setDirty(false); setNotice("حُفظت الإعدادات وستظهر على الموقع بعد تحديث الصفحة.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر حفظ الإعدادات."); }
    finally { setBusy(false); }
  }

  if (!loaded) return <LocalizedContent>{<div className="cms-page-stack"><p className="cms-hint">جارٍ تحميل إعدادات الموقع…</p></div>}</LocalizedContent>;
  return <LocalizedContent>{<div className="cms-page-stack cms-site-structure" dir="rtl">
    <section className="cms-page-heading"><div><span className="cms-eyebrow">إدارة تجربة الموقع</span><h1>الرئيسية والتنقل</h1><p>تحكم في روابط الشريط وأقسام تحريرية إضافية تظهر على الويب والموبايل.</p></div><button className="cms-btn primary" disabled={!canManage || !dirty || busy} onClick={() => void save()}>{busy ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button></section>
    {error && <div className="cms-msg error" role="alert">{error}<button className="cms-btn" type="button" onClick={() => void load()}>إعادة المحاولة</button></div>}
    {notice && <div className="cms-msg ok" role="status">{notice}</div>}

    <section className="cms-card"><div className="cms-section-title"><div><h2>شعار الموقع</h2><p className="cms-hint">ارفع الشعار الجديد من هنا؛ يُستخدم في رأس الموقع والقائمة والفوتر بعد الحفظ.</p></div></div>
      <label className="cms-field"><span>تغيير الشعار</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={!canManage || logoUploadBusy || busy} onChange={(event) => { void uploadBrandLogo(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      {logoUploadBusy && <p className="cms-hint" role="status">جارٍ رفع الشعار…</p>}
      {structure.leadership.logoUrl && <div className="cms-actions"><Image src={structure.leadership.logoUrl} alt="معاينة شعار جسور" width={120} height={100} unoptimized style={{ objectFit: "contain", background: "#fff" }} /><button type="button" className="cms-btn" disabled={busy} onClick={() => { setStructure((current) => ({ ...current, leadership: { ...current.leadership, logoAssetId: null, logoUrl: null } })); setDirty(true); }}>الرجوع للشعار الافتراضي</button></div>}
      <label className="cms-field"><span>العبارة التعريفية أسفل الشعار</span><input required value={structure.leadership.slogan} maxLength={80} disabled={!canManage || busy} onChange={(event) => { setStructure((current) => ({ ...current, leadership: { ...current.leadership, slogan: event.target.value } })); setDirty(true); setNotice(""); }} placeholder="مثال: صوت المصريين في الخارج" /><span className="cms-hint">{structure.leadership.slogan.length} / 80 — تظهر في رأس الموقع على الويب والموبايل. اضغط «حفظ التغييرات» لتطبيقها.</span></label>
      <div className="cms-logo-slogan-preview" aria-label="معاينة العبارة أسفل الشعار"><Image src={structure.leadership.logoUrl || "/assets/josour-logo-transparent.png"} alt="" width={88} height={78} unoptimized /><strong>{structure.leadership.slogan || "ستظهر العبارة هنا"}</strong></div>
    </section>
    <section className="cms-card"><div className="cms-section-title"><div><h2>أسماء الإدارة والتحرير</h2><p className="cms-hint">تظهر بجوار شعار جسور. الحقلان الأساسيان ثابتان، ويمكن إضافة حتى 8 مسميات أخرى وتعديلها أو حذفها.</p></div><button type="button" className="cms-btn" disabled={structure.leadership.entries.length >= 10} onClick={addLeadership}>＋ إضافة مسمى</button></div>
      <div className="cms-leadership-fields">
        {structure.leadership.entries.map((entry, index) => <div className="cms-leadership-entry" key={entry.id}>
          <div className="cms-leadership-entry-fields">
            {index < 2 ? <label className="cms-field"><span>المسمى الوظيفي</span><input value={entry.title} readOnly aria-readonly="true" /></label> : <label className="cms-field"><span>مسمى الحقل الإضافي</span><input maxLength={80} value={entry.title} onChange={(event) => updateLeadership(entry.id, { title: event.target.value })} placeholder="مثال: مدير المحتوى" /> </label>}
            <label className="cms-field"><span>الاسم</span><input maxLength={100} value={entry.name} onChange={(event) => updateLeadership(entry.id, { name: event.target.value })} placeholder="الاسم" /></label>
          </div>
          {index >= 2 && <button type="button" className="cms-btn cms-leadership-entry-remove" onClick={() => removeLeadership(entry.id)} aria-label={`حذف ${entry.title || "الحقل الإضافي"}`}>حذف الحقل</button>}
        </div>)}
      </div>
    </section>


    <section className="cms-card"><div className="cms-section-title"><div><h2>روابط التواصل الاجتماعي</h2><p className="cms-hint">تظهر الروابط المفعّلة في رأس الموقع والفوتر. لا يُعرض YouTube حتى تضيف رابطه وتفعّله.</p></div><button type="button" className="cms-btn" disabled={structure.socialLinks.length >= 12} onClick={addSocialLink}>＋ إضافة منصة</button></div>
      <div className="cms-social-settings">{structure.socialLinks.map((link) => <div className="cms-social-setting" key={link.id}>
        <label className="cms-field"><span>اسم المنصة</span><input value={link.name} maxLength={60} onChange={(event) => updateSocialLink(link.id, { name: event.target.value })} placeholder="مثال: لينكدإن" /></label>
        <label className="cms-field"><span>رابط HTTPS</span><input dir="ltr" type="url" value={link.href} maxLength={500} onChange={(event) => updateSocialLink(link.id, { href: event.target.value })} placeholder="https://" /></label>
        <label className="cms-field"><span>الأيقونة</span><select value={link.icon} onChange={(event) => updateSocialLink(link.id, { icon: event.target.value as CmsSocialLink["icon"] })}><option value="facebook">Facebook</option><option value="x">X</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="globe">رابط عام</option><option value="tiktok">TikTok</option><option value="linkedin">LinkedIn</option></select></label>
        <label className="cms-social-visible"><input type="checkbox" checked={link.isVisible} onChange={(event) => updateSocialLink(link.id, { isVisible: event.target.checked })} /> ظاهر</label>
        <button className="cms-btn danger" type="button" onClick={() => removeSocialLink(link.id)}>حذف</button>
      </div>)}</div>
    </section>
    <section className="cms-card cms-welcome-intro-settings"><div className="cms-section-title"><div><h2>الفيديو التعريفي عند أول زيارة</h2><p className="cms-hint">ارفع فيديو MP4 أو WebM عبر مكتبة الوسائط الآمنة. يظهر للزائر مرة واحدة، ويمكنه إعادة تشغيله من صفحة «عن جسور» أو الفوتر.</p></div></div>
      <label className="cms-field"><span>ملف الفيديو</span><input type="file" accept="video/mp4,video/webm" disabled={introUploadBusy} onChange={(event) => { void uploadIntroVideo(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      {introUploadBusy && <p className="cms-hint" role="status">جارٍ رفع الفيديو إلى مكتبة الوسائط…</p>}
      {structure.welcomeIntro.videoUrl && <div className="cms-welcome-intro-preview"><video controls preload="metadata" src={structure.welcomeIntro.videoUrl} /><div><strong>{structure.welcomeIntro.fileName || "الفيديو المختار"}</strong><button type="button" className="cms-btn danger" onClick={() => updateWelcomeIntro({ assetId: null, videoUrl: null, fileName: null, isEnabled: false })}>إزالة الفيديو</button></div></div>}
      <label className="cms-social-visible"><input type="checkbox" checked={structure.welcomeIntro.isEnabled} disabled={!structure.welcomeIntro.assetId || introUploadBusy} onChange={(event) => updateWelcomeIntro({ isEnabled: event.target.checked })} /> تفعيل عرضه مرة واحدة للزائر الجديد</label>
    </section>
    <section className="cms-card"><div className="cms-section-title"><div><h2>ترتيب روابط القائمة</h2><p className="cms-hint">اسحب ترتيب الروابط بالأسهم، واختر ظهور الرابط في الشريط أو قائمة «المزيد». الاختيارات نفسها تُستخدم في قائمة الموبايل.</p></div></div>
      {(["primary", "more"] as const).map((group) => <div className="cms-structure-group" key={group}><h3>{group === "primary" ? "روابط الشريط الرئيسي" : "روابط قائمة المزيد"}</h3><ol>{structure.navigation.filter((item) => item.group === group).sort((a, b) => a.displayOrder - b.displayOrder).map((item, index, items) => <li key={item.key} className={!item.isVisible ? "is-muted" : ""}>
        <span className="cms-structure-order">{index + 1}</span><strong>{item.label}</strong><span className="cms-structure-path" dir="ltr">{item.href}</span>
        <div className="cms-structure-controls"><label><input type="checkbox" checked={item.isVisible} onChange={(event) => updateNav(item.key, { isVisible: event.target.checked })} /> ظاهر</label>
          <select aria-label={`مكان ${item.label}`} value={item.group} onChange={(event) => updateNav(item.key, { group: event.target.value as "primary" | "more", displayOrder: structure.navigation.filter((candidate) => candidate.group === event.target.value).length })}><option value="primary">الشريط</option><option value="more">المزيد</option></select>
          <button className="cms-btn" type="button" aria-label={`تحريك ${item.label} لأعلى`} disabled={index === 0} onClick={() => moveNav(item.key, -1)}>↑</button><button className="cms-btn" type="button" aria-label={`تحريك ${item.label} لأسفل`} disabled={index === items.length - 1} onClick={() => moveNav(item.key, 1)}>↓</button>
        </div>
      </li>)}</ol></div>)}
    </section>

    <section className="cms-card"><div className="cms-section-title"><div><h2>أقسام إضافية في الرئيسية</h2><p className="cms-hint">اختر قسمًا تحريريًا موجودًا، ثم حدد نمط عرضه ومكان ظهوره. لا تُنشأ روابط أو تصنيفات غير معتمدة من هذه الشاشة.</p></div></div>
      <div className="cms-structure-add"><select value={newDesk} onChange={(event) => setNewDesk(event.target.value)} aria-label="اختيار قسم تحريري لإضافته"><option value="">اختر قسمًا لإضافته</option>{availableDesks.map((desk) => <option value={desk.slug} key={desk.slug}>{desk.label}</option>)}</select><button className="cms-btn" type="button" disabled={!newDesk} onClick={addSection}>＋ إضافة قسم</button></div>
      {structure.homepageSections.length === 0 ? <p className="cms-news-empty">لم تُضف أقسامًا إضافية. الأقسام التحريرية الأساسية في الصفحة مستمرة كما هي.</p> : <ol className="cms-structure-sections">{structure.homepageSections.map((section, index) => <li key={section.key}>
        <div className="cms-structure-section-head"><span className="cms-structure-order">{index + 1}</span><label className="cms-field"><span>عنوان القسم</span><input value={section.title} maxLength={80} onChange={(event) => updateSection(section.key, { title: event.target.value })} /></label><label className="cms-field"><span>نمط العرض</span><select value={section.layout} onChange={(event) => updateSection(section.key, { layout: event.target.value as CmsHomepageSection["layout"] })}>{LAYOUTS.map((layout) => <option value={layout.value} key={layout.value}>{layout.label}</option>)}</select></label>
          <div className="cms-structure-controls"><label><input type="checkbox" checked={section.isEnabled} onChange={(event) => updateSection(section.key, { isEnabled: event.target.checked })} /> مفعّل</label><label><input type="checkbox" checked={section.showOnWeb} onChange={(event) => updateSection(section.key, { showOnWeb: event.target.checked })} /> الويب</label><label><input type="checkbox" checked={section.showOnMobile} onChange={(event) => updateSection(section.key, { showOnMobile: event.target.checked })} /> الموبايل</label><button className="cms-btn" type="button" disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button><button className="cms-btn" type="button" disabled={index === structure.homepageSections.length - 1} onClick={() => moveSection(index, 1)}>↓</button><button className="cms-btn danger" type="button" onClick={() => removeSection(section.key)}>إزالة</button></div>
        </div><small className="cms-hint">المحتوى مأخوذ من desk «{PRESENTATION_DESKS.find((desk) => desk.slug === section.deskSlug)?.label}» · صفحة القسم: /category?cat={section.deskSlug}</small>
      </li>)}</ol>}
      {structure.lastModifiedAtUtc && <p className="cms-hint">آخر حفظ: {new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(structure.lastModifiedAtUtc))}</p>}
    </section>
  </div>}</LocalizedContent>;
}
