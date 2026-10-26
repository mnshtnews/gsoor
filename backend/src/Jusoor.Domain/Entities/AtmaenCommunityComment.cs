using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

public sealed class AtmaenCommunityComment : BaseEntity
{
    public Guid PostId { get; private set; }
    public string AuthorUserId { get; private set; } = null!;
    public string AuthorDisplayName { get; private set; } = null!;
    public string Text { get; private set; } = null!;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    private AtmaenCommunityComment() { }
    public static AtmaenCommunityComment Create(Guid postId, string userId, string displayName, string text, DateTimeOffset nowUtc)
    {
        var value = text?.Trim() ?? "";
        if (value.Length is < 1 or > 500) throw new ArgumentException("يجب ألا يزيد التعليق على 500 حرف.");
        return new() { PostId = postId, AuthorUserId = userId, AuthorDisplayName = displayName, Text = value, CreatedAtUtc = nowUtc };
    }
}
