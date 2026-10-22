"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cms, cmsSiteStructure, CmsError, PRESENTATION_DESKS, type CmsHomepageSection, type CmsSiteNavigationItem, type CmsSiteStructure } from "@/lib/cms-client";

const DEFAULT_STRUCTURE: CmsSiteStructure = { navigation: [], homepageSections: [], leadership: { boardChairman: "", editorInChief: "أحمد سليمان", executiveEditor: "أشرف جبريل" }, lastModifiedAtUtc: null };
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

  const load = useCallback(async () => {
    setError("");
    try {
      const session = await cms.session();
      if (!session.authenticated) { router.replace("/cms/login"); return; }
      const allowed = !!session.roles?.includes("EditorInChief");
      setCanManage(allowed);
      if (!allowed) { setError("إدارة هيكل الموقع متاحة لرئيس التحرير فقط."); return; }
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
  const updateLeadership = (key: keyof CmsSiteStructure["leadership"], value: string) => {
    setStructure((current) => ({ ...current, leadership: { ...current.leadership, [key]: value } }));
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
      const saved = await cmsSiteStructure.save({ navigation: structure.navigation.map((item) => ({ ...item, displayOrder: structure.navigation.filter((entry) => entry.group === item.group).sort((a, b) => a.displayOrder - b.displayOrder).findIndex((entry) => entry.key === item.key) })), homepageSections: structure.homepageSections.map((section, displayOrder) => ({ ...section, displayOrder })), leadership: structure.leadership });
      setStructure(saved); setDirty(false); setNotice("حُفظت الإعدادات وستنعكس على الموقع بعد تحديث الصفحة الرئيسية.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر حفظ الإعدادات."); }
    finally { setBusy(false); }
  }

  if (!loaded) return <div className="cms-page-stack"><p className="cms-hint">جارٍ تحميل إعدادات الموقع…</p></div>;
  return <div className="cms-page-stack cms-site-structure" dir="rtl">
    <section className="cms-page-heading"><div><span className="cms-eyebrow">إدارة تجربة الموقع</span><h1>الرئيسية والتنقل</h1><p>تحكم في روابط الشريط وأقسام تحريرية إضافية تظهر على الويب والموبايل.</p></div><button className="cms-btn primary" disabled={!canManage || !dirty || busy} onClick={() => void save()}>{busy ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button></section>
    {error && <div className="cms-msg error" role="alert">{error}<button className="cms-btn" type="button" onClick={() => void load()}>إعادة المحاولة</button></div>}
    {notice && <div className="cms-msg ok" role="status">{notice}</div>}

    <section className="cms-card"><div className="cms-section-title"><div><h2>أسماء الإدارة والتحرير</h2><p className="cms-hint">تظهر بجوار شعار جسور في ترويسة الموقع، وتُحفظ مركزيًا لتعديلها عند الحاجة.</p></div></div>
      <div className="cms-leadership-fields">
        <label className="cms-field"><span>رئيس مجلس الإدارة</span><input maxLength={100} value={structure.leadership.boardChairman} onChange={(event) => updateLeadership("boardChairman", event.target.value)} placeholder="الاسم" /></label>
        <label className="cms-field"><span>رئيس التحرير</span><input maxLength={100} value={structure.leadership.editorInChief} onChange={(event) => updateLeadership("editorInChief", event.target.value)} placeholder="الاسم" /></label>
        <label className="cms-field"><span>رئيس التحرير التنفيذي</span><input maxLength={100} value={structure.leadership.executiveEditor} onChange={(event) => updateLeadership("executiveEditor", event.target.value)} placeholder="الاسم" /></label>
      </div>
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
  </div>;
}
