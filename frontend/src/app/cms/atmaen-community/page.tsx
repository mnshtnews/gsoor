"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cms } from "@/lib/cms-client";

type Report = { reportId: string; postId: string; reason: string; reportedAtUtc: string; authorName: string; country: string; city: string; status: string; message: string };
const MODERATOR_ROLES = ["SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin"];

export default function CmsAtmaenCommunityPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const session = await cms.session();
      if (!session.authenticated) { router.replace("/cms/login"); return; }
      if (!session.roles?.some(role => MODERATOR_ROLES.includes(role))) { setError("هذه الصفحة متاحة للمحررين المخولين بمراجعة المحتوى العام."); setReports([]); return; }
      const response = await fetch("/cms-api/atmaen/community/reports", { credentials: "same-origin", cache: "no-store" });
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data.message ?? "تعذّر تحميل البلاغات.");
      setReports(Array.isArray(data) ? data as Report[] : []);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "تعذّر تحميل المحتوى المبلغ عنه."); }
    finally { setLoading(false); }
  }, [router]);
  useEffect(() => { void load(); }, [load]);

  async function hidePost(postId: string) {
    setBusyId(postId); setError("");
    try {
      const response = await fetch(`/cms-api/atmaen/community/posts/${encodeURIComponent(postId)}/moderation`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: false }) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message ?? "تعذّر إخفاء التحديث."); }
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "تعذّر إخفاء التحديث."); }
    finally { setBusyId(""); }
  }

  return <div className="cms-page-stack">
    <section className="cms-page-heading"><div><span className="cms-eyebrow">مراجعة المحتوى العام</span><h1>مجتمع الاطمئنان</h1><p>راجع التحديثات التي أبلغ عنها المجتمع. هذه الشاشة لا تعرض البلاغات الخاصة أو بيانات الحالات السرية.</p></div><button className="cms-btn" type="button" disabled={loading} onClick={() => void load()}>{loading ? "جارٍ التحديث…" : "تحديث"}</button></section>
    {error && <div className="cms-msg error" role="alert">{error}</div>}
    <section className="cms-card"><div className="cms-section-title"><div><h2>تحديثات قيد المراجعة</h2><p className="cms-hint">يظهر لكل تحديث سبب الإبلاغ وعدد البلاغات المسجلة. إخفاء التحديث يزيله من المجتمع العام.</p></div><span className="cms-status-badge">{reports.length}</span></div>
      {loading ? <p>جارٍ تحميل البلاغات…</p> : reports.length === 0 ? <div className="cms-news-empty">لا توجد تحديثات منشورة أُبلغ عنها حاليًا.</div> : <div className="atmaen-community-reports">{reports.map(report => <article className="cms-card atmaen-community-report-card" key={report.reportId}><header><div><span className="cms-eyebrow">{report.status}</span><h3>{report.city}، {report.country}</h3><p>نشره {report.authorName} · {new Date(report.reportedAtUtc).toLocaleString("ar-EG")}</p></div><button className="cms-btn danger" type="button" disabled={busyId === report.postId} onClick={() => void hidePost(report.postId)}>{busyId === report.postId ? "جارٍ الإخفاء…" : "إخفاء التحديث"}</button></header><p className="atmaen-community-report-card__message">{report.message}</p><div><strong>سبب الإبلاغ:</strong> {report.reason}</div></article>)}</div>}
    </section>
    <p className="cms-hint cms-security-note">لا تستخدم هذه الأدوات للوصول إلى بلاغ «اطمّن» الخاص. لإدارة الحالات السرية، يلزم دور CrisisEditor والتكليف بالحالة.</p>
    <Link href="/cms/atmaen">قائمة الحالات السرية المسندة ←</Link>
  </div>;
}