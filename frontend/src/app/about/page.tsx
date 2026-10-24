import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ABOUT_COPY, parseLocale, SITE_DESCRIPTIONS } from "@/lib/site-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  return locale === "en" ? { title: "About Jusoor", description: SITE_DESCRIPTIONS.en } : locale === "fr" ? { title: "À propos de Jusoor", description: SITE_DESCRIPTIONS.fr } : { title: "عن منصة جسور | جسور", description: SITE_DESCRIPTIONS.ar };
}

export default async function AboutPage() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const copy = ABOUT_COPY[locale];
  const links = [
    ["/category?cat=mughtarib", copy.links[0]], ["/atmaen", copy.links[1]],
    ["/diaspora-map", copy.links[2]], ["/videos", copy.links[3]],
  ];
  return <main id="main" className="info-page" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="info-page-hero"><div className="wrap">
      <nav className="breadcrumb" aria-label={locale === "ar" ? "مسار الصفحة" : locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}><Link className="breadcrumb-home" href="/">{copy.home}</Link><span className="breadcrumb-separator" aria-hidden="true">›</span><span aria-current="page">{copy.current}</span></nav>
      <span className="eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><button type="button" className="btn btn-primary" data-replay-intro>{copy.replay}</button>
      <p>{SITE_DESCRIPTIONS[locale]}</p>
    </div></section><section className="section"><div className="wrap info-page-content">
      <article><h2>{copy.offer}</h2><p>{copy.offerText}</p><p>{copy.mapNote}</p><h2>{copy.mission}</h2><p>{copy.missionText}</p></article>
      <div className="info-page-links">{links.map(([href, label]) => <Link key={href} href={href}>{label} ←</Link>)}</div>
    </div></section></main>;
}