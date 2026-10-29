import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { getPublicSiteStructure } from "@/lib/news-api";
import { AccountPortal } from "@/components/AccountPortal";

export const metadata: Metadata = { title: "الدخول وإنشاء حساب | جسور", description: "سجّل الدخول أو أنشئ حسابًا للوصول إلى خدمات منصة جسور للمصريين بالخارج." };

export default async function AccountPage() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const structure = await getPublicSiteStructure().catch(() => null);
  const t = (value: string) => translateUi(locale, value);
  const slogan = structure?.leadership?.slogan?.trim() || "صوت المصريين في الخارج";
  return <main id="main" className="account-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="auth-shell">
      <aside className="auth-visual">
        <div>
          <Link href="/" className="auth-visual-brand" aria-label={t("العودة إلى جسور")}>
            <Image src={structure?.leadership?.logoUrl || "/assets/josour-logo-client.jpg"} alt="جسور" width={1104} height={974} priority />
            <span>{slogan === "صوت المصريين في الخارج" ? t(slogan) : slogan}</span>
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
