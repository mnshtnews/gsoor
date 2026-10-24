using Jusoor.Domain.Enums;
using System.Security.Cryptography;
using System.Text;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Application.Common.Security;
using Jusoor.Application.Editorial;
using Jusoor.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/cms/articles/{id:guid}/translations")]
[Authorize(Policy = AuthorizationPolicies.CanAccessCms)]
public sealed class EditorialArticleTranslationsController(
    IApplicationDbContext db,
    ICurrentUserService currentUser,
    IEditorialHtmlSanitizer sanitizer,
    IDateTimeProvider clock,
    Jusoor.Api.Services.EditorialTranslationGenerator generator) : ControllerBase
{
    public sealed record SaveRequest(string Title, string? Summary, string Body);
    public sealed record TranslationDto(string Locale, string Title, string? Summary, string Body, string Status, string Provider, DateTimeOffset? ReviewedAtUtc, bool IsStale);

    [HttpGet]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        if (currentUser.UserId is not { } userId) return Unauthorized();
        var article = await db.EditorialArticles.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null) return NotFound();
        if (!EditorialArticleAccess.CanView(currentUser.Roles, userId, article)) return Forbid();
        var fingerprint = Fingerprint(article);
        var rows = await db.EditorialArticleTranslations.AsNoTracking().Where(t => t.EditorialArticleId == id).OrderBy(t => t.Locale).ToListAsync(ct);
        return Ok(rows.Select(t => ToDto(t, fingerprint)));
    }

    [HttpPost("generate")]
    [Authorize(Policy = AuthorizationPolicies.CanCreateEditorialArticle)]
    public async Task<IActionResult> Generate(Guid id, CancellationToken ct)
    {
        if (currentUser.UserId is not { } userId) return Unauthorized();
        var article = await db.EditorialArticles.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null) return NotFound();
        if (!EditorialArticleAccess.CanEdit(currentUser.Roles, userId, article)) return Forbid();
        if (!await generator.GenerateAsync(id, ct, forceMachineDraftRefresh: false)) return StatusCode(503, new { message = "Translation is unavailable or not configured on the server." });
        return await Get(id, ct);
    }

    [HttpPut("{locale}")]
    [Authorize(Policy = AuthorizationPolicies.CanCreateEditorialArticle)]
    public async Task<IActionResult> Save(Guid id, string locale, SaveRequest request, CancellationToken ct)
    {
        if (currentUser.UserId is not { } userId) return Unauthorized();
        if (locale is not ("en" or "fr")) return BadRequest(new { message = "Supported locales are en and fr." });
        var article = await db.EditorialArticles.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null) return NotFound();
        if (!EditorialArticleAccess.CanEdit(currentUser.Roles, userId, article)) return Forbid();
        var fingerprint = Fingerprint(article);
        var body = sanitizer.Sanitize(request.Body);
        var row = await db.EditorialArticleTranslations.FirstOrDefaultAsync(t => t.EditorialArticleId == id && t.Locale == locale, ct);
        if (row is null)
        {
            row = EditorialArticleTranslation.CreateMachineDraft(id, locale, request.Title, request.Summary, body, fingerprint, "editor", clock.UtcNow);
            db.EditorialArticleTranslations.Add(row);
        }
        row.SaveEditorialVersion(request.Title, request.Summary, body, fingerprint, userId, clock.UtcNow);
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(row, fingerprint));
    }

    [HttpPost("{locale}/review")]
    [Authorize(Policy = AuthorizationPolicies.CanApproveEditorialArticle)]
    public async Task<IActionResult> Review(Guid id, string locale, CancellationToken ct)
    {
        if (currentUser.UserId is not { } userId) return Unauthorized();
        if (locale is not ("en" or "fr")) return BadRequest();
        var article = await db.EditorialArticles.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null) return NotFound();
        var row = await db.EditorialArticleTranslations.FirstOrDefaultAsync(t => t.EditorialArticleId == id && t.Locale == locale, ct);
        if (row is null) return NotFound();
        var fingerprint = Fingerprint(article);
        if (row.SourceFingerprint != fingerprint) return Conflict(new { message = "Source text changed; update the translation before review." });
        row.MarkReviewed(userId, clock.UtcNow);
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(row, fingerprint));
    }

    private static string Fingerprint(EditorialArticle article)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{article.Title}\n{article.Summary}\n{article.Body}"))).ToLowerInvariant();

    private static TranslationDto ToDto(EditorialArticleTranslation t, string fingerprint)
        => new(t.Locale, t.Title, t.Summary, t.Body, t.Status.ToString(), t.Provider, t.ReviewedAtUtc, t.SourceFingerprint != fingerprint);
}

