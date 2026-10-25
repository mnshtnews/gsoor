"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import Image from "next/image";
import type { PublicAdPlacement } from "@/lib/news-api";

interface Service {
  icon: string;
  title: string;
  description: string;
  href: string;
  featured?: boolean;
}

const services: Service[] = [
  { icon: "🆘", title: "اطمّن على مغتربك", description: "إرسال بلاغ خاص لفريق المتابعة", href: "/atmaen", featured: true },
  { icon: "🗺️", title: "خريطة المهجر", description: "بيانات موثقة عن الجاليات", href: "/diaspora-map" },
  { icon: "🔔", title: "تنبيهات جغرافية", description: "إشعارات الطوارئ", href: "#city-alerts" },
  { icon: "⚽", title: "الرياضيون", description: "متابعة المحترفين", href: "/category?cat=sports" },
  { icon: "🏛️", title: "دليل السفارات", description: "المعاملات والتواصل", href: "/category?cat=official" },
  { icon: "👤", title: "ملف جسور", description: "أخبار تهمك", href: "/category?cat=mughtarib" },
  { icon: "💼", title: "فرص العمل", description: "وظائف دولية", href: "/category?cat=opportunities" },
  { icon: "🎓", title: "الجيل الثاني", description: "برامج وقصص ملهمة", href: "/category?cat=secondgen" },
];

/**
 * Same markup/classes as the Final Demo's services band. It is a Client
 * Component because the arrow buttons scroll the row (event handlers cannot
 * be rendered from the Server Component home page).
 */
export function ServicesBand({ ads = [] }: { ads?: PublicAdPlacement[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [locale, setLocale] = useState<"ar" | "en" | "fr">("ar");
  const t = (value: string) => translateUi(locale, value);
  useEffect(() => { const value = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("jusoor_locale="))?.split("=")[1]; setLocale(parseLocale(value ? decodeURIComponent(value) : null)); }, []);
  const scroll = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector<HTMLElement>(".svc-card");
    const rtl = getComputedStyle(row).direction === "rtl";
    const distance = card ? card.offsetWidth + 16 : row.clientWidth * 0.8;
    row.scrollBy({ left: direction * (rtl ? -1 : 1) * distance, behavior: "smooth" });
  };

  return (
    <section className="services-band" id="services" aria-labelledby="services-heading" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="wrap">
        <div className="services-header-wrap">
          <div className="section-head-title">
            <h2 className="eyebrow-tag" id="services-heading">{t("منظومة الخدمات")}</h2>
          </div>

        </div>

        <div className="svc-slider-container">
          <div className="svc-row" id="svcRow" ref={rowRef}>
            {services.map((service, index) => { const placement = ads.find((item) => item.slotKey === `services-${index + 1}`); return <Fragment key={service.title}>
              <a className={`svc-card${service.featured ? " featured" : ""}`} href={service.href}>
                <div className="icon-box">
                  <span className="emoji-icon">{service.icon}</span>
                  {service.featured && <div className="glow-effect" />}
                </div>
                <div className="svc-content">
                  <span className="svc-title">{t(service.title)}</span>
                  <span className="svc-desc">{t(service.description)}</span>
                </div>
              </a>
              {placement && <a className="svc-card svc-ad-card" href={placement.targetUrl} target="_blank" rel="sponsored noopener noreferrer" aria-label={`${placement.altText} — ${t("زيارة موقع المعلن")}`}>
                <span className="svc-ad-card__label">{t("مساحة إعلانية · إعلان ممول")}</span>
                {/* Blurred copy of the creative fills any letterbox gap, so the sharp original is never cropped or stretched. */}
                <span className="svc-ad-card__media">
                  <Image className="svc-ad-card__bg" src={placement.mediaUrl} alt="" aria-hidden="true" fill sizes="280px" unoptimized />
                  <Image className="svc-ad-card__img" src={placement.mediaUrl} alt={placement.altText} fill sizes="280px" unoptimized />
                </span>
              </a>}
            </Fragment>; })}
          </div>
        </div>
        <div className="svc-controls" role="group" aria-label={t("التنقل بين الخدمات")}>
          <button className="svc-arrow-btn prev" type="button" aria-label={t("الخدمة السابقة")} onClick={() => scroll(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <button className="svc-arrow-btn next" type="button" aria-label={t("الخدمة التالية")} onClick={() => scroll(1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
