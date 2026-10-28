using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

/// <summary>Public, consent-based reassurance update. Deliberately has no link to a private Atmaen Case and stores no person/contact details.</summary>
public sealed class AtmaenCommunityPost : AuditableEntity
{
    public Guid CountryId { get; private set; }
    public Guid CityId { get; private set; }
    public string? AuthorUserId { get; private set; }
    public string AuthorDisplayName { get; private set; } = null!;
    public string Status { get; private set; } = null!;
    public string Message { get; private set; } = null!;
    public bool IsPublished { get; private set; }

    private AtmaenCommunityPost() { }

    public void SetPublished(bool published, DateTimeOffset nowUtc) { IsPublished = published; LastModifiedAtUtc = nowUtc; }

    public static AtmaenCommunityPost Create(Guid countryId, Guid cityId, string? authorUserId, string authorDisplayName, string status, string message, DateTimeOffset nowUtc)
    {
        if (countryId == Guid.Empty || cityId == Guid.Empty) throw new ArgumentException("اختر الدولة والمدينة.");
        if (string.IsNullOrWhiteSpace(authorDisplayName)) throw new ArgumentException("اكتب اسمًا صالحًا.");
        if (status is not ("تم الاطمئنان" or "شوهد بخير" or "تم التواصل" or "بحاجة لمزيد من المعلومات")) throw new ArgumentException("اختر حالة صحيحة.");
        var text = message?.Trim() ?? "";
        if (text.Length is < 10 or > 1000) throw new ArgumentException("يجب أن يتراوح التحديث بين 10 و1000 حرف.");
        return new AtmaenCommunityPost { CountryId = countryId, CityId = cityId, AuthorUserId = authorUserId, AuthorDisplayName = authorDisplayName.Trim(), Status = status, Message = text, IsPublished = true, CreatedAtUtc = nowUtc, LastModifiedAtUtc = nowUtc };
    }
}
