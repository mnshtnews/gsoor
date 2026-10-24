"use client";
import { useCallback, useEffect, useState } from "react";
import { cms, type CmsArticleTranslation } from "@/lib/cms-client";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { parseLocale } from "@/lib/site-copy";
import { translateUi } from "@/lib/ui-translations";
const locales = [{ id: "en", label: "English" }, { id: "fr", label: "Français" }] as const;
export function ArticleTranslationsPanel({ articleId, canReview }: { articleId: string; canReview: boolean }) {
 const [locale,setLocale]=useState<"en"|"fr">("en"), [uiLocale,setUiLocale]=useState<"ar"|"en"|"fr">("ar"), [items,setItems]=useState<CmsArticleTranslation[]>([]), [title,setTitle]=useState(""), [summary,setSummary]=useState(""), [body,setBody]=useState(""), [busy,setBusy]=useState(false), [message,setMessage]=useState("");
 const current=items.find(x=>x.locale===locale);
 const t=(value:string)=>translateUi(uiLocale,value);
 useEffect(()=>{const value=document.cookie.split(";").map((part)=>part.trim()).find((part)=>part.startsWith("jusoor_locale="))?.split("=")[1];setUiLocale(parseLocale(value?decodeURIComponent(value):null));},[]);
 function selectVersion(rows:CmsArticleTranslation[], selected=locale){setItems(rows);const v=rows.find(x=>x.locale===selected);setTitle(v?.title??"");setSummary(v?.summary??"");setBody(v?.body??"");}
 const refresh=useCallback(async()=>{const rows=await cms.translations(articleId);setItems(rows);const v=rows.find(x=>x.locale===locale);setTitle(v?.title??"");setSummary(v?.summary??"");setBody(v?.body??"");},[articleId,locale]);
 useEffect(()=>{void refresh().catch(()=>setMessage(translateUi(uiLocale,"تعذر تحميل الترجمات.")));},[refresh,uiLocale]);
 function changeLocale(next:"en"|"fr"){setLocale(next);selectVersion(items,next);setMessage("");}
 async function generate(){setBusy(true);setMessage("");try{selectVersion(await cms.generateTranslations(articleId));setMessage(t("تم إنشاء مسودتي الترجمة. راجعهما قبل الاعتماد."));}catch(e){setMessage(e instanceof Error?e.message:t("تعذّر إنشاء الترجمات."));}finally{setBusy(false);}}
 async function save(){setBusy(true);setMessage("");try{const saved=await cms.saveTranslation(articleId,locale,{title,summary:summary||null,body});setItems(old=>[...old.filter(x=>x.locale!==locale),saved]);setMessage(t("تم حفظ النسخة التحريرية."));}catch(e){setMessage(e instanceof Error?e.message:t("تعذّر حفظ الترجمة."));}finally{setBusy(false);}}
 async function review(){setBusy(true);setMessage("");try{const saved=await cms.reviewTranslation(articleId,locale);setItems(old=>[...old.filter(x=>x.locale!==locale),saved]);setMessage(t("تم اعتماد النسخة لتظهر للقراء."));}catch(e){setMessage(e instanceof Error?e.message:t("تعذّر اعتماد الترجمة."));}finally{setBusy(false);}}
 return <section className="cms-card article-translations" aria-labelledby="article-translations-title">
  <header className="cms-card-header"><div><h2 id="article-translations-title">{t("النسخ اللغوية")}</h2><p>{t("تُنشأ الإنجليزية والفرنسية آليًا كمسودات. راجع النص قبل اعتماده للقراء.")}</p></div><button type="button" className="cms-btn" disabled={busy} onClick={()=>void generate()}>{busy?t("جارٍ العمل…"):t("إنشاء / تحديث الترجمتين")}</button></header>
  <div className="article-translation-tabs" role="tablist" aria-label={t("لغة الترجمة")}>{locales.map(x=><button type="button" key={x.id} role="tab" aria-selected={locale===x.id} onClick={()=>changeLocale(x.id)}>{x.label}</button>)}</div>
  {!current&&<p className="cms-hint">{t("لا توجد نسخة لهذه اللغة بعد. يمكنك كتابة ترجمة مباشرة أو توليدها آليًا.")}</p>}
  {current?.isStale&&<p className="cms-error">{t("تغير المقال الأصلي؛ حدّث هذه الترجمة قبل اعتمادها.")}</p>}
  <label className="cms-field"><span>{t("العنوان")}</span><input maxLength={300} value={title} onChange={e=>setTitle(e.target.value)} dir="auto"/></label>
  <label className="cms-field"><span>{t("الملخص")}</span><textarea maxLength={500} rows={3} value={summary} onChange={e=>setSummary(e.target.value)} dir="auto"/></label>
  <div className="cms-field"><span>{t("نص الخبر")}</span><RichTextEditor id="translation-body" value={body} onChange={setBody}/></div>
  <div className="article-translation-actions"><button type="button" className="cms-btn" disabled={busy||!title.trim()||!body.trim()} onClick={()=>void save()}>{t("حفظ النسخة")}</button>{canReview&&<button type="button" className="cms-btn primary" disabled={busy||!current||current.isStale} onClick={()=>void review()}>{t("اعتماد وإظهار للقراء")}</button>}<span className="cms-hint">{current?"الحالة: "+(current.status==="MachineDraft"?t("مسودة آلية"):current.status==="Reviewed"?t("معتمدة"):t("تحرير يدوي"))+(current.provider==="azure-translator"?" · Azure Translator":""):t("يمكنك كتابة هذه اللغة مباشرة.")}</span></div>
  {message&&<p role="status" className="cms-hint">{message}</p>}
 </section>;
}


