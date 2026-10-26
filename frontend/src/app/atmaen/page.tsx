import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { AtmaenRequestForm } from "@/components/AtmaenRequestForm";

export const metadata: Metadata = {
  title: "اطمّن على مغتربك | جسور",
  description: "أرسل بلاغًا خاصًا لفريق جسور لمساعدتك على الاطمئنان على مغترب.",
  robots: { index: false, follow: true },
};

export default async function AtmaenPage() {
  const locale = parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t = (value: string) => translateUi(locale, value);
  return <main id="main" className="atmaen-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="atmaen-page-hero"><div className="wrap"><Link className="atmaen-page-back" href="/">{t("← الرئيسية")}</Link><span className="atmaen-page-kicker">{t("جسور معك وقت القلق")}</span><h1>{t("لأن الاطمئنان حق")}</h1><p>{t("أرسل بلاغًا خاصًا لفريق المتابعة بسرية. نتحقق من رقمك أولًا، ثم تصل التفاصيل إلى محرر مختص لمراجعتها.")}</p><div className="atmaen-page-points"><span><i aria-hidden="true">✓</i>{t("بلاغ خاص لا يظهر للعموم")}</span><span><i aria-hidden="true">✓</i>{t("متابعة من محرر مختص")}</span><span><i aria-hidden="true">✓</i>{t("لا ننشر بيانات التواصل")}</span></div></div></section>
    <div className="wrap atmaen-page-community-link"><div><strong>{t("تحديثات الاطمئنان من المجتمع")}</strong><p>{t("شارك أو تابع تحديثات عامة منفصلة تمامًا عن البلاغات السرية.")}</p></div><Link href="/atmaen/community">{t("تصفّح مجتمع الاطمئنان ←")}</Link></div><div className="wrap atmaen-page-content"><AtmaenRequestForm /><aside className="atmaen-page-aside"><div><span aria-hidden="true">ℹ</span><h2>{t("قبل إرسال البلاغ")}</h2><ul><li>{t("اكتب بيانات دقيقة تساعد فريق المتابعة.")}</li><li>{t("أدخل رقمًا دوليًا تستطيع استلام رمز التأكيد عليه.")}</li><li>{t("لا ترسل كلمات مرور أو معلومات مالية.")}</li><li>{t("الخدمة ليست بديلًا عن الطوارئ أو الجهات الرسمية.")}</li></ul><Link href="/crisis">{t("مركز الأزمة والتنبيهات ←")}</Link></div><div className="atmaen-page-aside__support"><strong>{t("هل يوجد خطر مباشر؟")}</strong><p>{t("اتصل بخدمات الطوارئ المحلية أو بالسفارة المصرية في بلد الشخص.")}</p></div></aside></div>
  </main>;
}
