"use client";

import { useEffect, useState } from "react";
import { LOCALE_LABELS, parseLocale, type SiteLocale } from "@/lib/site-copy";

export function LocaleSelector({ className, locale = "ar" }: { className: string; locale?: SiteLocale }) {
  const [selected, setSelected] = useState<SiteLocale>(locale);
  useEffect(() => { setSelected(parseLocale(document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith("jusoor_locale="))?.split("=")[1])); }, []);
  function change(value: string) {
    const next = parseLocale(value);
    setSelected(next);
    document.cookie = `jusoor_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }
  return <select className={className} aria-label={selected === "en" ? "Choose language" : selected === "fr" ? "Choisir la langue" : "اختر اللغة"} value={selected} onChange={event => change(event.target.value)}>
    <option value="ar">{LOCALE_LABELS.ar}</option><option value="en">English</option><option value="fr">Français</option>
  </select>;
}
