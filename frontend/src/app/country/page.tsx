import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { notFound } from "next/navigation";
import { StoryGridCard } from "@/components/StoryGridCard";
import { getPublicCountries, getPublishedNews } from "@/lib/news-api";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 18;
type SearchParams = Promise<{ code?: string | string[]; page?: string | string[] }>;

async function loadCountry(params: SearchParams) {
  const search = await params;
  const code = typeof search.code === "string" ? search.code.trim().toUpperCase() : "";
  const rawPage = typeof search.page === "string" ? Number(search.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  if (!/^[A-Z]{2}$/.test(code)) return null;
  const countries = await getPublicCountries();
  const country = countries.find((item) => item.isoCode2.toUpperCase() === code);
  return country ? { country, page } : null;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const data = await loadCountry(searchParams).catch(() => null);
  if (!data) return { title: "أخبار البلد" };
  const title = `أخبار المصريين في ${data.country.nameAr} — جسور`;
  const canonical = absoluteUrl(`/country?code=${data.country.isoCode2}`);
  return { title, description: `آخر الأخبار المنشورة المرتبطة بـ${data.country.nameAr} على منصة جسور.`, ...(canonical ? { alternates: { canonical } } : {}) };
}

export default async function CountryPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t = (value: string) => translateUi(locale, value);
  const data = await loadCountry(searchParams).catch(() => null);
  if (!data) notFound();
  const { country, page } = data;
  let result: Awaited<ReturnType<typeof getPublishedNews>>;
  try {
    result = await getPublishedNews(page, PAGE_SIZE, undefined, undefined, undefined, country.id);
  } catch {
    return <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}><section className="wrap state-panel" role="alert"><h1>{t("تعذّر تحميل أخبار البلد")}</h1><p>{t("تعذّر الاتصال بالخادم. حاول تحديث الصفحة بعد قليل.")}</p></section></main>;
  }
  return <main id="main" className="country-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="page-header"><div className="wrap">
      <nav className="breadcrumb" aria-label={t("مسار الصفحة")}><Link className="breadcrumb-home" href="/">{t("الرئيسية")}</Link><span className="breadcrumb-separator" aria-hidden="true">›</span><span aria-current="page">{locale === "ar" ? country.nameAr : country.nameEn}</span></nav>
      <div className="category-heading"><div className="category-heading-line" aria-hidden="true"/><div className="category-heading-content"><span className="eyebrow">{t("أخبار بحسب البلد")}</span><h1>{locale === "ar" ? `أخبار المصريين في ${country.nameAr}` : locale === "en" ? `Egyptians abroad in ${country.nameEn}` : `Égyptiens à l’étranger en ${country.nameEn}`}</h1><p className="category-heading-meta">{result.totalCount} {t("خبرًا منشورًا")}</p></div></div>
    </div></section>
    <section className="section tight on-surface"><div className="wrap">
      {result.items.length ? <div className="six-grid">{result.items.map((story) => <StoryGridCard key={story.id} story={story} locale={locale} />)}</div> : <p className="empty-state" style={{padding:"40px 0",textAlign:"center",color:"var(--text-mute)"}}>{t("لا توجد أخبار منشورة مرتبطة بهذا البلد حاليًا.")}</p>}
      {result.totalPages > 1 && <nav className="pagination" aria-label={t("صفحات أخبار البلد")}>
        {page > 1 && <Link href={`/country?code=${country.isoCode2}&page=${page-1}`} rel="prev" aria-label={t("الصفحة السابقة")}>‹</Link>}
        <span aria-current="page">{page} / {result.totalPages}</span>
        {page < result.totalPages && <Link href={`/country?code=${country.isoCode2}&page=${page+1}`} rel="next" aria-label={t("الصفحة التالية")}>›</Link>}
      </nav>}
    </div></section>
  </main>;
}
