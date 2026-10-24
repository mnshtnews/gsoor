"use client";

import { useEffect, useState } from "react";
import { parseLocale, type SiteLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";

export function useUiLocale() {
  const [locale, setLocale] = useState<SiteLocale>("ar");
  useEffect(() => {
    const value = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jusoor_locale="))?.split("=")[1];
    setLocale(parseLocale(value ? decodeURIComponent(value) : null));
  }, []);
  return { locale, dir: locale === "ar" ? "rtl" as const : "ltr" as const, t: (value: string) => translateUi(locale, value) };
}
