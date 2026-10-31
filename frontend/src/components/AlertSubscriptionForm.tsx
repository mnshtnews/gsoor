"use client";

import { FormEvent, useEffect, useState } from "react";
import { useUiLocale } from "@/lib/use-ui-locale";

type Status = { enabled: boolean };

export function AlertSubscriptionForm() {
  const { locale, t } = useUiLocale();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/alerts-api", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("تعذّر تحميل حالة الاشتراك.");
        return response.json() as Promise<Status>;
      })
      .then((status) => { if (active) setEnabled(status.enabled); })
      .catch(() => { if (active) setEnabled(false); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setIsError(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/alerts-api", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), consent: form.get("consent") === "on", website: form.get("website") }),
      });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(t(result.message ?? "تعذّر تسجيل الاشتراك."));
      formElement.reset();
      setMessage(t("تم حفظ بريدك. سيبدأ إرسال التنبيهات عند ربط مزوّد البريد وتفعيله."));
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : t("تعذّر تسجيل الاشتراك."));
    } finally { setBusy(false); }
  }

  return <form className="cta-form cta-form--subscription" onSubmit={subscribe}>
    <label className="cta-subscription-label" htmlFor="crisis-alert-email">{t("بريدك الإلكتروني")}</label>
    <input id="crisis-alert-email" name="email" type="email" autoComplete="email" required maxLength={320} placeholder={t("بريدك الإلكتروني")} disabled={loading || !enabled || busy} />
    <button type="submit" disabled={loading || !enabled || busy}>{busy ? t("جارٍ التسجيل…") : t("اشترك")}</button>
    <input className="cta-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label className="cta-consent"><input name="consent" type="checkbox" required disabled={loading || !enabled || busy} /> <span>{locale === "ar" ? <>أوافق على حفظ بريدي لإرسال تنبيهات الأزمات العامة وفق <a href="/privacy" target="_blank" rel="noreferrer">سياسة الخصوصية</a>.</> : <>{t("أوافق على حفظ بريدي لإرسال تنبيهات الأزمات العامة وفق")} <a href="/privacy" target="_blank" rel="noreferrer">{t("سياسة الخصوصية")}</a>.</>}</span></label>
    <p className={`cta-subscription-status${isError ? " is-error" : ""}`} role="status">{loading ? t("جارٍ التحقق من إتاحة الاشتراك…") : !enabled ? t("الاشتراك مغلق مؤقتًا.") : message}</p>
  </form>;
}
