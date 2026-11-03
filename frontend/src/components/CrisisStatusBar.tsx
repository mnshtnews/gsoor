"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CrisisAlertAudio from "@/components/CrisisAlertAudio";
import { CrisisAccountActions } from "@/components/CrisisAccountActions";
import type { PublicCrisisMode } from "@/lib/news-api";

export function CrisisStatusBar({ crisis: initialCrisis }: { crisis: PublicCrisisMode | null }) {
  const [current, setCurrent] = useState(initialCrisis);
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/crisis-mode", { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) return;
        const latest = await response.json() as PublicCrisisMode;
        if (alive) setCurrent(latest.isActive ? latest : null);
      } catch { /* Keep the last known alert visible during a brief network outage. */ }
    };
    const timer = window.setInterval(() => void refresh(), 15_000);
    window.addEventListener("focus", refresh);
    return () => { alive = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("crisis-mode-active", Boolean(current?.isActive && !pathname.startsWith("/cms")));
    return () => document.body.classList.remove("crisis-mode-active");
  }, [current, pathname]);

  if (!current?.isActive) return null;
  const crisis = current;
  const severity = crisis.severity === "emergency" ? "طوارئ" : crisis.severity === "advisory" ? "تنبيه" : "عاجل";
  return <aside className={`crisis-bar crisis-bar--${crisis.severity}`} role="status" aria-label={`تنبيه أزمة نشطة: ${severity}`}>
      <div className="crisis-bar__inner"><span className="crisis-bar__badge"><i className="crisis-bar__dot" aria-hidden="true" />{severity}</span>
        <p className="crisis-bar__text"><strong>{crisis.title}</strong><span> — {crisis.summary}</span></p>
        <div className={`crisis-bar__actions${crisis.soundUrl ? "" : " crisis-bar__actions--no-audio"}`}>{crisis.soundUrl && <CrisisAlertAudio src={crisis.soundUrl} repeatSeconds={crisis.soundRepeatIntervalSeconds} />}<Link className="crisis-bar__cta" href="/crisis">مركز الأزمة</Link><CrisisAccountActions /></div>
      </div>
    </aside>;
}
