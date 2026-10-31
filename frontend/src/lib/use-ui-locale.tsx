"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import type { SiteLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

const UiLocaleContext = createContext<SiteLocale>("ar");

export function UiLocaleProvider({ locale, children }: { locale: SiteLocale; children: ReactNode }) {
  return <UiLocaleContext.Provider value={locale}>{children}</UiLocaleContext.Provider>;
}

export function useUiLocale() {
  const locale = useContext(UiLocaleContext);
  const t = useCallback((value: string) => translateUi(locale, value), [locale]);
  return { locale, dir: locale === "ar" ? "rtl" as const : "ltr" as const, t };
}
