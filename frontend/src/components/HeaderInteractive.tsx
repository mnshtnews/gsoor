"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopbarClock } from "./TopbarClock";
import { ConfiguredAd } from "./home/ConfiguredAd";
import type { PublicAdPlacement, PublicSiteNavigationItem, PublicSocialLink } from "@/lib/news-api";
import { DEFAULT_PUBLIC_SOCIAL_LINKS, socialIconPath } from "@/lib/social-links";
import { LocaleSelector } from "@/components/LocaleSelector";
import type { SiteLocale } from "@/lib/site-copy";

const DEFAULT_NAVIGATION: PublicSiteNavigationItem[] = [
  ["home", "الرئيسية", "/", "primary"], ["mughtarib", "أخبار المغتربين", "/category?cat=mughtarib", "primary"],
  ["success", "قصة نجاح", "/category?cat=success", "primary"], ["egypt", "أخبار مصر", "/category?cat=egypt", "primary"],
  ["opportunities", "فرص استثمارية", "/category?cat=opportunities", "primary"], ["official", "مع مسئول", "/category?cat=official", "primary"],
  ["red", "خط أحمر", "/category?cat=red", "primary"], ["map", "خريطة المهجر", "/diaspora-map", "more"],
  ["events", "فعاليات", "/category?cat=events", "more"], ["lamma", "اللمة الحلوة", "/category?cat=lamma", "more"],
  ["secondgen", "الجيل الثاني", "/category?cat=secondgen", "more"], ["sports", "رياضة", "/category?cat=sports", "more"],
  ["arts", "فنون", "/category?cat=arts", "more"], ["articles", "مقالات رأي", "/category?cat=articles", "more"],
  ["fatwas", "فتاوى", "/category?cat=fatwas", "more"], ["videos", "فيديو", "/videos", "more"],
].map(([key, label, href, group], displayOrder) => ({ key, label, href, group: group as "primary" | "more", displayOrder, isVisible: true }));

type Leadership = { entries: Array<{ id: string; title: string; name: string }> };

function LeadershipCredits({ leadership, className = "header-leadership" }: { leadership?: Leadership; className?: string }) {
  const entries = leadership?.entries.filter((entry) => entry.title.trim() || entry.name.trim()) ?? [];
  if (!entries.length) return null;
  return <div className={className} aria-label="هيئة الإدارة والتحرير">
    {entries.map((entry) => <div className="leadership-credit-group" key={entry.id}>
      <span className="leadership-credit-role">{entry.id === "board-editor" && entry.title === "رئيس مجلس الإدارة ورئيس التحرير" ? <>رئيس مجلس الإدارة<br />رئيس التحرير</> : entry.title}</span>
      {entry.name && <strong>{entry.name}</strong>}
    </div>)}
  </div>;
}

/**
 * The demo's header/nav/topbar/ticker/drawer/search-overlay, reimplemented
 * as one client component (real markup 1:1 with index.html — see the class
 * names — not app.js's DOM-templating). All of it lives in one component
 * because the burger, the two search triggers, the drawer, and the search
 * panel all share open/close state that would otherwise need a context for
 * five lines of actual logic.
 *
 * tickerHeadlines comes from the server-rendered parent (real Story
 * titles) — this component never fetches data itself, matching the
 * project's "Server Components fetch, Client Components render" split.
 */
