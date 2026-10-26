using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

public sealed class AtmaenCommunityReport : BaseEntity
{
    public Guid PostId { get; private set; }
    public string ReporterUserId { get; private set; } = null!;
    public string Reason { get; private set; } = null!;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    private AtmaenCommunityReport() { }
    public static AtmaenCommunityReport Create(Guid postId, string userId, string reason, DateTimeOffset nowUtc)
    {
        var value = reason?.Trim() ?? "";
        if (value.Length is < 3 or > 300) throw new ArgumentException("اكتب سببًا مختصرًا للإبلاغ.");
        return new() { PostId = postId, ReporterUserId = userId, Reason = value, CreatedAtUtc = nowUtc };
    }
}
