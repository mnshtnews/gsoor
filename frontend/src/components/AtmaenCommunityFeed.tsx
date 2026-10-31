"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicCountry } from "@/lib/news-api";
import { useUiLocale } from "@/lib/use-ui-locale";

type City = { id: string; nameAr: string; nameEn: string };
type Comment = { id: string; authorName: string; text: string; createdAtUtc: string };
type Post = { id: string; authorName: string; countryId: string; country: string; cityId: string; city: string; status: string; message: string; createdAtUtc: string; likeCount: number; commentCount: number; isLiked: boolean; latestComments: Comment[] };
type Feed = { items: Post[]; page: number; pageSize: number; totalCount: number };
const STATUSES = ["تم الاطمئنان", "شوهد بخير", "تم التواصل", "بحاجة لمزيد من المعلومات"];

async function api<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, { method: body === undefined ? "GET" : "POST", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message || "تعذّر إكمال الطلب.");
  return result;
}

function relativeTime(iso: string, locale: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  const formatter = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : locale, { numeric: "auto" });
  if (minutes < 60) return formatter.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");
  return formatter.format(-Math.floor(hours / 24), "day");
}

export function AtmaenCommunityFeed() {
  const { locale } = useUiLocale();
  const isArabic = locale === "ar";
  const [countries, setCountries] = useState<PublicCountry[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [feed, setFeed] = useState<Feed>({ items: [], page: 1, pageSize: 10, totalCount: 0 });
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("new");
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [status, setStatus] = useState(STATUSES[0]);
  const [message, setMessage] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showComments, setShowComments] = useState<string[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);

  const countryName = useMemo(() => (id: string) => { const c = countries.find(x => x.id === id); return c ? (isArabic ? c.nameAr : c.nameEn) : ""; }, [countries, isArabic]);
  const cityName = useMemo(() => (id: string) => { const c = cities.find(x => x.id === id); return c ? (isArabic ? c.nameAr : c.nameEn) : ""; }, [cities, isArabic]);
  const loadFeed = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: "10", sort });
      if (countryFilter) query.set("countryId", countryFilter);
      if (statusFilter) query.set("status", statusFilter);
      setFeed(await api<Feed>(`/account-api/atmaen-community/posts?${query}`));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "تعذّر تحميل التحديثات."); }
    finally { setLoading(false); }
  }, [page, countryFilter, statusFilter, sort]);

  useEffect(() => { let live = true; fetch("/account-api/session", { cache: "no-store" }).then(r => r.ok ? r.json() : { authenticated: false }).then(data => { if (live) setAuthenticated(Boolean(data.authenticated)); }).catch(() => undefined); return () => { live = false; }; }, []);
  useEffect(() => { let live = true; fetch("/account-api/geography", { cache: "no-store" }).then(r => r.json()).then((data: PublicCountry[]) => { if (live) setCountries(Array.isArray(data) ? data : []); }).catch(() => undefined); return () => { live = false; }; }, []);
  useEffect(() => { void loadFeed(); }, [loadFeed]);
  useEffect(() => { let live = true; setCityId(""); setCities([]); if (countryId) fetch(`/account-api/geography?countryId=${encodeURIComponent(countryId)}`, { cache: "no-store" }).then(r => r.json()).then((data: City[]) => { if (live) setCities(Array.isArray(data) ? data : []); }).catch(() => undefined); return () => { live = false; }; }, [countryId]);

  async function createPost(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api<Post>("/account-api/atmaen-community/posts", { countryId, cityId, status, message, publicConsent });
      setMessage(""); setCountryId(""); setCityId(""); setPublicConsent(false); setShowComposer(false); setPage(1); setNotice("نُشر تحديثك في مجتمع الاطمئنان."); await loadFeed();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "تعذّر نشر التحديث."); }
    finally { setBusy(false); }
  }

  async function like(post: Post) {
    setError("");
    try { await api(`/account-api/atmaen-community/posts/${post.id}/like`, {}); await loadFeed(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "سجّل الدخول للتفاعل."); }
  }

  async function comment(post: Post) {
    const text = commentDrafts[post.id]?.trim(); if (!text) return;
    setBusy(true); setError("");
    try { await api(`/account-api/atmaen-community/posts/${post.id}/comments`, { text }); setCommentDrafts(current => ({ ...current, [post.id]: "" })); await loadFeed(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "تعذّر إضافة التعليق."); }
    finally { setBusy(false); }
  }

  async function report(post: Post) {
    const reason = window.prompt("ما سبب إبلاغك عن هذا التحديث؟"); if (!reason?.trim()) return;
    setError(""); setNotice("");
    try { await api(`/account-api/atmaen-community/posts/${post.id}/reports`, { reason }); setNotice("وصل بلاغك إلى فريق جسور للمراجعة."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تعذّر إرسال البلاغ."); }
  }

  return <main className="atmaen-community" dir={isArabic ? "rtl" : "ltr"}>
    <section className="atmaen-community-hero"><div className="wrap">
      <Link href="/atmaen" className="atmaen-community-back">{isArabic ? "← خدمة اطمّن الخاصة" : "← Private Atmaen service"}</Link>
      <div className="atmaen-community-hero__grid"><div><span className="atmaen-community-eyebrow">{isArabic ? "مجتمع جسور" : "Jusoor community"}</span><h1>{isArabic ? "اطمّن — تحديثات الاطمئنان من المجتمع" : "Atmaen — community reassurance updates"}</h1><p>{isArabic ? "مساحة مجتمعية لمشاركة تحديثات عامة تساعد على الاطمئنان. لا تنشر أسماء أو أرقام تواصل أو تفاصيل خاصة." : "A community space for general reassurance updates. Never share names, contact details, or private information."}</p></div><button className="atmaen-community-primary" onClick={() => { setShowComposer(value => !value); setError(""); }}>{showComposer ? (isArabic ? "إغلاق" : "Close") : (isArabic ? "+ شارك تحديثًا" : "+ Share an update")}</button></div>
    </div></section>
    <div className="wrap atmaen-community-body">
      <div className="atmaen-community-trust"><span>🔒 {isArabic ? "هذه مساحة عامة منفصلة عن بلاغات اطمّن السرية" : "This public space is separate from private Atmaen reports."}</span><span>ℹ️ {isArabic ? "المحتوى يكتبه المجتمع ولا يمثل تحققًا رسميًا" : "Community posts are not officially verified."}</span><Link href="/atmaen">{isArabic ? "إرسال بلاغ خاص ←" : "Submit a private report →"}</Link></div>
      {notice && <div className="atmaen-community-notice" role="status">{notice}</div>}{error && <div className="atmaen-community-error" role="alert">{error}</div>}
      {showComposer && (authenticated ? <form className="atmaen-community-composer" onSubmit={createPost}>
        <div className="atmaen-community-composer__head"><div><span>{isArabic ? "مشاركة عامة" : "Public update"}</span><h2>{isArabic ? "شارك تحديثًا يبعث على الاطمئنان" : "Share a reassuring update"}</h2></div><span aria-hidden="true">✍️</span></div>
        <p>{isArabic ? "اكتب ما يمكن مشاركته علنًا فقط. لا تذكر اسم الشخص أو عنوانه أو رقم هاتفه أو أي معلومات صحية أو مالية." : "Only share information intended for the public. Do not include anyone’s name, address, phone, health, or financial details."}</p>
        <div className="atmaen-community-form-grid"><label><span>{isArabic ? "الدولة" : "Country"}</span><select required value={countryId} onChange={e => setCountryId(e.target.value)}><option value="">{isArabic ? "اختر الدولة" : "Select a country"}</option>{countries.map(c => <option value={c.id} key={c.id}>{isArabic ? c.nameAr : c.nameEn}</option>)}</select></label><label><span>{isArabic ? "المدينة" : "City"}</span><select required value={cityId} onChange={e => setCityId(e.target.value)} disabled={!countryId || cities.length === 0}><option value="">{isArabic ? "اختر المدينة" : "Select a city"}</option>{cities.map(c => <option value={c.id} key={c.id}>{isArabic ? c.nameAr : c.nameEn}</option>)}</select></label><label><span>{isArabic ? "الحالة" : "Status"}</span><select value={status} onChange={e => setStatus(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label></div>
        <label className="atmaen-community-message"><span>{isArabic ? "التحديث" : "Update"}</span><textarea required minLength={10} maxLength={1000} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder={isArabic ? "اكتب تحديثًا عامًا ومختصرًا…" : "Write a short public update…"}/><small>{message.length} / 1000</small></label>
        <label className="atmaen-community-consent"><input type="checkbox" checked={publicConsent} onChange={e => setPublicConsent(e.target.checked)} required/><span>{isArabic ? "سيظهر اسم حسابي والتحديث للعامة. أملك الإذن لمشاركة المعلومة، ولن أذكر بيانات تعريفية أو معلومات تواصل عن الشخص." : "My account display name and this update will be public. I have permission to share it and will not include another persons identifying or contact information."}</span></label>
        <div className="atmaen-community-composer__actions"><button type="submit" disabled={busy || !publicConsent}>{busy ? (isArabic ? "جارٍ النشر…" : "Publishing…") : (isArabic ? "نشر التحديث" : "Publish update")}</button></div>
      </form> : <div className="atmaen-community-composer atmaen-community-signin"><h2>{isArabic ? "سجّل الدخول للمشاركة" : "Sign in to participate"}</h2><p>{isArabic ? "يمكن للجميع تصفّح التحديثات. يلزم تسجيل الدخول لنشر تحديث أو تعليق أو إعجاب." : "Anyone can browse. Sign in to publish, comment, or react."}</p><Link href="/auth?tab=login">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link></div>)}
      <div className="atmaen-community-toolbar"><div><span>{isArabic ? "تصفّح التحديثات" : "Browse updates"}</span><strong>{feed.totalCount} {isArabic ? "تحديث مجتمعي" : "community updates"}</strong></div><div className="atmaen-community-filters"><select aria-label={isArabic ? "تصفية حسب الدولة" : "Filter by country"} value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(1); }}><option value="">{isArabic ? "كل الدول" : "All countries"}</option>{countries.map(c => <option key={c.id} value={c.id}>{isArabic ? c.nameAr : c.nameEn}</option>)}</select><select aria-label={isArabic ? "تصفية حسب الحالة" : "Filter by status"} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}><option value="">{isArabic ? "كل الحالات" : "All statuses"}</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><select aria-label={isArabic ? "ترتيب التحديثات" : "Sort updates"} value={sort} onChange={e => setSort(e.target.value)}><option value="new">{isArabic ? "الأحدث" : "Newest"}</option><option value="active">{isArabic ? "الأكثر تفاعلًا" : "Most active"}</option></select></div></div>
      <div className="atmaen-community-layout"><section className="atmaen-community-feed" aria-label={isArabic ? "تحديثات المجتمع" : "Community updates"}>
        {loading ? <div className="atmaen-community-empty">{isArabic ? "جارٍ تحميل التحديثات…" : "Loading updates…"}</div> : feed.items.length === 0 ? <div className="atmaen-community-empty"><span>🕊️</span><h2>{isArabic ? "لا توجد تحديثات بعد" : "No updates yet"}</h2><p>{isArabic ? "كن أول من يشارك تحديثًا عامًا يطمئن المجتمع." : "Be the first to share a public update."}</p><button className="atmaen-community-primary" onClick={() => setShowComposer(true)}>{isArabic ? "شارك تحديثًا" : "Share an update"}</button></div> : feed.items.map(post => <article className="atmaen-community-post" key={post.id}>
          <header><div className="atmaen-community-avatar" aria-hidden="true">{post.authorName.trim().charAt(0)}</div><div className="atmaen-community-author"><strong>{post.authorName}</strong><span>{relativeTime(post.createdAtUtc, locale)}</span></div><span className="atmaen-community-badge">{post.status}</span></header>
          <div className="atmaen-community-location">📍 {isArabic ? post.city : cityName(post.cityId) || post.city}، {isArabic ? post.country : countryName(post.countryId) || post.country}</div>
          <p className="atmaen-community-post__text">{post.message}</p>
          <div className="atmaen-community-post__meta"><span>ℹ️ {isArabic ? "تحديث من المجتمع — غير متحقق رسميًا" : "Community update — not officially verified"}</span></div>
          <footer><button className={post.isLiked ? "is-liked" : ""} onClick={() => void like(post)} aria-pressed={post.isLiked}>🤍 {isArabic ? "اطمئننت" : "Reassured"} <b>{post.likeCount}</b></button><button onClick={() => setShowComments(current => current.includes(post.id) ? current.filter(id => id !== post.id) : [...current, post.id])}>💬 {isArabic ? "التعليقات" : "Comments"} <b>{post.commentCount}</b></button><button className="atmaen-community-report" onClick={() => void report(post)}>{isArabic ? "إبلاغ" : "Report"}</button></footer>
          {showComments.includes(post.id) && <div className="atmaen-community-comments">{post.latestComments.length === 0 ? <p>{isArabic ? "ابدأ الحوار بتعليق محترم." : "Start a respectful conversation."}</p> : post.latestComments.map(c => <div className="atmaen-community-comment" key={c.id}><strong>{c.authorName}</strong><p>{c.text}</p><time>{relativeTime(c.createdAtUtc, locale)}</time></div>)}{post.commentCount > post.latestComments.length && <span>{isArabic ? `نعرض أحدث ${post.latestComments.length} تعليقات من ${post.commentCount}.` : `Showing ${post.latestComments.length} of ${post.commentCount} comments.`}</span>}<div className="atmaen-community-comment-form"><input maxLength={500} value={commentDrafts[post.id] || ""} onChange={e => setCommentDrafts(current => ({ ...current, [post.id]: e.target.value }))} placeholder={isArabic ? "أضف تعليقًا مفيدًا…" : "Add a helpful comment…"}/><button disabled={busy || !commentDrafts[post.id]?.trim()} onClick={() => void comment(post)}>{isArabic ? "إرسال" : "Send"}</button></div></div>}
        </article>)}
        {feed.totalCount > 10 && <div className="atmaen-community-pagination"><button disabled={page <= 1 || loading} onClick={() => setPage(x => x - 1)}>{isArabic ? "الأحدث" : "Previous"}</button><span>{page} / {Math.ceil(feed.totalCount / 10)}</span><button disabled={page >= Math.ceil(feed.totalCount / 10) || loading} onClick={() => setPage(x => x + 1)}>{isArabic ? "الأقدم" : "Next"}</button></div>}
      </section><aside className="atmaen-community-aside"><div><span>🛡️</span><h2>{isArabic ? "مساحة آمنة للجميع" : "A safer space for everyone"}</h2><ul><li>{isArabic ? "لا تنشر أسماء أو أرقامًا أو عناوين." : "Do not post names, numbers, or addresses."}</li><li>{isArabic ? "المعلومات يشاركها أفراد المجتمع ولا نؤكدها رسميًا." : "Information is community-shared, not officially verified."}</li><li>{isArabic ? "أبلغ عن المحتوى الذي يخالف قواعد السلامة." : "Report content that violates safety rules."}</li></ul><Link href="/privacy">{isArabic ? "سياسة الخصوصية" : "Privacy policy"}</Link></div><div className="atmaen-community-aside__private"><h3>{isArabic ? "تحتاج إلى مساعدة خاصة؟" : "Need private assistance?"}</h3><p>{isArabic ? "لا تكتب تفاصيل حالتك هنا. استخدم نموذج البلاغ الخاص والمشفر." : "Do not post case details here. Use the private, encrypted report form."}</p><Link href="/atmaen">{isArabic ? "إرسال بلاغ خاص ←" : "Submit a private report →"}</Link></div></aside></div>
    </div>
  </main>;
}
