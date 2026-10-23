"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopbarClock } from "./TopbarClock";
import { ConfiguredAd } from "./home/ConfiguredAd";
import type { PublicAdPlacement, PublicSiteNavigationItem } from "@/lib/news-api";

const SOCIAL_LINKS = [
  { name: "facebook" as const, label: "فيسبوك", path: "M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.66.34-1 1-1z" },
  { name: "x-twitter" as const, label: "X", path: "M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.37l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 17.7h1.73L8.27 4.2H6.42L17.8 19.7z" },
];

const DEFAULT_NAVIGATION: PublicSiteNavigationItem[] = [
  ["home", "الرئيسية", "/", "primary"], ["mughtarib", "أخبار المغتربين", "/category?cat=mughtarib", "primary"],
  ["success", "قصة نجاح", "/category?cat=success", "primary"], ["egypt", "أخبار مصر", "/category?cat=egypt", "primary"],
  ["opportunities", "فرص استثمارية", "/category?cat=opportunities", "primary"], ["official", "مع مسئول", "/category?cat=official", "primary"],
  ["red", "خط أحمر", "/category?cat=red", "primary"], ["map", "خريطة المهجر", "/diaspora-map", "more"],
  ["events", "فعاليات", "/category?cat=events", "more"], ["lamma", "اللمة الحلوة", "/category?cat=lamma", "more"],
  ["secondgen", "الجيل الثاني", "/category?cat=secondgen", "more"], ["sports", "رياضة", "/category?cat=sports", "more"],
  ["arts", "فنون", "/category?cat=arts", "more"], ["articles", "مقالات رأي", "/category?cat=articles", "more"],
  ["fatwas", "الفتاوى", "/category?cat=fatwas", "more"], ["videos", "فيديو", "/videos", "more"],
].map(([key, label, href, group], displayOrder) => ({ key, label, href, group: group as "primary" | "more", displayOrder, isVisible: true }));

type Leadership = { entries: Array<{ id: string; title: string; name: string }> };

function LeadershipCredits({ leadership, className = "header-leadership" }: { leadership?: Leadership; className?: string }) {
  const entries = leadership?.entries.filter((entry) => entry.title.trim() || entry.name.trim()) ?? [];
  if (!entries.length) return null;
  return <div className={className} aria-label="هيئة الإدارة والتحرير">
    {entries.map((entry) => <div className="leadership-credit-group" key={entry.id}>
      <span className="leadership-credit-role">{entry.title}</span>
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
export function HeaderInteractive({ tickerHeadlines, navbarAd, navigation, leadership }: { tickerHeadlines: string[]; navbarAd?: PublicAdPlacement; navigation?: PublicSiteNavigationItem[]; leadership?: Leadership }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [staffRoles, setStaffRoles] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);

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
  const visibleNavigation = (navigation?.length ? navigation : DEFAULT_NAVIGATION).filter((item) => item.isVisible);
  const primaryLinks = visibleNavigation.filter((item) => item.group === "primary").sort((a, b) => a.displayOrder - b.displayOrder);
  const moreLinks = visibleNavigation.filter((item) => item.group === "more").sort((a, b) => a.displayOrder - b.displayOrder);
  const drawerLinks = [...primaryLinks, ...moreLinks];
  const renderAccountLinks = (className: string) => <div className={className}>
    {staffRoles.length > 0 ? <Link href="/cms" className="btn-nav btn-ghostt">لوحة التحرير</Link>
      : signedIn ? <Link href="/auth" className="btn-nav btn-ghostt">صفحتي</Link>
      : <><Link href="/auth?tab=login" className="btn-nav btn-ghostt">دخول</Link><Link href="/auth?tab=signup" className="btn-nav btn-accent">إنشاء حساب</Link></>}
  </div>;

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <div className="right topbar-info">
            <TopbarClock />
            <select className="lang" aria-label="اختر اللغة" defaultValue="العربية">
              <option>العربية</option>
              <option>English</option>
              <option>Français</option>
            </select>
          </div>
          <div className="left social-icons">
            {SOCIAL_LINKS.map((social) => (
              <a key={social.name} href="#" aria-label={social.label} className={social.name}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className="site">
        <div className="wrap header-inner">
          <button type="button" className="icon-btn burger" aria-label="فتح القائمة" onClick={() => setDrawerOpen(true)}>
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
            <button type="button" className="icon-btn" data-open-search aria-label="بحث" onClick={() => { setDrawerOpen(false); setSearchOpen(true); }}>
              🔍
            </button>
            {renderAccountLinks("auth-group mobile-header-account")}
          </div>
        </div>
      </header>

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
                <button type="button" className="nav-link dropdown-btn">المزيد</button>
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
              aria-label="بحث"
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
            {staffRoles.length > 0 ? <Link href="/cms" onClick={() => setDrawerOpen(false)}>لوحة التحرير</Link> : signedIn ? <Link href="/auth" onClick={() => setDrawerOpen(false)}>صفحتي</Link> : <><Link href="/auth?tab=login" onClick={() => setDrawerOpen(false)}>دخول</Link><Link href="/auth?tab=signup" onClick={() => setDrawerOpen(false)}>إنشاء حساب</Link></>}
          </nav>
        </div>
      </div>

      <div className={`search-overlay${searchOpen ? " is-active" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <div className={`search-panel${searchOpen ? " is-active" : ""}`} role="dialog" aria-modal="true" aria-label="بحث في الأخبار">
          <form action="/search" method="get" style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              name="q"
              placeholder="ابحث عن خبر، دولة، أو خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={searchOpen}
            />
            <button type="submit" className="icon-btn" aria-label="تنفيذ البحث">🔍</button>
            <button type="button" className="icon-btn" aria-label="إغلاق البحث" onClick={() => setSearchOpen(false)}>✕</button>
          </form>
          <div className="search-suggest" aria-live="polite">
            {suggestionsLoading && <p className="row">جارٍ البحث…</p>}
            {!suggestionsLoading && searchQuery.trim().length >= 2 && suggestions.map((item) => (
              <Link className="row" key={item.id} href={`/article/${item.id}/${encodeURIComponent(item.slug)}`} onClick={() => setSearchOpen(false)}>{item.title}</Link>
            ))}
            {!suggestionsLoading && searchQuery.trim().length >= 2 && suggestions.length === 0 && <p className="row">لا توجد نتائج مطابقة حتى الآن.</p>}
            {searchQuery.trim().length >= 2 && <Link className="row" href={`/search?q=${encodeURIComponent(searchQuery.trim())}`} onClick={() => setSearchOpen(false)}>عرض كل نتائج البحث ←</Link>}
          </div>
        </div>
      </div>
    </>
  );
}
