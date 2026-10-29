import { apiFetch, ApiError } from "./api-client";
import type { PagedResult, StorySummary } from "./stories-api";
import { cookies } from "next/headers";
import { parseLocale } from "./site-copy";

// Mirrors Jusoor.Application.Editorial.Contracts.PublicNewsSummaryDto /
// PublicNewsDetailDto. The public news API returns ONLY articles a newsroom
// user has explicitly published (Slice 15) — drafts never appear here.
interface NewsTranslationDto { locale: "en" | "fr"; title: string; summary: string | null; body: string; }
interface NewsTranslationSummaryDto { locale: "en" | "fr"; title: string; summary: string | null; }

interface NewsSummaryDto {
  id: string;
  title: string;
  authorName: string | null;
  authorImageUrl: string | null;
  excerpt: string | null;
  publishedAtUtc: string;
  countryNameAr: string | null;
  countryNameEn: string | null;
  cityNameAr: string | null;
  cityNameEn: string | null;
  slug: string;
  presentationDesks: string[];
  secondaryTags: string[];
  imageUrl: string | null;
  translations: NewsTranslationSummaryDto[];
}

/** Mirrors PublicCorrectionDto — never carries the issuer (decision D4). */
export interface NewsCorrection {
  kind: "Correction" | "Notice" | "Clarification" | "EditorNote" | "Update";
  note: string;
  isMajor: boolean;
  issuedAtUtc: string;
}

export interface NewsDetail {
  translations: NewsTranslationDto[];
  contentLocale: "ar" | "en" | "fr";
  id: string;
  title: string;
  authorName: string | null;
  authorImageUrl: string | null;
  summary: string | null;
  body: string;
  publishedAtUtc: string;
  /** Later of publication and last edit (spec §16 "last updated" trust signal). */
  updatedAtUtc: string;
  countryNameAr: string | null;
  countryNameEn: string | null;
  cityNameAr: string | null;
  cityNameEn: string | null;
  /** Append-only editorial notes, oldest first ("تنويه صحفي / تصحيح"). */
  corrections: NewsCorrection[];
  isArchived: boolean;
  archivedAtUtc: string | null;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  socialTitle: string | null;
  socialDescription: string | null;
  socialImageUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  primaryCategoryNameAr: string | null;
  secondaryTags: string[];
  presentationDesks: string[];
  sportsCoverageType: string | null;
  sportsPlayerNames: string[];
  sportsTeamName: string | null;
  sportsCompetitionName: string | null;
  sportsCountryName: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
}

/** Public video hub rows; only a published article's selected ready video is returned. */
export interface PublishedVideo {
  id: string;
  title: string;
  authorName: string | null;
  excerpt: string | null;
  videoUrl: string;
  caption: string | null;
  credit: string;
  publishedAtUtc: string;
  slug: string;
  thumbnailUrl: string | null;
  isEmbedded: boolean;
}

/** The API's 410 response deliberately contains only these five fields. */
export interface NewsRetraction {
  id: string;
  title: string;
  publishedAtUtc: string;
  retractedAtUtc: string;
  notice: string;
}

export type PublicNewsDetail = { outcome: "found"; article: NewsDetail } | { outcome: "retracted"; notice: NewsRetraction } | null;

/**
 * Returns the feed in the StorySummary shape the existing homepage cards
 * already render, so the approved card components are reused unchanged.
 * Editorial articles have no third-party sources, hence sourceNames: [].
 */
export async function getPublishedNews(page = 1, pageSize = 20, desk?: string, searchTerm?: string, authorName?: string, countryId?: string, tag?: string): Promise<PagedResult<StorySummary>> {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (desk) query.set("desk", desk === "various" ? "fatwas" : desk);
  if (searchTerm?.trim()) query.set("q", searchTerm.trim());
  if (authorName?.trim()) query.set("author", authorName.trim());
  if (countryId) query.set("countryId", countryId);
  if (tag?.trim()) query.set("tag", tag.trim());
  const result = await apiFetch<PagedResult<NewsSummaryDto>>(`/api/v1/news?${query.toString()}`);
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  return { ...result, items: result.items.map((n) => {
    const translated = locale === "ar" ? undefined : n.translations?.find((item) => item.locale === locale);
    return { ...n, title: translated?.title ?? n.title, excerpt: translated?.summary ?? n.excerpt, sourceNames: [] };
  }) };
}

/** `homeOnly`: just the videos an editor placed in the homepage hero, in the editor's order. */
export async function getPublishedVideos(page = 1, pageSize = 18, homeOnly = false): Promise<PagedResult<PublishedVideo>> {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (homeOnly) query.set("home", "true");
  return apiFetch<PagedResult<PublishedVideo>>(`/api/v1/news/videos?${query.toString()}`);
}

