"use client";

import { useEffect, useState } from "react";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState<"ar" | "en" | "fr">("ar");
  const t = (value: string) => translateUi(locale, value);
  useEffect(() => {
    const value = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jusoor_locale="))?.split("=")[1];
    setLocale(parseLocale(value ? decodeURIComponent(value) : null));
  }, []);

  useEffect(() => {
    // Real server-side logging doesn't exist yet (no telemetry/Sentry-style
    // sink wired up in Phase 1) — console.error is the honest placeholder:
    // visible in server logs, not pretending to be a real observability
    // pipeline.
    console.error(error);
  }, [error]);

  return (
    <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="wrap">
        <div className="state-panel">
          <h2>{t("حدث خطأ غير متوقع")}</h2>
          <p>{t("نعتذر عن الإزعاج. حاول تحديث الصفحة، أو عد إلينا بعد قليل.")}</p>
          <p style={{ marginTop: 16 }}>
            <button type="button" className="btn-nav btn-accent" onClick={() => reset()}>
              إعادة المحاولة
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
