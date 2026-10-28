import type { Metadata, Viewport } from "next";
import "@/styles/site.css";
import "@/styles/site-mobile.css";
import "@/styles/site-overrides.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CrisisStatusBar } from "@/components/CrisisStatusBar";
import { WelcomeIntro } from "@/components/WelcomeIntro";
import { getPublicSiteStructure } from "@/lib/news-api";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const metadataByLocale = {
    ar: { title: "جسور — أخبار المصريين بالمهجر", description: "منصة المصريين بالمهجر: أخبار الجاليات، خدمة اطمّن على مغتربك وقت الأزمات، وخريطة تفاعلية لأماكن تواجد المصريين حول العالم." },
    en: { title: "Jusoor — Egyptians Abroad", description: "News, services, and community updates for Egyptians living abroad." },
    fr: { title: "Jusoor — Égyptiens à l’étranger", description: "Actualités, services et informations pour les Égyptiens vivant à l’étranger." },
  };
  return metadataByLocale[locale];
}

// The visitor-selected locale is stored in a first-party cookie and applied to the document language and direction.
//
// Fonts (Cairo, IBM Plex Sans Arabic, IBM Plex Mono) are loaded via the
// same Google Fonts CDN link the demo uses, not next/font — the demo's
// styles.css references these family names directly, and next/font's
// local-hosting rewrite only applies to its own <link>, so keeping the
// exact CDN link is the simplest way to guarantee the same font actually
// renders without re-deriving every weight the CSS uses.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structure = await getPublicSiteStructure().catch(() => null);
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="icon" type="image/jpeg" href={structure?.leadership?.logoUrl || "/assets/josour-logo-client.jpg"} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this
            rule targets the pages/ router's per-page <Head>; App Router's
            root layout.tsx <head> is exactly where a site-wide font link
            belongs, so the warning is a false positive here. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <CrisisStatusBar />
        {children}
        <SiteFooter />
        <WelcomeIntro enabled={structure?.welcomeIntro?.isEnabled ?? false} videoUrl={structure?.welcomeIntro?.videoUrl ?? null} />
      </body>
    </html>
  );
}
