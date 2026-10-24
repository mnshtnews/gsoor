using Jusoor.Domain.Common;
using Jusoor.Domain.Enums;

namespace Jusoor.Domain.Entities;

/// <summary>A language-specific version of a newsroom article, independent from its Arabic source.</summary>
public sealed class EditorialArticleTranslation : AuditableEntity
{
    public const int TitleMaxLength = 300;
    public const int SummaryMaxLength = 500;
    public const int BodyMaxLength = 100_000;

    public Guid EditorialArticleId { get; private set; }
    public string Locale { get; private set; } = null!;
    public string Title { get; private set; } = null!;
    public string? Summary { get; private set; }
    public string Body { get; private set; } = null!;
    public string SourceFingerprint { get; private set; } = null!;
    public string Provider { get; private set; } = null!;
    public EditorialTranslationStatus Status { get; private set; }
    public string? ReviewedByUserId { get; private set; }
    public DateTimeOffset? ReviewedAtUtc { get; private set; }

    private EditorialArticleTranslation() { }

    public static EditorialArticleTranslation CreateMachineDraft(Guid articleId, string locale, string title, string? summary,
        string body, string fingerprint, string provider, DateTimeOffset nowUtc)
    {
        var translation = new EditorialArticleTranslation { EditorialArticleId = articleId, Locale = locale };
        translation.SetMachineDraft(title, summary, body, fingerprint, provider, nowUtc);
        return translation;
    }

    public void SetMachineDraft(string title, string? summary, string body, string fingerprint, string provider, DateTimeOffset nowUtc)
    {
        Validate(locale: Locale, title, summary, body, fingerprint);
        Title = title.Trim(); Summary = string.IsNullOrWhiteSpace(summary) ? null : summary.Trim(); Body = body;
        SourceFingerprint = fingerprint; Provider = provider; Status = EditorialTranslationStatus.MachineDraft;
        ReviewedByUserId = null; ReviewedAtUtc = null;
    }

    public void SaveEditorialVersion(string title, string? summary, string body, string fingerprint, string editorUserId, DateTimeOffset nowUtc)
    {
        Validate(Locale, title, summary, body, fingerprint);
        if (string.IsNullOrWhiteSpace(editorUserId)) throw new ArgumentException("An editor is required.", nameof(editorUserId));
        Title = title.Trim(); Summary = string.IsNullOrWhiteSpace(summary) ? null : summary.Trim(); Body = body;
        SourceFingerprint = fingerprint; Provider = "editor"; Status = EditorialTranslationStatus.Manual;
        ReviewedByUserId = editorUserId; ReviewedAtUtc = nowUtc;
    }

    public void MarkReviewed(string editorUserId, DateTimeOffset nowUtc)
    {
        if (string.IsNullOrWhiteSpace(editorUserId)) throw new ArgumentException("An editor is required.", nameof(editorUserId));
        Status = EditorialTranslationStatus.Reviewed; ReviewedByUserId = editorUserId; ReviewedAtUtc = nowUtc;
    }

    private static void Validate(string locale, string title, string? summary, string body, string fingerprint)
    {
        if (locale is not ("en" or "fr")) throw new ArgumentException("Only English and French translations are supported.", nameof(locale));
        if (string.IsNullOrWhiteSpace(title) || title.Trim().Length > TitleMaxLength) throw new ArgumentException("Translation title is required and must be within the maximum length.", nameof(title));
        if (summary?.Length > SummaryMaxLength) throw new ArgumentException("Translation summary is too long.", nameof(summary));
        if (string.IsNullOrWhiteSpace(body) || body.Length > BodyMaxLength) throw new ArgumentException("Translation body is required and must be within the maximum length.", nameof(body));
        if (string.IsNullOrWhiteSpace(fingerprint) || fingerprint.Length != 64) throw new ArgumentException("A SHA-256 source fingerprint is required.", nameof(fingerprint));
    }
}
