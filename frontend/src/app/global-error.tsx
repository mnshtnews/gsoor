"use client";

import { useEffect, useState } from "react";
import { parseLocale, type SiteLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState<SiteLocale>("ar");
  useEffect(() => {
    const value = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jusoor_locale="))?.split("=")[1];
    setLocale(parseLocale(value ? decodeURIComponent(value) : null));
  }, []);
  const t = (value: string) => translateUi(locale, value);
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body>
        <main id="main">
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
      </body>
    </html>
  );
}
