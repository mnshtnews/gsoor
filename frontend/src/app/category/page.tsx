import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryGridCard } from "@/components/StoryGridCard";
import { PRESENTATION_DESKS } from "@/lib/cms-client";
import { getPublishedNews } from "@/lib/news-api";
import { absoluteUrl } from "@/lib/site";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";

export const dynamic = "force-dynamic";
const CATEGORY_COPY = {
  ar: { missing: "القسم غير موجود", error: "تعذّر تحميل القسم", failed: "تعذّر الاتصال بالخادم. حاول تحديث الصفحة بعد قليل.", home: "الرئيسية", news: "الأخبار", published: "خبرًا منشورًا", empty: "لا توجد أخبار في هذا القسم حاليًا.", emptyHint: "ستظهر هنا الأخبار بعد نشرها وتحديد هذا القسم لها.", pages: "صفحات القسم", previous: "الصفحة السابقة", next: "الصفحة التالية" },
  en: { missing: "Section not found", error: "Could not load this section", failed: "The server could not be reached. Please try again shortly.", home: "Home", news: "News", published: "published stories", empty: "There are no stories in this section yet.", emptyHint: "Stories will appear here after they are published in this section.", pages: "Section pages", previous: "Previous page", next: "Next page" },
  fr: { missing: "Rubrique introuvable", error: "Impossible de charger cette rubrique", failed: "Le serveur est inaccessible. Veuillez réessayer dans quelques instants.", home: "Accueil", news: "Actualités", published: "articles publiés", empty: "Aucun article dans cette rubrique pour le moment.", emptyHint: "Les articles apparaîtront ici après leur publication dans cette rubrique.", pages: "Pages de la rubrique", previous: "Page précédente", next: "Page suivante" },
} as const;
const PAGE_SIZE = 18;

type SearchParams = Promise<{ cat?: string | string[]; page?: string | string[] }>;

async function resolveDesk(searchParams: SearchParams) {
  const params = await searchParams;
  const slug = typeof params.cat === "string" ? params.cat : null;
  return PRESENTATION_DESKS.find((desk) => desk.slug === slug) ?? null;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const desk = await resolveDesk(searchParams);
  if (!desk) { const locale = parseLocale((await cookies()).get("jusoor_locale")?.value); return { title: CATEGORY_COPY[locale].missing }; }
  const canonical = absoluteUrl(`/category?cat=${desk.slug}`);
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const label = locale === "ar" ? desk.label : locale === "en" ? ({ mughtarib: "Diaspora news", success: "Success stories", egypt: "Egypt news", opportunities: "Investment opportunities", official: "Ask an official", red: "Red line", lamma: "Community", secondgen: "Second generation", sports: "Sports", arts: "Arts", articles: "Opinion", fatwas: "Fatwas", events: "Events" } as Record<string, string>)[desk.slug] ?? desk.label : ({ mughtarib: "Actualités de la diaspora", success: "Histoires de réussite", egypt: "Actualités d’Égypte", opportunities: "Opportunités d’investissement", official: "Parole officielle", red: "Ligne rouge", lamma: "Communauté", secondgen: "Deuxième génération", sports: "Sport", arts: "Arts", articles: "Opinions", fatwas: "Fatwas", events: "Événements" } as Record<string, string>)[desk.slug] ?? desk.label;
  return { title: label, ...(canonical ? { alternates: { canonical } } : {}) };
}

export default async function CategoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const copy = CATEGORY_COPY[locale];
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const desk = await resolveDesk(searchParams);
  if (!desk) notFound();
  const deskLabel = locale === "ar" ? desk.label : locale === "en" ? ({ mughtarib: "Diaspora news", success: "Success stories", egypt: "Egypt news", opportunities: "Investment opportunities", official: "Ask an official", red: "Red line", lamma: "Community", secondgen: "Second generation", sports: "Sports", arts: "Arts", articles: "Opinion", fatwas: "Fatwas", events: "Events" } as Record<string, string>)[desk.slug] ?? desk.label : ({ mughtarib: "Actualités de la diaspora", success: "Histoires de réussite", egypt: "Actualités d’Égypte", opportunities: "Opportunités d’investissement", official: "Parole officielle", red: "Ligne rouge", lamma: "Communauté", secondgen: "Deuxième génération", sports: "Sport", arts: "Arts", articles: "Opinions", fatwas: "Fatwas", events: "Événements" } as Record<string, string>)[desk.slug] ?? desk.label;

  let result: Awaited<ReturnType<typeof getPublishedNews>>;
  try {
    result = await getPublishedNews(page, PAGE_SIZE, desk.slug);
  } catch {
    return <main id="main"><div className="wrap"><div className="state-panel" role="alert"><h1>{copy.error}</h1><p>{copy.failed}</p></div></div></main>;
  }

  return (
    <main id="main">
      <section className="page-header category-page-header">
        <div className="wrap">
          <nav className="breadcrumb" aria-label={locale === "ar" ? "مسار الصفحة" : locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
            <Link className="breadcrumb-home" href="/">{copy.home}</Link>
            <span className="breadcrumb-separator" aria-hidden="true">›</span>
            <Link className="breadcrumb-section" href="/">{copy.news}</Link>
            <span className="breadcrumb-separator" aria-hidden="true">›</span>
            <span aria-current="page">{deskLabel}</span>
          </nav>
          <div className="category-heading">
            <div className="category-heading-line" aria-hidden="true" />
            <div className="category-heading-content">
              <h1>{deskLabel}</h1>
              <p className="category-heading-meta">{result.totalCount} {copy.published}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section tight on-surface" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {result.items.length === 0 ? (
            <p className="empty-state" style={{ padding: "40px 0", textAlign: "center", color: "var(--text-mute)" }}>
              <strong>{copy.empty}</strong><br />{copy.emptyHint}
            </p>
          ) : (
            <div className="six-grid">
              {result.items.map((story) => <StoryGridCard key={story.id} story={story} />)}
            </div>
          )}
          {result.totalPages > 1 && (
            <nav className="pagination" aria-label={copy.pages}>
              {page > 1 && <Link href={`/category?cat=${desk.slug}&page=${page - 1}`} rel="prev" aria-label={copy.previous}>‹</Link>}
              {Array.from({ length: result.totalPages }, (_, index) => index + 1)
                .filter((number) => result.totalPages <= 7 || number === 1 || number === result.totalPages || Math.abs(number - page) <= 1)
                .map((number, index, visible) => (
                  <span key={number} style={{ display: "contents" }}>
                    {index > 0 && number - visible[index - 1] > 1 && <span aria-hidden="true">…</span>}
                    <Link href={`/category?cat=${desk.slug}&page=${number}`} aria-current={number === page ? "page" : undefined}>{number}</Link>
                  </span>
                ))}
              {page < result.totalPages && <Link href={`/category?cat=${desk.slug}&page=${page + 1}`} rel="next" aria-label={copy.next}>›</Link>}
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