export interface PublicAdPlacement {
  slotKey: string;
  surface: "web" | "mobile";
  mediaAssetId: string;
  mediaUrl: string;
  targetUrl: string;
  altText: string;
  displayOrder: number;
}

export interface PublicCrisisMode {
  isActive: boolean;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  severity: "advisory" | "urgent" | "emergency";
  affectedCountryIds: string[];
  soundAssetId: string | null;
  soundUrl: string | null;
  soundRepeatIntervalSeconds: number;
  lastModifiedAtUtc: string | null;
}

export interface PublicCountry { id: string; nameAr: string; nameEn: string; isoCode2: string; latitude: number | null; longitude: number | null; }

export interface PublicDiasporaMapItem {
  id: string;
  countryId: string;
  countryNameAr: string;
  cityId: string | null;
  cityNameAr: string | null;
  latitude: number | null;
  longitude: number | null;
  estimatedPopulation: number;
  communitySignalCount: number | null;
  sourceName: string;
  sourceUrl: string;
  sourcePublishedOn: string;
}

export interface PublicSiteNavigationItem {
  key: string;
  label: string;
  href: string;
  isVisible: boolean;
  displayOrder: number;
  group: "primary" | "more";
}

export interface PublicHomepageSection {
  key: string;
  title: string;
  deskSlug: string;
  layout: "cards" | "lead" | "columns";
  isEnabled: boolean;
  showOnWeb: boolean;
  showOnMobile: boolean;
  displayOrder: number;
}

export interface PublicSocialLink { id: string; name: string; href: string; icon: string; isVisible: boolean; }

export interface PublicSiteStructure {
  navigation: PublicSiteNavigationItem[];
  homepageSections: PublicHomepageSection[];
  leadership: { entries: Array<{ id: string; title: string; name: string }>; logoAssetId?: string | null; logoUrl?: string | null; slogan?: string | null };
  socialLinks: PublicSocialLink[];
  welcomeIntro: { isEnabled: boolean; assetId: string | null; videoUrl: string | null; fileName: string | null };
  lastModifiedAtUtc: string | null;
}

export function getPublicSiteStructure(): Promise<PublicSiteStructure> {
  return apiFetch<PublicSiteStructure>("/api/v1/site-structure", { cache: "no-store" });
}

export function getPublicCrisisMode(): Promise<PublicCrisisMode> {
  return apiFetch<PublicCrisisMode>("/api/v1/crisis", { cache: "no-store" });
}

export function getPublicCountries(): Promise<PublicCountry[]> {
  return apiFetch<PublicCountry[]>("/api/v1/geography/countries", { cache: "no-store" });
}

export function getPublicDiasporaMap(): Promise<PublicDiasporaMapItem[]> {
  return apiFetch<PublicDiasporaMapItem[]>("/api/v1/diaspora-map", { cache: "no-store" });
}

export async function getPublicAdPlacements(surface: "web" | "mobile"): Promise<PublicAdPlacement[]> {
  return apiFetch<PublicAdPlacement[]>(`/api/v1/advertisements/placements?surface=${surface}`);
}

export async function getPublishedNewsById(id: string): Promise<PublicNewsDetail> {
  try {
    const article = await apiFetch<NewsDetail>(`/api/v1/news/${id}`);
    const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
    const translated = locale === "ar" ? undefined : article.translations?.find((item) => item.locale === locale);
    return { outcome: "found", article: translated ? { ...article, title: translated.title, summary: translated.summary, body: translated.body, contentLocale: locale, seoTitle: null, seoDescription: translated.summary, socialTitle: translated.title, socialDescription: translated.summary, twitterTitle: translated.title, twitterDescription: translated.summary } : { ...article, contentLocale: "ar" } };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    if (error instanceof ApiError && error.status === 410 && error.data && typeof error.data === "object") {
      return { outcome: "retracted", notice: error.data as NewsRetraction };
    }

    throw error;
  }
}

// Mirrors Jusoor.Application.Editorial.Contracts.PublicNewsSitemapEntryDto.
export interface NewsSitemapEntry {
  id: string;
  title: string;
  publishedAtUtc: string;
  updatedAtUtc: string;
  isArchived: boolean;
  slug: string;
}

/** Every published article, newest first, as lean rows (Slice 18 — sitemaps). */
export async function getPublishedNewsSitemap(): Promise<NewsSitemapEntry[]> {
  return apiFetch<NewsSitemapEntry[]>("/api/v1/news/sitemap");
}
