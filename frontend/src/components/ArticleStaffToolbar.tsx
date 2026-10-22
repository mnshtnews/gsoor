"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STAFF = ["Reporter", "AiEditor", "CopyEditor", "SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin", "SeoEditor", "FactChecker", "Researcher", "CrisisEditor"];

export function ArticleStaffToolbar({ articleId }: { articleId: string }) {
  const [staff, setStaff] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/cms-api/session", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ authenticated?: boolean; roles?: string[] }> : null)
      .then((session) => { if (active) setStaff(!!session?.authenticated && (session.roles ?? []).some((role) => STAFF.includes(role))); })
      .catch(() => { if (active) setStaff(false); });
    return () => { active = false; };
  }, []);
  if (!staff) return null;
  return <nav className="article-staff-toolbar wrap" aria-label="أدوات هيئة التحرير">
    <span><i aria-hidden="true" /> وضع التحرير</span>
    <div><Link href={"/cms/articles/" + articleId}>تحرير الخبر</Link><Link href="/cms">غرفة الأخبار</Link></div>
  </nav>;
}
