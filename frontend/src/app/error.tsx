"use client";

import { useEffect } from "react";
import { useUiLocale } from "@/lib/use-ui-locale";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dir, t } = useUiLocale();

  useEffect(() => {
    // Real server-side logging doesn't exist yet (no telemetry/Sentry-style
    // sink wired up in Phase 1) — console.error is the honest placeholder:
    // visible in server logs, not pretending to be a real observability
    // pipeline.
    console.error(error);
  }, [error]);

  return (
    <main id="main" dir={dir}>
      <div className="wrap">
        <div className="state-panel">
          <h2>{t("حدث خطأ غير متوقع")}</h2>
          <p>{t("نعتذر عن الإزعاج. حاول تحديث الصفحة، أو عد إلينا بعد قليل.")}</p>
          <p style={{ marginTop: 16 }}>
            <button type="button" className="btn-nav btn-accent" onClick={() => reset()}>
              {t("إعادة المحاولة")}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
