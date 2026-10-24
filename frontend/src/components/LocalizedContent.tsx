"use client";

import { cloneElement, isValidElement, type ReactNode } from "react";
import { useUiLocale } from "@/lib/use-ui-locale";

function isCmsPageRoot(props: Record<string, unknown>) {
  const className = typeof props.className === "string" ? props.className : "";
  return ["cms-site-structure", "cms-polls-page", "cms-ad-manager"].some((name) => className.includes(name)) || className === "cms-card" || className === "wrap cms-card";
}

function localize(node: ReactNode, t: (value: string) => string, locale: "ar" | "en" | "fr"): ReactNode {
  if (typeof node === "string") return t(node);
  if (typeof node === "number" || node === null || node === undefined || typeof node === "boolean") return node;
  if (Array.isArray(node)) return node.map((child) => localize(child, t, locale));
  if (!isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") next.children = localize(value as ReactNode, t, locale);
    else if (["placeholder", "aria-label", "title", "alt"].includes(key) && typeof value === "string") next[key] = t(value);
    else if (key === "dir" && value === "rtl" && isCmsPageRoot(props)) next.dir = locale === "ar" ? "rtl" : "ltr";
    else next[key] = value;
  }
  return cloneElement(node, next);
}

export function LocalizedContent({ children }: { children: ReactNode }) {
  const { locale, dir, t } = useUiLocale();
  return <div lang={locale} dir={dir} className="ui-localized-content">{localize(children, t, locale)}</div>;
}
