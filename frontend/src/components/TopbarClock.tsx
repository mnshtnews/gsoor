"use client";

import { useEffect, useState } from "react";
import type { SiteLocale } from "@/lib/site-copy";

function formatNow(locale: SiteLocale) {
  const now = new Date();
  const languageTag = locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-GB";
  return {
    date: new Intl.DateTimeFormat(languageTag, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now),
    time: new Intl.DateTimeFormat(languageTag, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now),
  };
}

export function TopbarClock({ locale = "ar" }: { locale?: SiteLocale }) {
  // Keep server and initial client markup identical; fill the live clock after mount.
  const [now, setNow] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    setNow(formatNow(locale));
    const interval = setInterval(() => setNow(formatNow(locale)), 1000);
    return () => clearInterval(interval);
  }, [locale]);

  return (
    <div className="topbar-datetime" dir={locale === "ar" ? "rtl" : "ltr"}>
      <span className="date-part">{now?.date ?? ""}</span>
      <span className="datetime-separator" aria-hidden="true">•</span>
      <span className="time-part">{now?.time ?? ""}</span>
    </div>
  );
}
