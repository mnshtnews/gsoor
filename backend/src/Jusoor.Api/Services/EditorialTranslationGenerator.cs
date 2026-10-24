using System.Security.Cryptography;
using System.Text;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Application.Editorial;
using Microsoft.EntityFrameworkCore;
namespace Jusoor.Api.Services;
public sealed class EditorialTranslationGenerator(IApplicationDbContext db,IEditorialTextTranslator translator,IEditorialHtmlSanitizer sanitizer,IDateTimeProvider clock,ILogger<EditorialTranslationGenerator> logger)
{
 public async Task<bool> GenerateAsync(Guid articleId,CancellationToken ct,bool forceMachineDraftRefresh=false)
 {
  if(!translator.IsConfigured)return false;
  var article=await db.EditorialArticles.FirstOrDefaultAsync(a=>a.Id==articleId,ct); if(article is null)return false;
  var fingerprint=Fingerprint(article);
  try {
   foreach(var locale in new[]{"en","fr"}) {
    var row=await db.EditorialArticleTranslations.FirstOrDefaultAsync(t=>t.EditorialArticleId==articleId&&t.Locale==locale,ct);
    if(row is not null&&(row.Status is Jusoor.Domain.Enums.EditorialTranslationStatus.Manual or Jusoor.Domain.Enums.EditorialTranslationStatus.Reviewed))continue;
    if(row is not null&&row.SourceFingerprint==fingerprint&&!forceMachineDraftRefresh)continue;
    var title=await translator.TranslateAsync(article.Title,locale,ct);
    var sourceSummary=article.Summary??ArticleBodyContent.Excerpt(article.Body,article.BodyFormat,240);
    var summary=string.IsNullOrWhiteSpace(sourceSummary)?null:await translator.TranslateAsync(sourceSummary,locale,ct);
    var body=sanitizer.Sanitize(await translator.TranslateAsync(ArticleBodyContent.ToHtml(article.Body,article.BodyFormat),locale,ct));
    if(row is null)db.EditorialArticleTranslations.Add(Jusoor.Domain.Entities.EditorialArticleTranslation.CreateMachineDraft(articleId,locale,title,summary,body,fingerprint,"azure-translator",clock.UtcNow));
    else row.SetMachineDraft(title,summary,body,fingerprint,"azure-translator",clock.UtcNow);
   }
   await db.SaveChangesAsync(ct);return true;
  } catch(Exception ex) when(ex is not OperationCanceledException) {logger.LogWarning(ex,"Automatic translation failed for article {ArticleId}; source article remains saved.",articleId);return false;}
 }
 private static string Fingerprint(Jusoor.Domain.Entities.EditorialArticle article)=>Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{article.Title}\n{article.Summary}\n{article.Body}"))).ToLowerInvariant();
}
