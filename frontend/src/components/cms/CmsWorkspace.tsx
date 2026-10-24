"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cms, type CmsSession } from "@/lib/cms-client";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

type NavItem = { label: string; href: string; roles?: string[]; permissions?: string[]; exact?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const SENIOR = ["SeniorEditor", "ManagingEditor", "EditorInChief"];
const CREATORS = ["Reporter", "AiEditor", "CopyEditor", ...SENIOR];
const ARTICLE_STAFF = [...CREATORS, "FactChecker", "SystemAdmin"];
const GROUPS: NavGroup[] = [
  { title: "غرفة الأخبار", items: [
    { label: "نظرة عامة", href: "/cms", exact: true },
    { label: "كل المقالات", href: "/cms?status=", roles: ARTICLE_STAFF },
    { label: "المسودات", href: "/cms?status=Draft", roles: ARTICLE_STAFF },
    { label: "قيد المراجعة", href: "/cms?status=InReview", roles: ARTICLE_STAFF },
    { label: "مجدول للنشر", href: "/cms?status=Scheduled", roles: ARTICLE_STAFF },
    { label: "إضافة مقال", href: "/cms/articles/new", roles: CREATORS },
    { label: "تحسين SEO", href: "/cms/seo", roles: ["SeoEditor", ...SENIOR] },
  ] },
  { title: "الرئيسية والإعلانات", items: [
    { label: "الرئيسية والقائمة", href: "/cms/site-structure", roles: ["EditorInChief"] },
    { label: "استبيانات الرئيسية", href: "/cms/polls", roles: SENIOR },
    { label: "فيديوهات الرئيسية", href: "/cms/home-videos", roles: SENIOR },
    { label: "إدارة الإعلانات", href: "/cms/advertisements", roles: SENIOR },
  ] },
  { title: "إدارة المنصة", items: [
    { label: "المستخدمون والصلاحيات", href: "/cms/users", roles: ["SystemAdmin", "EditorInChief"], permissions: ["Users.View", "Users.Create", "Users.ManageRoles"] },
    { label: "دليل الدول والمدن", href: "/cms/geography", roles: ["EditorInChief"] },
      { label: "بيانات خريطة المهجر", href: "/cms/diaspora-map", roles: ["EditorInChief"] },
  ] },
  { title: "اطمّن", items: [
    { label: "قائمة الحالات المسندة", href: "/cms/atmaen", roles: ["CrisisEditor"] },
  ] },
  { title: "إدارة الأزمات", items: [
    { label: "وضع الأزمة والدول المتأثرة", href: "/cms/crisis", roles: ["ManagingEditor", "EditorInChief"] },
  ] },
  { title: "التقارير والمراقبة", items: [
    { label: "مراقبة غرفة الأخبار", href: "/cms/reports", roles: ["SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin"] },
  ] },
];

function canSee(item: NavItem, roles: string[], permissions: string[]) {
  return (!item.roles || item.roles.some((role) => roles.includes(role))) || (item.permissions?.some((permission) => permissions.includes(permission)) ?? false);
}

export default function CmsWorkspace({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<CmsSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locale, setLocale] = useState<"ar" | "en" | "fr">("ar");
  const isLogin = pathname === "/cms/login";

  useEffect(() => {
    const value = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jusoor_locale="))?.split("=")[1];
    setLocale(parseLocale(value ? decodeURIComponent(value) : null));
  }, []);
  useEffect(() => {
    if (isLogin) return;
    let alive = true;
    void cms.session().then((current) => { if (alive) setSession(current); });
    return () => { alive = false; };
  }, [isLogin, pathname]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  useEffect(() => {
    const syncQuery = () => setQuery(window.location.search);
    const syncQueryFromNavigation = (event: Event) => setQuery((event as CustomEvent<string>).detail);
    syncQuery();
    window.addEventListener("popstate", syncQuery);
    window.addEventListener("cms-query-change", syncQueryFromNavigation);
    return () => { window.removeEventListener("popstate", syncQuery); window.removeEventListener("cms-query-change", syncQueryFromNavigation); };
  }, [pathname]);

  async function logout() {
    await cms.logout();
    router.replace("/cms/login");
  }

  if (isLogin) return <div className="cms-login-frame">{children}</div>;
  const text = (value: string) => translateUi(locale, value);
  const roles = session?.roles ?? [];
  const permissions = session?.permissions ?? [];
  const groups = GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => canSee(item, roles, permissions)) })).filter((group) => group.items.length > 0);

  return (
    <div className="cms-workspace" dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="cms-topbar">
        <button className="cms-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="cms-sidebar" aria-label={text(menuOpen ? "إغلاق القائمة" : "فتح القائمة")}><span aria-hidden="true">☰</span></button>
        <Link className="cms-brand" href="/cms" aria-label="جسور، لوحة التحرير"><Image className="cms-brand-img" src="/assets/josour-logo-transparent.png" alt="" width={1104} height={974} priority /><span><strong>جسور</strong><small>غرفة الأخبار الرقمية</small></span></Link>
        <div className="cms-topbar-meta"><span className="cms-live-indicator"><i /> {text("مساحة التحرير")}</span><span className="cms-topbar-user">{session?.email ?? text("جارٍ التحقق من الجلسة…")}</span><button className="cms-logout" type="button" onClick={() => void logout()}>{text("خروج")}</button></div>
      </header>
      {menuOpen && <button className="cms-sidebar-scrim" type="button" onClick={() => setMenuOpen(false)} aria-label={text("إغلاق القائمة")} />}
      <div className="cms-app-layout">
        <aside id="cms-sidebar" className={`cms-sidebar${menuOpen ? " is-open" : ""}`} aria-label={text("القائمة الرئيسية للوحة التحرير")}>
          <div className="cms-sidebar-caption">{text("مساحة العمل")}</div>
          <nav>{groups.map((group) => <section className="cms-nav-group" key={group.title}><h2>{text(group.title)}</h2><ul>{group.items.map((item) => {
            const queryValue = item.href.includes("?") ? item.href.slice(item.href.indexOf("?")) : "";
            const active = item.exact ? pathname === item.href && !query : item.href.startsWith("/cms?") ? pathname === "/cms" && query === queryValue : item.href === "/cms" ? pathname === "/cms" && !query || (pathname.startsWith("/cms/articles/") && pathname !== "/cms/articles/new") : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <li key={item.href + item.label}><Link className={active ? "is-active" : ""} href={item.href} aria-current={active ? "page" : undefined} onClick={() => { if (item.href.startsWith("/cms?status=")) { setQuery(queryValue); window.dispatchEvent(new CustomEvent("cms-status-filter", { detail: item.href.slice(item.href.indexOf("=") + 1) })); } }}><span className="cms-nav-marker" aria-hidden="true" />{text(item.label)}{active && <span className="cms-nav-current">{text("أنت هنا")}</span>}</Link></li>;
          })}</ul></section>)}</nav>
          <div className="cms-sidebar-footer"><span>{text("جسور · لوحة إدارة المحتوى")}</span><span>{text("نسخة تحريرية")}</span></div>
        </aside>
        <section className="cms-main-panel" aria-label={text("محتوى الصفحة")}><div className="cms-breadcrumb"><span>جسور</span><span aria-hidden="true">/</span><strong>{GROUPS.flatMap((group) => group.items).find((item) => item.href.startsWith("/cms?") ? pathname === "/cms" && query === item.href.slice(item.href.indexOf("?")) : item.exact ? pathname === item.href && !query : pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ? text(GROUPS.flatMap((group) => group.items).find((item) => item.href.startsWith("/cms?") ? pathname === "/cms" && query === item.href.slice(item.href.indexOf("?")) : item.exact ? pathname === item.href && !query : pathname === item.href || pathname.startsWith(`${item.href}/`))!.label) : text("التحرير")}</strong></div>{children}</section>
      </div>
    </div>
  );
}