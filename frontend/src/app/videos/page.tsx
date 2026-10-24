import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getPublishedVideos } from "@/lib/news-api";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const title = locale === "ar" ? `جسور فيديو — ${SITE_NAME}` : locale === "en" ? `Jusoor Video — ${SITE_NAME}` : `Jusoor Vidéo — ${SITE_NAME}`;
  const description = locale === "ar" ? "شاهد أحدث الفيديوهات المنشورة من تحرير جسور." : locale === "en" ? "Watch the latest videos published by Jusoor's newsroom." : "Regardez les dernières vidéos publiées par la rédaction de Jusoor.";
  const canonical = absoluteUrl("/videos");
  return { title, description, ...(canonical ? { alternates: { canonical } } : {}) };
}

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const text = (value: string) => translateUi(locale, value);
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "medium" }).format(new Date(value));
  let result: Awaited<ReturnType<typeof getPublishedVideos>> | null = null;
  try { result = await getPublishedVideos(safePage, 18); }
  catch { return <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}><div className="wrap"><div className="state-panel"><h2>{text("تعذّر تحميل الفيديوهات")}</h2><p>{text("حدثت مشكلة في الاتصال بالخادم. حاول تحديث الصفحة بعد قليل.")}</p></div></div></main>; }

  const [featured, ...videos] = result.items;
  if (!featured) return <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}><section className="section"><div className="wrap"><div className="section-head"><span className="eyebrow">{text("جسور فيديو")}</span><h1>{text("فيديوهات جسور")}</h1></div><div className="state-panel"><h2>{text("لا توجد فيديوهات منشورة حالياً")}</h2><p>{text("ستظهر هنا الفيديوهات التي يختارها فريق التحرير وينشرها.")}</p></div></div></section></main>;

  return <main id="main" dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="section"><div className="wrap">
      <div className="section-head"><span className="eyebrow">{text("جسور فيديو")}</span><h1>{text("فيديوهات جسور")}</h1></div>
      <article className="video-featured"><div className="video-featured-media">{featured.isEmbedded
        ? <iframe src={featured.videoUrl} title={featured.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        : <video src={featured.videoUrl} controls playsInline preload="metadata" aria-label={featured.title} />}</div>
        <div className="video-featured-body"><span className="eyebrow">{text("الأحدث")}</span><h2>{featured.title}</h2>{featured.excerpt && <p>{featured.excerpt}</p>}</div>
      </article>
      <div className="video-featured-meta"><time dateTime={featured.publishedAtUtc}>{formatDate(featured.publishedAtUtc)}</time>{featured.credit && <span>{featured.credit}</span>}<Link href={`/article/${featured.id}/${encodeURIComponent(featured.slug)}`}>{text("اقرأ الخبر المرتبط")}</Link></div>
      {videos.length > 0 && <><div className="section-head video-list-head"><span className="eyebrow">{text("منشور حديثاً")}</span><h2>{text("كل الفيديوهات")}</h2></div>
        <div className="video-grid">{videos.map((video) => <article className="video-card" key={video.id}><div className="thumb video-card-player">{video.isEmbedded
          ? <iframe src={video.videoUrl} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          : <video src={video.videoUrl} controls playsInline preload="metadata" aria-label={video.title} />}</div>
          <div className="video-card-body"><h3><Link href={`/article/${video.id}/${encodeURIComponent(video.slug)}`}>{video.title}</Link></h3>{video.excerpt && <p>{video.excerpt}</p>}<div className="video-card-meta"><time dateTime={video.publishedAtUtc}>{formatDate(video.publishedAtUtc)}</time>{video.credit && <span>{video.credit}</span>}</div></div></article>)}</div>
      </>}
      {result.totalPages > 1 && <nav className="video-pagination" aria-label={text("صفحات الفيديوهات")}>{safePage > 1 && <Link className="cms-btn" href={`/videos?page=${safePage - 1}`}>{text("الأحدث")}</Link>}<span>{text("صفحة")} {result.page} {text("من")} {result.totalPages}</span>{safePage < result.totalPages && <Link className="cms-btn" href={`/videos?page=${safePage + 1}`}>{text("الأقدم")}</Link>}</nav>}
    </div></section>
  </main>;
}
