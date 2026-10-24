import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import Image from "next/image";
import { notFound } from "next/navigation";
import { StoryGridCard } from "@/components/StoryGridCard";
import { getPublishedNews } from "@/lib/news-api";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 18;
type SearchParams = Promise<{ name?: string | string[]; page?: string | string[] }>;

async function resolveAuthor(searchParams: SearchParams) {
  const params = await searchParams;
  const name = typeof params.name === "string" ? params.name.trim() : "";
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  return { name, page };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { name } = await resolveAuthor(searchParams);
  if (!name) return { title: "الكاتب غير موجود" };
  const canonical = absoluteUrl(`/author?name=${encodeURIComponent(name)}`);
  return { title: `مقالات ${name} — جسور`, ...(canonical ? { alternates: { canonical } } : {}) };
}

export default async function AuthorPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t = (value: string) => translateUi(locale, value);
  const { name, page } = await resolveAuthor(searchParams);
  if (!name || name.length > 120) notFound();

  let result: Awaited<ReturnType<typeof getPublishedNews>>;
  try {
    result = await getPublishedNews(page, PAGE_SIZE, undefined, undefined, name);
  } catch {
    return <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}><section className="wrap author-state"><h1>{t("تعذّر تحميل صفحة الكاتب")}</h1><p>{t("تعذّر الاتصال بالخادم. حاول تحديث الصفحة بعد قليل.")}</p></section></main>;
  }
  if (result.totalCount === 0) notFound();

  const authorImage = result.items.find((story) => story.authorImageUrl)?.authorImageUrl;
  return <main id="main" className="author-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <nav className="wrap breadcrumb author-breadcrumb" aria-label={t("مسار الصفحة")}>
      <Link className="breadcrumb-home" href="/">{t("الرئيسية")}</Link><span className="breadcrumb-separator" aria-hidden="true">›</span>
      <Link className="breadcrumb-section" href="/category?cat=articles">{t("مقالات الرأي")}</Link><span className="breadcrumb-separator" aria-hidden="true">›</span>
      <span aria-current="page">{name}</span>
    </nav>
    <section className="author-hero-section on-surface"><div className="wrap author-hero">
      {authorImage ? <Image className="author-hero-avatar" src={authorImage} alt={`صورة ${name}`} width={128} height={128} unoptimized /> : <span className="author-hero-avatar author-hero-avatar--initial" aria-hidden="true">{name.slice(0, 1)}</span>}
      <div className="author-hero-info"><span className="eyebrow">{t("كاتب / كاتبة جسور")}</span><h1>{name}</h1><p>{t("كل المقالات المنشورة باسم الكاتب على منصة جسور.")}</p><span className="author-stats">{result.totalCount} {t("مادة منشورة")}</span></div>
    </div></section>
    <section className="section on-surface"><div className="wrap">
      <div className="section-head"><h2>{t("مقالات الكاتب")}</h2><span className="author-article-range">{new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "medium" }).format(new Date(result.items[0]?.publishedAtUtc ?? Date.now()))}{result.items[0] && result.items.length > 1 ? ` — ${new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "medium" }).format(new Date(result.items.at(-1)?.publishedAtUtc ?? Date.now()))}` : ""}</span></div>
      <div className="six-grid">{result.items.map((story) => <StoryGridCard key={story.id} story={story} />)}</div>
      {result.totalPages > 1 && <nav className="pagination" aria-label={t("صفحات مقالات الكاتب")}>
        {page > 1 && <Link href={`/author?name=${encodeURIComponent(name)}&page=${page - 1}`} rel="prev" aria-label={t("الصفحة السابقة")}>‹</Link>}
        <span aria-current="page">{page} / {result.totalPages}</span>
        {page < result.totalPages && <Link href={`/author?name=${encodeURIComponent(name)}&page=${page + 1}`} rel="next" aria-label={t("الصفحة التالية")}>›</Link>}
      </nav>}
    </div></section>
  </main>;
}
