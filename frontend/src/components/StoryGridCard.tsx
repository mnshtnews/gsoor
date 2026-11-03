import Link from "next/link";
import Image from "next/image";
import type { StorySummary } from "@/lib/stories-api";
import { formatArabicDate } from "@/lib/format";
import type { SiteLocale } from "@/lib/site-copy";

/**
 * Mirrors the demo's cardGrid() output (.grid-card > .thumb + h3 + .foot)
 * almost exactly — see app.js's cardGrid(). Editorial images are rendered
 * when the publisher supplies a social/cover image; other source rows retain
 * a branded placeholder rather than a broken image.
 */
export function StoryGridCard({ story, locale = "ar" }: { story: StorySummary; locale?: SiteLocale }) {
  const place = locale === "ar"
    ? story.cityNameAr ?? story.countryNameAr ?? null
    : story.cityNameEn ?? story.countryNameEn ?? story.cityNameAr ?? story.countryNameAr ?? null;
  const publishedLabel = formatArabicDate(story.publishedAtUtc, locale);
  const isOpinion = story.presentationDesks?.includes("articles") ?? false;
  const thumbnailUrl = isOpinion ? story.authorImageUrl || story.imageUrl : story.imageUrl;

  return (
    <Link href={`/article/${story.id}`} className="grid-card" aria-label={story.title}>
      <div className={`thumb${thumbnailUrl ? "" : " thumb-placeholder"}`} aria-hidden="true">
        {thumbnailUrl ? <Image src={thumbnailUrl} alt="" width={900} height={600} unoptimized /> : <span>ج</span>}
      </div>

      <h3>{story.title}</h3>

      <div className="foot">
        {place && <span>{place}</span>}
        {place && publishedLabel && <span>·</span>}
        {publishedLabel && <span>{publishedLabel}</span>}
      </div>
    </Link>
  );
}
