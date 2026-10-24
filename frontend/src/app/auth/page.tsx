import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { AccountPortal } from "@/components/AccountPortal";

export const metadata: Metadata = { title: "الدخول وإنشاء حساب | جسور", description: "سجّل الدخول أو أنشئ حسابًا للوصول إلى خدمات منصة جسور للمصريين بالخارج." };

export default async function AccountPage() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t = (value: string) => translateUi(locale, value);
  return <main id="main" className="account-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="auth-shell">
      <aside className="auth-visual">
        <div>
          <Link href="/" className="auth-visual-brand" aria-label={t("العودة إلى جسور")}>
            <Image src="/assets/josour-logo-transparent.png" alt="جسور" width={1104} height={974} priority />
            <span>{t("المصريون بالخارج سفراء الوطن" )}</span>
          </Link>
          <h2>{t("أخبارك وخدماتك وشبكة اطمئنان أسرتك — ")}<span className="auth-visual-nowrap">{locale === "ar" ? "في مكان واحد." : locale === "en" ? "all in one place." : "en un seul endroit."}</span></h2>
        </div>
        <p className="quote">{t("تابع ما يهمك من أخبار المصريين بالخارج، واستفد من خدمات جسور أينما كنت." )}</p>
      </aside>
      <section className="auth-form-side">
        <AccountPortal />
        <div className="auth-panel-bottom"><Link href="/">{t("تصفّح الموقع كزائر")} <span aria-hidden="true">←</span></Link></div>
      </section>
    </div>
  </main>;
}
