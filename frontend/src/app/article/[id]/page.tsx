import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublishedNews, getPublishedNewsById, getPublicAdPlacements, type NewsRetraction } from "@/lib/news-api";
import { estimateReadMinutes } from "@/lib/format";
import { htmlToPlainText } from "@/lib/html";
import { CorrectionsBox } from "@/components/CorrectionsBox";
import { JsonLd } from "@/components/JsonLd";
import { articleDescription, articleUrl, buildArticleJsonLd, buildBreadcrumbJsonLd, toIsoDate } from "@/lib/seo";
import { EDITORIAL_BYLINE, SITE_NAME, absoluteUrl } from "@/lib/site";
import { StoryGridCard } from "@/components/StoryGridCard";
import { ArticleShareActions } from "@/components/ArticleShareActions";
import { ArticleReadingProgress } from "@/components/ArticleReadingProgress";
import { ConfiguredAd } from "@/components/home/ConfiguredAd";

import { ArticleStaffToolbar } from "@/components/ArticleStaffToolbar";
import { cookies } from "next/headers";
import { parseLocale, type SiteLocale } from "@/lib/site-copy";

const ARTICLE_COPY = {
 ar: { home: "الرئيسية", correction: "إشعار تحريري", retracted: "سُحب هذا الخبر", returnHome: "العودة إلى الصفحة الرئيسية", archived: "أرشيف", published: "نُشر في", minute: "دقيقة قراءة", minutes: "دقائق قراءة", sports: "التغطية الرياضية", players: "اللاعبون", taxonomy: "التصنيفات", moreAuthor: "المزيد من الكاتب", allAuthor: "كل مقالات", readAlso: "اقرأ أيضاً", sportsTypes: { EgyptianProfessionalsAbroad: "محترفون مصريون بالخارج", NaturalizedEgyptians: "لاعبون مصريون مجنسون", EgyptianLeague: "الدوري المصري", EgyptNationalTeam: "المنتخب المصري", General: "رياضة عامة" } },
 en: { home: "Home", correction: "Editorial notice", retracted: "This story was withdrawn", returnHome: "Return to the homepage", archived: "Archive", published: "Published", minute: "minute read", minutes: "minutes read", sports: "Sports coverage", players: "Players", taxonomy: "Topics", moreAuthor: "More from this author", allAuthor: "All stories by", readAlso: "Read also", sportsTypes: { EgyptianProfessionalsAbroad: "Egyptian professionals abroad", NaturalizedEgyptians: "Naturalized Egyptian players", EgyptianLeague: "Egyptian League", EgyptNationalTeam: "Egypt national team", General: "General sports" } },
 fr: { home: "Accueil", correction: "Avis éditorial", retracted: "Cet article a été retiré", returnHome: "Retour à l’accueil", archived: "Archives", published: "Publié le", minute: "minute de lecture", minutes: "minutes de lecture", sports: "Couverture sportive", players: "Joueurs", taxonomy: "Rubriques", moreAuthor: "Autres articles de cet auteur", allAuthor: "Tous les articles de", readAlso: "À lire aussi", sportsTypes: { EgyptianProfessionalsAbroad: "Professionnels égyptiens à l’étranger", NaturalizedEgyptians: "Joueurs égyptiens naturalisés", EgyptianLeague: "Championnat égyptien", EgyptNationalTeam: "Équipe nationale d’Égypte", General: "Sport en général" } },
} as const;
function formatLocalizedDate(value: string | null | undefined, locale: SiteLocale) { if (!value) return ""; const languageTag = locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-GB"; return new Intl.DateTimeFormat(languageTag, { dateStyle: "long" }).format(new Date(value)); }

// Always fresh: an unpublished article must stop resolving immediately.
export const dynamic = "force-dynamic";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Per-article <title>, description, canonical URL and Open Graph data
 * (Slice 18, spec §16). Before this every article shared the site-wide title.
 * An API failure deliberately returns the default metadata rather than
 * "noindex": a transient outage must never de-index a live article.
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);

  let result: Awaited<ReturnType<typeof getPublishedNewsById>>;
  try {
    result = await getPublishedNewsById(id);
  } catch {
    return {};
  }

  if (!result) {
    return { title: `${locale === "ar" ? "المقال غير موجود" : locale === "fr" ? "Article introuvable" : "Article not found"} — ${locale === "ar" ? SITE_NAME : "Jusoor"}`, robots: { index: false, follow: false } };
  }

  if (result.outcome === "retracted") {
    return {
      title: `${locale === "ar" ? "سحب الخبر" : locale === "fr" ? "Article retiré" : "Story withdrawn"} — ${locale === "ar" ? SITE_NAME : "Jusoor"}`,
      robots: { index: false, follow: false },
    };
  }

  const article = result.article;

  const description = article.seoDescription || articleDescription(article) || undefined;
  const canonical = article.canonicalUrl || absoluteUrl(articleUrl(article));
  const title = article.seoTitle || `${article.title} — ${SITE_NAME}`;

  return {
    title,
    description,
    robots: { index: !article.noIndex, follow: !article.noFollow },
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: article.socialTitle || title,
      description,
      ...(article.socialImageUrl ? { images: [article.socialImageUrl] } : {}),
      ...(canonical ? { url: canonical } : {}),
      publishedTime: toIsoDate(article.publishedAtUtc),
    },
    twitter: { card: (article.twitterImageUrl || article.socialImageUrl) ? "summary_large_image" : "summary", title: article.twitterTitle || article.socialTitle || title, description: article.twitterDescription || article.socialDescription || description,
      ...((article.twitterImageUrl || article.socialImageUrl) ? { images: [article.twitterImageUrl || article.socialImageUrl!] } : {}) },
  };
}

