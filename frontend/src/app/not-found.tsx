import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

export default async function NotFound() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t = (value: string) => translateUi(locale, value);
  return (
    <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="wrap">
        <div className="state-panel">
          <h2>{t("الصفحة غير موجودة")}</h2>
          <p>{t("الخبر أو الصفحة التي تبحث عنها غير متاحة، وربما تمت إزالتها.")}</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/" className="btn-nav btn-accent">{t("العودة للرئيسية")}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
