import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { getPublicCountries, getPublicCrisisMode } from "@/lib/news-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "مركز الأزمة | جسور",
  description: "التنبيهات التحريرية الموثقة للمصريين في الخارج.",
  robots: { index: false, follow: true },
};

export default async function CrisisPage() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t = (value: string) => translateUi(locale, value);
  const [crisisResult, countriesResult] = await Promise.allSettled([getPublicCrisisMode(), getPublicCountries()]);
  const crisis = crisisResult.status === "fulfilled" ? crisisResult.value : null;
  const countries = countriesResult.status === "fulfilled" ? countriesResult.value : [];
  const affected = new Set(crisis?.affectedCountryIds ?? []);
  const affectedCountries = countries.filter((country) => affected.has(country.id));
  const severity = t(crisis?.severity === "emergency" ? "طوارئ" : crisis?.severity === "advisory" ? "تنبيه" : "عاجل");

  return <main id="main" className="crisis-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    {crisis?.isActive ? <>
      <section className="crisis-hero"><div className="wrap">
        <span className="crisis-hero__eyebrow"><i className="crisis-bar__dot" aria-hidden="true" />{severity} · {t("مركز الأزمة")}</span>
        {locale !== "ar" && <p className="crisis-language-note">{t("رسالة الأزمة واردة باللغة العربية؛ يجب مراجعة ترجمتها التحريرية قبل عرضها بلغة أخرى.")}</p>}<h1 className="crisis-hero__title">{crisis.title}</h1>
        <p className="crisis-hero__summary">{crisis.summary}</p>
        {affectedCountries.length > 0 && <div className="crisis-country-list" aria-label={t("الدول المتأثرة")}>{affectedCountries.map((country) => <span key={country.id}>{locale === "ar" ? country.nameAr : country.nameEn}</span>)}</div>}
        <p className="crisis-hero__meta">{t("تحديث جسور:")} {crisis.lastModifiedAtUtc ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date(crisis.lastModifiedAtUtc)) : t("آخر تحديث")}</p>
        <p className="crisis-hero__source">{t("المصدر:")} <a href={crisis.sourceUrl} target="_blank" rel="noopener noreferrer">{crisis.sourceName} <span aria-hidden="true">↗</span></a></p>
        <div className="crisis-hero__actions"><a className="primary" href="#crisis-guidance">{t("إرشادات المتابعة")}</a><Link className="ghost" href="/">{t("العودة إلى الرئيسية")}</Link></div>
      </div></section>
      <section id="crisis-guidance" className="section"><div className="wrap"><article className="crisis-action-card"><span className="crisis-spotlight__eyebrow">{t("معلومات مهمة")}</span><h2>{t("تابع المصادر الرسمية")}</h2><p>{t("جسور منصة إعلامية للمعلومات والمتابعة، وليست جهة طوارئ أو استجابة رسمية. اتبع تعليمات السلطات المحلية والسفارة المصرية، وتحقق من تاريخ كل معلومة قبل تداولها.")}</p><p>{t("لا تنشر أرقام هواتف أو عناوين أو بيانات شخصية علنًا. البلاغات الفردية لا تظهر هنا ولا تُستخدم لإنتاج أعداد عامة.")}</p></article></div></section>
    </> : <section className="section crisis-empty-state"><div className="wrap"><div className="crisis-action-card"><span className="crisis-empty-icon" aria-hidden="true">✓</span><h1>{t("لا توجد أزمة نشطة حاليًا")}</h1><p>{t("يُفعّل مركز الأزمة من غرفة أخبار جسور عند اعتماد تنبيه للدول المتأثرة.")}</p><Link className="cms-btn primary" href="/">{t("العودة إلى الرئيسية")}</Link></div></div></section>}
  </main>;
}
