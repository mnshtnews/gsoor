using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

/// <summary>A single CMS-managed homepage poll with anonymous, one-per-poll votes.</summary>
public sealed class HomepagePoll : AuditableEntity
{
    public string Question { get; private set; } = null!;
    public List<string> Options { get; private set; } = [];
    public bool IsActive { get; private set; }
    public DateTimeOffset? StartsAtUtc { get; private set; }
    public DateTimeOffset? EndsAtUtc { get; private set; }

    private HomepagePoll() { }

    public static HomepagePoll Create(string question, IEnumerable<string> options, string actor, DateTimeOffset? startsAtUtc, DateTimeOffset? endsAtUtc)
    {
        var poll = new HomepagePoll();
        poll.Update(question, options, startsAtUtc, endsAtUtc);
        poll.IsActive = false;
        return poll;
    }

    public void Update(string question, IEnumerable<string> options, DateTimeOffset? startsAtUtc, DateTimeOffset? endsAtUtc)
    {
        var q = question?.Trim() ?? "";
        var answers = (options ?? []).Select(x => x?.Trim() ?? "").Where(x => x.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        if (q.Length is < 8 or > 240) throw new ArgumentException("يجب أن يتراوح السؤال بين 8 و240 حرفًا.");
        if (answers.Count is < 2 or > 8 || answers.Any(x => x.Length > 120)) throw new ArgumentException("أضف من إجابتين إلى 8 إجابات، بحد أقصى 120 حرفًا لكل إجابة.");
        if (startsAtUtc.HasValue && endsAtUtc.HasValue && endsAtUtc <= startsAtUtc) throw new ArgumentException("تاريخ نهاية الاستبيان يجب أن يأتي بعد تاريخ بدايته.");
        Question = q; Options = answers; StartsAtUtc = startsAtUtc?.ToUniversalTime(); EndsAtUtc = endsAtUtc?.ToUniversalTime();
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
    public bool IsOpen(DateTimeOffset now) => IsActive && (!StartsAtUtc.HasValue || StartsAtUtc <= now) && (!EndsAtUtc.HasValue || EndsAtUtc > now);
}