/**
 * Article page — Slice 8; since Slice 16 it renders a newsroom-PUBLISHED
 * article. Since Slice 21 the body is server-sanitized HTML (decision D2).
 * Originally Ported from the demo's article.html: breadcrumb,
 * article-head (eyebrow/subtitle/title/meta/share row), hero figure, and
 * article-body. Two deliberate departures from the literal demo markup:
 *   - No category/section exists in the Domain model yet, so the eyebrow
 *     breadcrumb link is omitted rather than showing a fake category.
 *   - .meta-city is rendered even though the demo's own inline <style>
 *     force-hides it (`display:none!important`) — that hide rule stays in
 *     the imported CSS untouched (not our call to reverse a client design
 *     decision), but showing city here specifically is intentionally
 *     different: Slice 6 makes real city data available for the first
 *     time, and a diaspora platform's whole premise is "where are our
 *     people" — so it's shown via .meta-item.meta-country instead of the
 *     suppressed .meta-city class, using the same visual treatment.
 */
export default async function ArticlePage({ params }: { params: Promise<{ id: string; slug?: string }> }) {
  const { id, slug } = await params;
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const copy = ARTICLE_COPY[locale];
  const result = await getPublishedNewsById(id);

  if (!result) {
    notFound();
  }

  if (result.outcome === "retracted") {
    const notice: NewsRetraction = result.notice;
    const retractedLabel = formatLocalizedDate(notice.retractedAtUtc, locale);
    return (
      <main id="main" className="wrap retraction-notice" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        <p className="article-eyebrow">{copy.correction}</p>
        <h1>{notice.title}</h1>
        <p>{copy.retracted}{retractedLabel ? <>{locale === "ar" ? " في " : locale === "fr" ? " le " : " on "}{retractedLabel}</> : null}.</p>
        <p>{notice.notice}</p>
        <Link className="cms-btn" href="/">{copy.returnHome}</Link>
      </main>
    );
  }

  const story = result.article;
  // Next hands non-ASCII dynamic segments over percent-encoded (Arabic slugs are the norm here:
  // the backend builds them from the title). Comparing the raw param with the stored slug made
  // EVERY Arabic article "non-canonical" -> permanentRedirect to the very same URL -> endless
  // redirect loop and a blank page. Decode before comparing.
  if (!slug || safeDecode(slug).normalize("NFC") !== story.slug.normalize("NFC")) permanentRedirect(articleUrl(story));

  const publishedLabel = formatLocalizedDate(story.publishedAtUtc, locale);
  const isOpinion = story.presentationDesks.includes("articles");
  const heroImageUrl = isOpinion ? story.authorImageUrl || story.socialImageUrl : story.socialImageUrl;
  let articleBottomAd;
  try { articleBottomAd = (await getPublicAdPlacements("web")).find((placement) => placement.slotKey === "article-bottom"); } catch { articleBottomAd = undefined; }
  const readMinutes = estimateReadMinutes(htmlToPlainText(story.body));
  const place = locale === "ar" ? story.cityNameAr ?? story.countryNameAr ?? null : story.cityNameEn ?? story.countryNameEn ?? story.cityNameAr ?? story.countryNameAr ?? null;
  const byline = story.authorName || EDITORIAL_BYLINE;
  const [authorResult, deskResult] = await Promise.allSettled([
    story.authorName ? getPublishedNews(1, 4, undefined, undefined, story.authorName) : Promise.resolve({ items: [] }),
    getPublishedNews(1, 8, story.presentationDesks[0]),
  ]);
  const moreFromAuthor = authorResult.status === "fulfilled"
    ? authorResult.value.items.filter((item) => item.id !== story.id).slice(0, 3)
    : [];
  const relatedStories = deskResult.status === "fulfilled"
    ? deskResult.value.items.filter((item) => item.id !== story.id).slice(0, 3)
    : [];
  const authorHref = story.authorName ? `/author?name=${encodeURIComponent(story.authorName)}` : null;
  const deskLabels: Record<string, Record<SiteLocale, string>> = {
    mughtarib: { ar: "أخبار المغتربين", en: "Diaspora news", fr: "Actualités de la diaspora" }, success: { ar: "قصة نجاح", en: "Success stories", fr: "Histoires de réussite" }, egypt: { ar: "أخبار مصر", en: "Egypt news", fr: "Actualités d’Égypte" }, opportunities: { ar: "فرص استثمارية", en: "Investment opportunities", fr: "Opportunités d’investissement" },
    official: { ar: "مع مسؤول", en: "Ask an official", fr: "Parole officielle" }, events: { ar: "فعاليات", en: "Events", fr: "Événements" }, red: { ar: "خط أحمر", en: "Red line", fr: "Ligne rouge" }, lamma: { ar: "اللمة الحلوة", en: "Community", fr: "Communauté" }, secondgen: { ar: "الجيل الثاني", en: "Second generation", fr: "Deuxième génération" },
    sports: { ar: "رياضة", en: "Sports", fr: "Sport" }, arts: { ar: "فنون", en: "Arts", fr: "Arts" }, articles: { ar: "مقالات رأي", en: "Opinion", fr: "Opinions" }, fatwas: { ar: "فتاوى", en: "Fatwas", fr: "Fatwas" },
  };

  return (
    <main id="main" className="article-page">
      <ArticleReadingProgress />
      <JsonLd data={buildArticleJsonLd(story)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: copy.home, path: "/" },
          { name: story.title, path: articleUrl(story) },
        ])}
      />
      <div className="wrap article-breadcrumb-wrap">
        <nav className="breadcrumb article-breadcrumb" aria-label={locale === "ar" ? "مسار الصفحة" : locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
          <Link href="/" className="breadcrumb-home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 10.8 12 3l9 7.8v9a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 19.8v-9Z" />
              <path d="M9 21v-6.2h6V21" />
            </svg>
            <span>{copy.home}</span>
          </Link>
        </nav>
      </div>
      <ArticleStaffToolbar articleId={story.id} />

      <div className="article-head wrap">
        {story.isArchived && (
          <p className="article-archive-label" role="status">
            <span className="status-pill archived">{copy.archived}</span>
            {publishedLabel && <span>{copy.published} {publishedLabel}</span>}
          </p>
        )}
        {story.summary && <p className="article-subtitle" lang={story.contentLocale} dir={story.contentLocale === "ar" ? "rtl" : "ltr"}>{story.summary}</p>}
        <h1 className="article-title" lang={story.contentLocale} dir={story.contentLocale === "ar" ? "rtl" : "ltr"}>{story.title}</h1>

        <div className="article-toolbar">
          <div className="article-meta">
            <span className="author">
              {story.authorImageUrl
                ? <Image className="avatar" src={story.authorImageUrl} alt={byline} width={26} height={26} unoptimized />
                : <span className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>ج</span>}
              {authorHref ? <Link href={authorHref} rel="author">{byline}</Link> : <span>{byline}</span>}
            </span>
            {publishedLabel && (
              <span className="meta-item meta-date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4.5" width="18" height="16" rx="2" />
                  <path d="M3 9.5h18" />
                  <path d="M8 3v3M16 3v3" />
                </svg>
                <span>{publishedLabel}</span>
              </span>
            )}
            {place && (
              <span className="meta-item meta-country">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10.5c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10.5" r="2.6" />
                </svg>
                <span>{place}</span>
              </span>
            )}
            <span className="meta-item meta-read">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.2 2" />
              </svg>
              <span>{readMinutes} {readMinutes === 1 ? copy.minute : copy.minutes}</span>
            </span>
          </div>
          <ArticleShareActions title={story.title} />
        </div>
      </div>

      <figure className="article-hero-figure">
        {heroImageUrl ? (
          // Image URL is persisted by the newsroom's media/SEO workflow.
          // Keep the branded placeholder only when the article has no cover.
          <Image className="article-hero-img wrap" src={heroImageUrl} alt={isOpinion && story.authorName ? `صورة الكاتب ${story.authorName}` : story.title} width={1200} height={760} unoptimized />
        ) : <div className="article-hero-img wrap article-hero-placeholder" aria-hidden="true"><span>جسور</span></div>}
      </figure>

      <div className="wrap">
        <CorrectionsBox corrections={story.corrections.filter((c) => c.isMajor)} major />
        {story.presentationDesks.includes("sports") && (story.sportsCoverageType || story.sportsPlayerNames.length > 0 || story.sportsTeamName || story.sportsCompetitionName || story.sportsCountryName) && <aside className="article-sports-facts" aria-label={copy.sports}>
          <strong>{copy.sports}</strong>
          {story.sportsCoverageType && <span>{(copy.sportsTypes as Record<string, string>)[story.sportsCoverageType] ?? copy.sports}</span>}
          {story.sportsPlayerNames.length > 0 && <span>{copy.players}: {story.sportsPlayerNames.join(locale === "ar" ? "، " : ", ")}</span>}
          {(story.sportsTeamName || story.sportsCompetitionName || story.sportsCountryName) && <span>{[story.sportsTeamName, story.sportsCompetitionName, story.sportsCountryName].filter(Boolean).join(" · ")}</span>}
        </aside>}
        {/* story.body is HTML that the API sanitized against an allow-list BEFORE storing it
            (Slice 21, decision D2); legacy plain-text articles arrive HTML-encoded. Rendering
            it as markup is safe only because of that server-side boundary — never feed this
            element anything that did not come from the API's `body` field. */}
        <article className="article-body" lang={story.contentLocale} dir={story.contentLocale === "ar" ? "rtl" : "ltr"} dangerouslySetInnerHTML={{ __html: story.body }} />
        {(story.primaryCategoryNameAr || story.secondaryTags.length > 0 || story.presentationDesks.length > 0) && <nav className="article-taxonomy" aria-label={copy.taxonomy}>
          {story.primaryCategoryNameAr && <span className="article-taxonomy__label">{copy.taxonomy}</span>}
          {story.primaryCategoryNameAr && <span className="article-taxonomy__tag">{story.primaryCategoryNameAr}</span>}
          {story.secondaryTags.map((tag) => <Link className="article-taxonomy__tag" href={`/search?q=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}
          {story.presentationDesks.filter((desk) => deskLabels[desk]?.[locale]).map((desk) => <Link className="article-taxonomy__tag is-desk" href={`/category?cat=${encodeURIComponent(desk)}`} key={desk}>{deskLabels[desk][locale]}</Link>)}
        </nav>}
        <CorrectionsBox corrections={story.corrections.filter((c) => !c.isMajor)} />
      </div>
      {moreFromAuthor.length > 0 && <section className="section tight on-surface article-author-more" aria-labelledby="article-author-more-heading">
        <div className="wrap article-editorial-narrow">
          <div className="section-head"><h2 id="article-author-more-heading">{copy.moreAuthor}</h2>{authorHref && <Link className="more" href={authorHref}>{copy.allAuthor} {byline} ←</Link>}</div>
          <div className="six-grid">{moreFromAuthor.map((item) => <StoryGridCard key={item.id} story={item} />)}</div>
        </div>
      </section>}
      {articleBottomAd && <section className="article-bottom-ad wrap" aria-label="مساحة إعلانية"><ConfiguredAd placement={articleBottomAd} ratio="4 / 1" /></section>}
      {relatedStories.length > 0 && <section className="section tight on-surface article-related" aria-labelledby="article-related-heading">
        <div className="wrap article-editorial-narrow">
          <div className="section-head"><h2 id="article-related-heading">{copy.readAlso}</h2></div>
          <div className="six-grid">{relatedStories.map((related) => <StoryGridCard key={related.id} story={related} />)}</div>
        </div>
      </section>}
    </main>
  );
}
