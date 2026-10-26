using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

public sealed class AtmaenCommunityLike : BaseEntity
{
    public Guid PostId { get; private set; }
    public string UserId { get; private set; } = null!;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    private AtmaenCommunityLike() { }
    public static AtmaenCommunityLike Create(Guid postId, string userId, DateTimeOffset nowUtc) => new() { PostId = postId, UserId = userId, CreatedAtUtc = nowUtc };
}
