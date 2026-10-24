import { HeaderInteractive } from "./HeaderInteractive";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { DEFAULT_PUBLIC_SOCIAL_LINKS } from "@/lib/social-links";
import { getPublishedNews, getPublicAdPlacements, getPublicSiteStructure } from "@/lib/news-api";
import type { PublicAdPlacement, PublicSiteNavigationItem, PublicSocialLink } from "@/lib/news-api";

/**
 * Server Component so the ticker's headlines are real titles of
 * newsroom-PUBLISHED articles (Slice 16 — previously ingested, unreviewed
 * Stories) fetched at render time — the demo's ticker is 6 fixed sample headlines
 * baked into index.html; this fetches the actual latest ones instead.
 * Fails open: if the API call throws (backend down, etc.), the ticker is
 * simply omitted rather than crashing the whole page's header via the
 * error boundary — a nav bar should never go down because a background
 * data call failed.
 */
export async function SiteHeader() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  let tickerHeadlines: string[] = [];
  let navbarAd: PublicAdPlacement | undefined;
  let navigation: PublicSiteNavigationItem[] | undefined;
  let leadership: { entries: Array<{ id: string; title: string; name: string }> } | undefined;
  let socialLinks: PublicSocialLink[] | undefined;

  const [newsResult, adsResult, structureResult] = await Promise.allSettled([
    getPublishedNews(1, 6),
    getPublicAdPlacements("web"),
    getPublicSiteStructure(),
  ]);
  if (newsResult.status === "fulfilled") tickerHeadlines = newsResult.value.items.map((s) => s.title);
  if (adsResult.status === "fulfilled") navbarAd = adsResult.value.find((placement) => placement.slotKey === "navbar-banner");
  if (structureResult.status === "fulfilled") { navigation = structureResult.value.navigation; leadership = structureResult.value.leadership; socialLinks = structureResult.value.socialLinks ?? DEFAULT_PUBLIC_SOCIAL_LINKS; }

  return <HeaderInteractive tickerHeadlines={tickerHeadlines} navbarAd={navbarAd} navigation={navigation} leadership={leadership} socialLinks={socialLinks} locale={locale} />;
}