const HEADER_COPY = { ar: { cms: "لوحة التحرير", profile: "صفحتي", login: "دخول", signup: "إنشاء حساب", more: "المزيد", openMenu: "فتح القائمة", search: "بحث", searchLabel: "بحث في الأخبار", searchPlaceholder: "ابحث عن خبر، دولة، أو خدمة...", submitSearch: "تنفيذ البحث", closeSearch: "إغلاق البحث", searching: "جارٍ البحث…", allResults: "عرض كل نتائج البحث ←" }, en: { cms: "Newsroom", profile: "My profile", login: "Log in", signup: "Create account", more: "More", openMenu: "Open menu", search: "Search", searchLabel: "Search news", searchPlaceholder: "Search news, a country, or a service...", submitSearch: "Submit search", closeSearch: "Close search", searching: "Searching…", allResults: "View all search results →" }, fr: { cms: "Rédaction", profile: "Mon profil", login: "Connexion", signup: "Créer un compte", more: "Plus", openMenu: "Ouvrir le menu", search: "Rechercher", searchLabel: "Rechercher des actualités", searchPlaceholder: "Rechercher une actualité, un pays ou un service…", submitSearch: "Lancer la recherche", closeSearch: "Fermer la recherche", searching: "Recherche…", allResults: "Voir tous les résultats →" } } as const;
function localizedNavigationLabel(key: string, arabicLabel: string, locale: SiteLocale): string {
  if (locale === "ar") return arabicLabel;
  const labels: Record<SiteLocale, Record<string, string>> = {
    ar: {},
    en: { home: "Home", mughtarib: "Diaspora news", success: "Success stories", egypt: "Egypt news", opportunities: "Investment opportunities", official: "Ask an official", red: "Red line", map: "Diaspora map", events: "Events", lamma: "Community", secondgen: "Second generation", sports: "Sports", arts: "Arts", articles: "Opinion", fatwas: "Fatwas", videos: "Videos" },
    fr: { home: "Accueil", mughtarib: "Actualités de la diaspora", success: "Histoires de réussite", egypt: "Actualités d’Égypte", opportunities: "Opportunités d’investissement", official: "Parole officielle", red: "Ligne rouge", map: "Carte de la diaspora", events: "Événements", lamma: "Communauté", secondgen: "Deuxième génération", sports: "Sport", arts: "Arts", articles: "Opinions", fatwas: "Fatwas", videos: "Vidéos" },
  };
  return labels[locale][key] ?? arabicLabel;
}
export function HeaderInteractive({ tickerHeadlines, navbarAd, navigation, leadership, socialLinks = DEFAULT_PUBLIC_SOCIAL_LINKS, locale = "ar" }: { tickerHeadlines: string[]; navbarAd?: PublicAdPlacement; navigation?: PublicSiteNavigationItem[]; leadership?: Leadership; socialLinks?: PublicSocialLink[]; locale?: SiteLocale }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [staffRoles, setStaffRoles] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const text = HEADER_COPY[locale];

  useEffect(() => {
    let active = true;
    const syncSession = () => {
      fetch("/account-api/session", { cache: "no-store" }).then(async (response) => response.ok ? response.json() as Promise<{ authenticated?: boolean; roles?: string[]; staff?: boolean }> : null)
        .then((session) => { if (active) { setSignedIn(!!session?.authenticated); setStaffRoles(session?.staff ? session.roles ?? [] : []); } })
        .catch(() => { if (active) { setStaffRoles([]); setSignedIn(false); } });
    };
    syncSession();
    window.addEventListener("jusoor:session-change", syncSession);
    return () => { active = false; window.removeEventListener("jusoor:session-change", syncSession); };
  }, []);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".bluebarr");
    const header = document.querySelector<HTMLElement>("header.site");
    if (!nav || !header) return;
    const observer = new IntersectionObserver(([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting));
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!drawerOpen && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!searchOpen || query.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json() as { items: Array<{ id: string; title: string; slug: string }> };
        setSuggestions(data.items);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [searchOpen, searchQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The demo repeats the ticker group 3-4x in the HTML itself for a
  // seamless CSS marquee loop — same technique, applied to real headlines
  // instead of the demo's fixed sample list.
  const tickerGroups = tickerHeadlines.length > 0 ? [0, 1, 2] : [];
  const visibleNavigation = (navigation?.length ? navigation : DEFAULT_NAVIGATION).filter((item) => item.isVisible).map((item) => ({ ...item, label: localizedNavigationLabel(item.key, item.label, locale) }));
  const primaryLinks = visibleNavigation.filter((item) => item.group === "primary").sort((a, b) => a.displayOrder - b.displayOrder);
  const moreLinks = visibleNavigation.filter((item) => item.group === "more").sort((a, b) => a.displayOrder - b.displayOrder);
  const drawerLinks = [...primaryLinks, ...moreLinks];
  const renderAccountLinks = (className: string) => <div className={className}>
    {staffRoles.length > 0 ? <Link href="/cms" className="btn-nav btn-ghostt">{text.cms}</Link>
      : signedIn ? <Link href="/auth" className="btn-nav btn-ghostt">{text.profile}</Link>
      : <><Link href="/auth?tab=login" className="btn-nav btn-ghostt">{text.login}</Link><Link href="/auth?tab=signup" className="btn-nav btn-accent">{text.signup}</Link></>}
  </div>;

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <div className="right topbar-info">
            <TopbarClock locale={locale} />
            <LocaleSelector className="lang" locale={locale} />
          </div>
          <div className="topbar-mobile-controls">
            {renderAccountLinks("topbar-mobile-account auth-group")}
          </div>
          <div className="left social-icons">
            {socialLinks.filter((social) => social.isVisible && social.href).map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.name} className={social.icon}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={socialIconPath(social.icon)} fillRule="evenodd" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className="site">
        <div className="wrap header-inner">
          <button type="button" className="icon-btn burger" aria-label={text.openMenu} onClick={() => setDrawerOpen(true)}>
            ☰
          </button>

          <div className="header-branding">
            <Link className="logo" href="/">
              <Image className="logo-img" src="/assets/josour-logo-transparent.png" alt="جسور" width={1104} height={974} priority />
              <span className="logo-slogan">المصريون بالخارج سفراء الوطن</span>
            </Link>
            <LeadershipCredits leadership={leadership} />
          </div>

          <ConfiguredAd placement={navbarAd} className="header-ad-banner" label={false} naturalSize />

          <div className="header-actions">
            <button type="button" className="icon-btn" data-open-search aria-label={text.search} onClick={() => { setDrawerOpen(false); setSearchOpen(true); }}>
              🔍
            </button>
            {renderAccountLinks("auth-group mobile-header-account")}
          </div>
        </div>
      </header>
      <div className="mobile-search-row">
        <div className="wrap">
          <button type="button" className="icon-btn mobile-search-trigger" data-open-search aria-label={text.search} onClick={() => { setDrawerOpen(false); setSearchOpen(true); }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7.5" /><path d="m16.5 16.5 4 4" /></svg>
          </button>
        </div>
      </div>

      <nav className="bluebarr">
        <div className="nav-container">
          <div className="nav-brand-group">
            <button
              type="button"
              className="bluebarr-burger"
              aria-label="فتح قائمة التنقل"
              onClick={() => setDrawerOpen(true)}
            >
              <span></span><span></span><span></span>
            </button>
            <div className="nav-sticky-logo">
              <Link href="/" aria-label="الرئيسية">
                <Image src="/assets/josour-logo-transparent.png" alt="جسور" width={1104} height={974} />
              </Link>
            </div>

            <ul className="nav-links">
              {primaryLinks.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
              {moreLinks.length > 0 && <li className="dropdown">
                <button type="button" className="nav-link dropdown-btn">{text.more}</button>
                <ul className="dropdown-menu">
                  {moreLinks.map((link) => (
                    <li key={link.key}><Link href={link.href}>{link.label}</Link></li>
                  ))}
                </ul>
              </li>}
            </ul>
          </div>

          <div className="nav-sticky-actions">
            <button
              type="button"
              className="nav-action-btn search-trigger"
              aria-label={text.search}
              onClick={() => { setDrawerOpen(false); setSearchOpen(true); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {renderAccountLinks("auth-group")}
          </div>
        </div>
      </nav>

      {tickerGroups.length > 0 && (
        <div className="bluebar">
          <div className="ticker">
            <div className="ticker-track">
              {tickerGroups.map((groupIndex) => (
                <div className="ticker-group" key={groupIndex}>
                  {tickerHeadlines.map((headline, i) => (
                    <span key={`${groupIndex}-${i}`}>{headline}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}
      >
        <div className="drawer">
          <div className="flex" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Image className="logo-img" src="/assets/josour-logo-transparent.png" alt="جسور" width={1104} height={974} />
            <button type="button" className="drawer-close icon-btn" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <LeadershipCredits leadership={leadership} className="drawer-leadership" />
          <nav>
            {drawerLinks.map((link) => <Link key={link.key} href={link.href} onClick={() => setDrawerOpen(false)}>{link.label}</Link>)}
            {staffRoles.length > 0 ? <Link href="/cms" onClick={() => setDrawerOpen(false)}>{text.cms}</Link> : signedIn ? <Link href="/auth" onClick={() => setDrawerOpen(false)}>{text.profile}</Link> : <><Link href="/auth?tab=login" onClick={() => setDrawerOpen(false)}>{text.login}</Link><Link href="/auth?tab=signup" onClick={() => setDrawerOpen(false)}>{text.signup}</Link></>}
          </nav>
        </div>
      </div>

      <div className={`search-overlay${searchOpen ? " is-active" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <div className={`search-panel${searchOpen ? " is-active" : ""}`} role="dialog" aria-modal="true" aria-label={text.searchLabel}>
          <form action="/search" method="get" style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              name="q"
              placeholder={text.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={searchOpen}
            />
            <button type="submit" className="icon-btn" aria-label={text.submitSearch}>🔍</button>
            <button type="button" className="icon-btn" aria-label={text.closeSearch} onClick={() => setSearchOpen(false)}>✕</button>
          </form>
          <div className="search-suggest" aria-live="polite">
            {suggestionsLoading && <p className="row">{text.searching}</p>}
            {!suggestionsLoading && searchQuery.trim().length >= 2 && suggestions.map((item) => (
              <Link className="row" key={item.id} href={`/article/${item.id}/${encodeURIComponent(item.slug)}`} onClick={() => setSearchOpen(false)}>{item.title}</Link>
            ))}
            {!suggestionsLoading && searchQuery.trim().length >= 2 && suggestions.length === 0 && <p className="row">لا توجد نتائج مطابقة حتى الآن.</p>}
            {searchQuery.trim().length >= 2 && <Link className="row" href={`/search?q=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setSearchOpen(false)}>{text.allResults}</Link>}
          </div>
        </div>
      </div>
    </>
  );
}
