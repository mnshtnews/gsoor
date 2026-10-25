import Image from "next/image";
import Link from "next/link";
import { getPublicSiteStructure } from "@/lib/news-api";
import { cookies } from "next/headers";
import { FOOTER_COPY, FOOTER_LINK_LABELS, SITE_DESCRIPTIONS, parseLocale } from "@/lib/site-copy";
import { LocaleSelector } from "@/components/LocaleSelector";
import { DEFAULT_PUBLIC_SOCIAL_LINKS, socialIconPath } from "@/lib/social-links";

const SITE_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/category?cat=mughtarib", label: "أخبار المغتربين" },
  { href: "/category?cat=egypt", label: "أخبار مصر" },
  { href: "/category?cat=success", label: "قصة نجاح" },
  { href: "/category?cat=official", label: "مع مسئول" },
  { href: "/category?cat=red", label: "خط أحمر" },
];

const MORE_LINKS = [
  { href: "/category?cat=lamma", label: "اللمة الحلوة" },
  { href: "/category?cat=sports", label: "رياضة" },
  { href: "/category?cat=secondgen", label: "الجيل الثاني" },
  { href: "/category?cat=articles", label: "مقالات رأي" },
  { href: "/category?cat=fatwas", label: "فتاوى" },
];

const SERVICE_LINKS = [
  { href: "/atmaen", label: "اطمّن على مغتربك" },
  { href: "/diaspora-map", label: "خريطة المهجر" },
  { href: "/category?cat=opportunities", label: "فرص العمل" },
  { href: "/auth", label: "بروفايل المهجر" },
];

const ABOUT_LINKS = [
  { href: "/about", label: "عن منصة جسور" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

export async function SiteFooter() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const copy = FOOTER_COPY[locale];
  let socialLinks = DEFAULT_PUBLIC_SOCIAL_LINKS;
  try { socialLinks = (await getPublicSiteStructure()).socialLinks ?? DEFAULT_PUBLIC_SOCIAL_LINKS; } catch { /* Keep the safe, known profile links if the API is unavailable. */ }
  return (
    <footer className="foot-v2">
      <div className="wrap foot-v2-top">
        <div className="foot-v2-grid">
          <div className="foot-v2-brand">
            <Link href="/">
              <Image className="logo-img" src="/assets/josour-logo-transparent.png" alt="جسور" width={1104} height={974} />
            </Link>
            <p lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>{SITE_DESCRIPTIONS[locale]}</p>
            <button type="button" className="foot-v2-replay" data-replay-intro>{copy.intro}</button>

            <div className="foot-v2-social social-icons">
              {socialLinks.filter((social) => social.isVisible && social.href).map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className={social.name}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={socialIconPath(social.icon)} fillRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="foot-v2-col">
            <h5>{copy.sections}</h5>
            <ul className="foot-v2-link-grid">
              {[...SITE_LINKS, ...MORE_LINKS].map((link) => (
                <li key={link.href}><Link href={link.href}>{FOOTER_LINK_LABELS[locale][link.href] ?? link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="foot-v2-col">
            <h5>{copy.services}</h5>
            <ul className="foot-v2-link-grid foot-v2-link-grid--services">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}><Link href={link.href}>{FOOTER_LINK_LABELS[locale][link.href] ?? link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="foot-v2-col">
            <h5>{copy.about}</h5>
            <ul>
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}><Link href={link.href}>{FOOTER_LINK_LABELS[locale][link.href] ?? link.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="wrap foot-v2-bottom">
        <span dir={locale === "ar" ? "rtl" : "ltr"}>{locale === "ar" ? "جميع الحقوق محفوظة لمنصة جسور 2026 ©" : `© 2026 Jusoor. ${copy.rights}`}</span>
        <div className="foot-v2-bottom-links">
          <Link href="/privacy">{copy.privacy}</Link>
        </div>
        <LocaleSelector className="foot-v2-lang" locale={locale} />
      </div>
    </footer>
  );
}
