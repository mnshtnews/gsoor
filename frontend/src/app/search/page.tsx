import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getPublishedNews } from "@/lib/news-api";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { StoryGridCard } from "@/components/StoryGridCard";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  return { title: `${translateUi(locale, "البحث")} — Jusoor` };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const { q: rawQuery } = await searchParams;
  const query = rawQuery?.trim().slice(0, 120) ?? "";
  const result = query.length >= 2 ? await getPublishedNews(1, 30, undefined, query) : null;
  const text = (value: string) => translateUi(locale, value);

  return (
    <main id="main" className="wrap search-results-page" dir={locale === "ar" ? "rtl" : "ltr"}>
      <section className="search-hero">
        <span className="search-hero-kicker">{text("اكتشف التغطيات")}</span>
        <h1>{text("ابحث في أخبار جسور")}</h1>
        <form action="/search" method="get" className="search-bar-lg">
          <input type="search" name="q" defaultValue={query} placeholder={text("ابحث عن خبر، دولة، أو موضوع…")} aria-label={text("كلمات البحث")} minLength={2} maxLength={120} />
          <button type="submit">{text("بحث")}</button>
        </form>
      </section>
      {query.length < 2 ? <p className="search-empty">{text("اكتب كلمتين على الأقل لبدء البحث في الأخبار المنشورة.")}</p> : (
        <section className="section tight">
          <div className="section-head"><h2>{locale === "ar" ? `نتائج البحث عن «${query}»` : `${locale === "en" ? "Search results for" : "Résultats pour"} “${query}”`}</h2><span>{result?.totalCount ?? 0} {text("نتيجة")}</span></div>
          {result?.items.length ? <div className="six-grid">{result.items.map((story) => <StoryGridCard key={story.id} story={story} locale={locale} />)}</div> : <p className="search-empty">{text("لم نعثر على نتائج مطابقة. جرّب كلمات أخرى.")}</p>}
        </section>
      )}
    </main>
  );
}
