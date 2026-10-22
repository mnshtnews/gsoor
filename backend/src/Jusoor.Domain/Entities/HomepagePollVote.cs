using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

public sealed class HomepagePollVote : BaseEntity
{
    public Guid PollId { get; private set; }
    public int OptionIndex { get; private set; }
    public string VoterHash { get; private set; } = null!;
    public DateTimeOffset VotedAtUtc { get; private set; }

    private HomepagePollVote() { }

    public static HomepagePollVote Create(Guid pollId, int optionIndex, string voterHash, int optionCount, DateTimeOffset now)
    {
        if (pollId == Guid.Empty || optionIndex < 0 || optionIndex >= optionCount) throw new ArgumentOutOfRangeException(nameof(optionIndex));
        if (voterHash.Length != 64) throw new ArgumentException("The voter key must be hashed.", nameof(voterHash));
        return new HomepagePollVote { PollId = pollId, OptionIndex = optionIndex, VoterHash = voterHash, VotedAtUtc = now };
    }
}
