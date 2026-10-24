import type { Metadata } from "next";
import { getPublicDiasporaMap } from "@/lib/news-api";
import { cookies } from "next/headers";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
import { DiasporaMapExplorer } from "@/components/DiasporaMapExplorer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "خريطة المهجر | جسور",
  description: "مؤشرات موثقة عن أماكن انتشار الجاليات المصرية، مع فصل التقديرات المنشورة عن المشاركات المجتمعية المجهّلة.",
};

export default async function DiasporaMapPage() {
  const locale=parseLocale((await cookies()).get("jusoor_locale")?.value);
  const t=(value:string)=>translateUi(locale,value);
  const result = await Promise.allSettled([getPublicDiasporaMap()]);
  const items = result[0].status === "fulfilled" ? result[0].value : [];
  return <main id="main" className="diaspora-map-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="diaspora-map-hero"><div className="wrap"><span>{t("جسور حول العالم")}</span><h1>{t("خريطة المهجر")}</h1><p>{t("صورة موثقة عن أماكن انتشار المصريين بالخارج، مع تمييز واضح بين التقديرات المنشورة ومؤشرات مجتمع جسور.")}</p><div className="diaspora-map-hero__facts"><span><b>{new Set(items.map((item) => item.countryId)).size}</b> دول ذات بيانات منشورة</span><span><b>{items.length}</b> مواقع موثقة</span></div></div></section>
    <section className="section diaspora-map-content"><div className="wrap"><div className="diaspora-map-disclosure"><span aria-hidden="true">ⓘ</span><p><strong>{t("كيف تقرأ الخريطة؟")}</strong> تقديرات السكان مصدرها الروابط وتواريخ النشر بجانب كل رقم، وهي بيانات تقديرية وليست إحصاءً حكوميًا. مؤشرات مستخدمي جسور مجهّلة ولا تظهر إلا للمجموعات التي تضم 25 مشاركة موقع على الأقل. لا نعرض مواقع أو هويات أفراد.</p></div><DiasporaMapExplorer items={items} /></div></section>
  </main>;
}
