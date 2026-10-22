"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cms, cmsHomepagePolls, CmsError, type CmsHomepagePoll } from "@/lib/cms-client";

const blank = { id: "", question: "", options: "", isActive: false, startsAtUtc: "", endsAtUtc: "" };
export default function HomepagePollsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CmsHomepagePoll[]>([]);
  const [form, setForm] = useState(blank);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try { const session = await cms.session(); if (!session.authenticated) { router.replace("/auth?returnTo=%2Fcms%2Fpolls"); return; } setItems(await cmsHomepagePolls.list()); }
    catch (e) { if (e instanceof CmsError && e.status === 401) router.replace("/auth?returnTo=%2Fcms%2Fpolls"); else setError(e instanceof Error ? e.message : "تعذّر تحميل الاستبيانات."); }
    finally { setLoaded(true); }
  }, [router]);
  useEffect(() => { void load(); }, [load]);
  function edit(item: CmsHomepagePoll) {
    setForm({ id: item.id, question: item.question, options: item.options.join("\n"), isActive: item.isActive, startsAtUtc: item.startsAtUtc ? new Date(item.startsAtUtc).toISOString().slice(0, 16) : "", endsAtUtc: item.endsAtUtc ? new Date(item.endsAtUtc).toISOString().slice(0, 16) : "" });
    setNotice(""); setError("");
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const saved = await cmsHomepagePolls.save({ id: form.id || undefined, question: form.question.trim(), options: form.options.split(/\r?\n/).map((x) => x.trim()).filter(Boolean), isActive: form.isActive, startsAtUtc: form.startsAtUtc ? new Date(form.startsAtUtc).toISOString() : null, endsAtUtc: form.endsAtUtc ? new Date(form.endsAtUtc).toISOString() : null });
      setNotice(saved.isActive ? "حُفظ الاستبيان ونُشر في الرئيسية." : "حُفظ الاستبيان كمسودة."); setForm(blank); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذّر حفظ الاستبيان."); }
    finally { setBusy(false); }
  }
  async function deactivate(item: CmsHomepagePoll) {
    setBusy(true); setError("");
    try { await cmsHomepagePolls.deactivate(item.id); setNotice("أُوقف الاستبيان وأصبح محفوظًا في السجل."); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذّر إيقاف الاستبيان."); }
    finally { setBusy(false); }
  }
  if (!loaded) return <div className="cms-page-stack"><p>جارٍ تحميل الاستبيانات…</p></div>;
  return <div className="cms-page-stack cms-polls-page" dir="rtl">
    <section className="cms-page-heading"><div><span className="cms-eyebrow">التفاعل التحريري</span><h1>استبيانات الرئيسية</h1><p>أنشئ سؤالًا واختياراته، ثم فعّله ليظهر للزوار. لا يمكن تفعيل أكثر من استبيان في الوقت نفسه.</p></div></section>
    {error && <div className="cms-msg error" role="alert">{error}</div>}{notice && <div className="cms-msg ok" role="status">{notice}</div>}
    <section className="cms-card"><h2>{form.id ? "تحرير الاستبيان" : "إنشاء استبيان"}</h2><form className="cms-poll-form" onSubmit={(event) => void save(event)}>
      <label className="cms-field"><span>السؤال</span><input required minLength={8} maxLength={240} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} placeholder="ما الموضوع الذي ترغبون في متابعته؟" /></label>
      <label className="cms-field"><span>الاختيارات (اختيار في كل سطر، من 2 إلى 8)</span><textarea required rows={6} value={form.options} onChange={(event) => setForm({ ...form, options: event.target.value })} placeholder={"الخيار الأول\nالخيار الثاني"} /></label>
      <div className="cms-poll-dates"><label className="cms-field"><span>يبدأ في (اختياري)</span><input type="datetime-local" value={form.startsAtUtc} onChange={(event) => setForm({ ...form, startsAtUtc: event.target.value })} /></label><label className="cms-field"><span>ينتهي في (اختياري)</span><input type="datetime-local" value={form.endsAtUtc} onChange={(event) => setForm({ ...form, endsAtUtc: event.target.value })} /></label></div>
      <label className="cms-poll-active"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> تفعيل ونشر في الصفحة الرئيسية</label>
      <div className="cms-actions"><button className="cms-btn primary" type="submit" disabled={busy}>{busy ? "جارٍ الحفظ…" : form.id ? "حفظ التعديلات" : "إنشاء الاستبيان"}</button>{form.id && <button className="cms-btn" type="button" disabled={busy} onClick={() => setForm(blank)}>إلغاء التحرير</button>}</div>
    </form></section>
    <section className="cms-card"><div className="cms-section-title"><h2>الاستبيانات السابقة</h2><span className="cms-hint">{items.length} استبيان</span></div>
      {!items.length ? <p className="cms-news-empty">لم تُنشأ استبيانات بعد. ابدأ بسؤال واضح واختيارات قصيرة.</p> : <div className="cms-poll-list">{items.map((item) => <article className="cms-poll-item" key={item.id}><div><span className={"cms-badge " + (item.isActive ? "success" : "muted")}>{item.isActive ? "نشط" : "متوقف"}</span><h3>{item.question}</h3><p>{item.options.join(" · ")}</p><small>{item.totalVotes.toLocaleString("ar-EG")} مشاركة</small></div><div className="cms-actions"><button className="cms-btn" type="button" disabled={busy} onClick={() => edit(item)}>تحرير</button>{item.isActive && <button className="cms-btn danger" type="button" disabled={busy} onClick={() => void deactivate(item)}>إيقاف</button>}</div></article>)}</div>}
    </section>
  </div>;
}
