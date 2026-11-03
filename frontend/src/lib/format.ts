import type { SiteLocale } from "@/lib/site-copy";

// Intl-based Arabic-Egyptian date formatting, used anywhere a Story's
// PublishedAtUtc needs to be shown. The demo's own topbar clock hand-rolls
// day/month name arrays for the *current* time — this covers arbitrary
// past dates from real data, which that function was never meant to do.
export function formatArabicDate(iso: string | null, locale: SiteLocale = "ar"): string | null {
  if (!iso) {
    return null;
  }

  const languageTag = locale === "ar" ? "ar-EG-u-nu-latn" : locale === "fr" ? "fr-FR" : "en-GB";
  return new Intl.DateTimeFormat(languageTag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
  }).format(new Date(iso));
}

/** Display CMS audit timestamps in Egypt time, regardless of device timezone.
 * Persisted values remain UTC. */
export function formatCmsDateTime(iso: string | null, locale: SiteLocale = "ar"): string | null {
  if (!iso) return null;
  const languageTag = locale === "ar" ? "ar-EG-u-nu-latn" : locale === "fr" ? "fr-FR" : "en-GB";
  return new Intl.DateTimeFormat(languageTag, {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    timeZone: "Africa/Cairo",
  }).format(new Date(iso));
}

const CAIRO_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

/** Format a date-time-local value as wall-clock time in Cairo. */
export function cairoDateTimeInput(date: Date): string {
  const parts = Object.fromEntries(CAIRO_DATE_TIME_FORMATTER.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Convert an HTML datetime-local value interpreted in Cairo to a UTC ISO instant. */
export function cairoDateTimeToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute);
  let instant = targetWallTime;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(CAIRO_DATE_TIME_FORMATTER.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
    const representedWallTime = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    instant += targetWallTime - representedWallTime;
  }
  const finalParts = Object.fromEntries(CAIRO_DATE_TIME_FORMATTER.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
  if (Number(finalParts.year) !== year || Number(finalParts.month) !== month || Number(finalParts.day) !== day || Number(finalParts.hour) !== hour || Number(finalParts.minute) !== minute) return null;
  return new Date(instant).toISOString();
}

// Simple, honest reading-time estimate (no external library) — 200 Arabic
// words/minute is a commonly cited baseline; rounded up so a very short
// article still reads as "دقيقة واحدة" rather than "0 دقيقة".
// Takes PLAIN TEXT (use htmlToPlainText for an HTML body: tag and attribute
// tokens must not be counted as words).
export function estimateReadMinutes(content: string | null): number {
  if (!content) {
    return 1;
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
