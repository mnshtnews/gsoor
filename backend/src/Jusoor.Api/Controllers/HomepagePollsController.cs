using System.Security.Cryptography;
using System.Text;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Application.Common.Security;
using Jusoor.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/homepage-polls")]
public sealed class HomepagePollsController(IApplicationDbContext context, ICurrentUserService currentUser) : ControllerBase
{
    public sealed record PollInput(string Question, string[] Options, bool IsActive, DateTimeOffset? StartsAtUtc, DateTimeOffset? EndsAtUtc);
    public sealed record VoteInput(string VoterKey, int OptionIndex);
    public sealed record PollOption(string Text, int Votes);
    public sealed record PollDto(Guid Id, string Question, IReadOnlyList<PollOption> Options, bool IsActive, bool IsOpen, DateTimeOffset? StartsAtUtc, DateTimeOffset? EndsAtUtc, int TotalVotes);
    public sealed record PollAdminDto(Guid Id, string Question, IReadOnlyList<string> Options, bool IsActive, DateTimeOffset? StartsAtUtc, DateTimeOffset? EndsAtUtc, int TotalVotes);

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult<PollDto>> GetActive(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var poll = await context.HomepagePolls.AsNoTracking().Where(x => x.IsActive).OrderByDescending(x => x.CreatedAtUtc).FirstOrDefaultAsync(ct);
        if (poll is null || !poll.IsOpen(now)) return NotFound();
        return Ok(await ToPublic(poll, true, ct));
    }

    [HttpPost("{id:guid}/vote")]
    [AllowAnonymous]
    public async Task<IActionResult> Vote(Guid id, VoteInput input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.VoterKey) || input.VoterKey.Length < 24 || input.VoterKey.Length > 128) return BadRequest(new { message = "تعذّر التحقق من التصويت." });
        var poll = await context.HomepagePolls.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (poll is null || !poll.IsOpen(DateTimeOffset.UtcNow)) return Conflict(new { message = "انتهى هذا الاستبيان أو لم يبدأ بعد." });
        var key = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(id.ToString("N") + ":" + input.VoterKey)));
        if (await context.HomepagePollVotes.AnyAsync(x => x.PollId == id && x.VoterHash == key, ct)) return Conflict(new { message = "تم تسجيل مشاركتك في هذا الاستبيان." });
        try
        {
            context.HomepagePollVotes.Add(HomepagePollVote.Create(id, input.OptionIndex, key, poll.Options.Count, DateTimeOffset.UtcNow));
            await context.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "تم تسجيل مشاركتك في هذا الاستبيان." });
        }
        return Ok(await ToPublic(poll, true, ct));
    }

    [HttpGet("cms")]
    [Authorize(Policy = AuthorizationPolicies.CanManageEditorialTaxonomy)]
    public async Task<ActionResult<IReadOnlyList<PollAdminDto>>> List(CancellationToken ct)
    {
        var polls = await context.HomepagePolls.AsNoTracking().OrderByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
        var counts = await context.HomepagePollVotes.AsNoTracking().GroupBy(x => x.PollId).Select(g => new { PollId = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.PollId, x => x.Count, ct);
        return Ok(polls.Select(x => new PollAdminDto(x.Id, x.Question, x.Options, x.IsActive, x.StartsAtUtc, x.EndsAtUtc, counts.GetValueOrDefault(x.Id))));
    }

    [HttpPost("cms")]
    [Authorize(Policy = AuthorizationPolicies.CanManageEditorialTaxonomy)]
    public async Task<ActionResult<PollAdminDto>> Create(PollInput input, CancellationToken ct)
    {
        if (currentUser.UserId is not { } actor) return Unauthorized();
        HomepagePoll poll;
        try { poll = HomepagePoll.Create(input.Question, input.Options, actor, input.StartsAtUtc, input.EndsAtUtc); }
        catch (ArgumentException e) { return BadRequest(new { message = e.Message }); }
        if (input.IsActive) poll.Activate();
        if (input.IsActive) await context.HomepagePolls.Where(x => x.IsActive).ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsActive, false), ct);
        context.HomepagePolls.Add(poll);
        await context.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new PollAdminDto(poll.Id, poll.Question, poll.Options, poll.IsActive, poll.StartsAtUtc, poll.EndsAtUtc, 0));
    }

    [HttpPut("cms/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CanManageEditorialTaxonomy)]
    public async Task<ActionResult<PollAdminDto>> Update(Guid id, PollInput input, CancellationToken ct)
    {
        var poll = await context.HomepagePolls.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (poll is null) return NotFound();
        try { poll.Update(input.Question, input.Options, input.StartsAtUtc, input.EndsAtUtc); }
        catch (ArgumentException e) { return BadRequest(new { message = e.Message }); }
        if (input.IsActive)
        {
            await context.HomepagePolls.Where(x => x.IsActive && x.Id != id).ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsActive, false), ct);
            poll.Activate();
        }
        else poll.Deactivate();
        await context.SaveChangesAsync(ct);
        var total = await context.HomepagePollVotes.CountAsync(x => x.PollId == id, ct);
        return Ok(new PollAdminDto(poll.Id, poll.Question, poll.Options, poll.IsActive, poll.StartsAtUtc, poll.EndsAtUtc, total));
    }

    [HttpDelete("cms/{id:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CanManageEditorialTaxonomy)]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        var poll = await context.HomepagePolls.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (poll is null) return NotFound();
        poll.Deactivate();
        await context.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<PollDto> ToPublic(HomepagePoll poll, bool includeResults, CancellationToken ct)
    {
        var counts = includeResults
            ? await context.HomepagePollVotes.AsNoTracking().Where(x => x.PollId == poll.Id).GroupBy(x => x.OptionIndex).Select(g => new { Index = g.Key, Votes = g.Count() }).ToDictionaryAsync(x => x.Index, x => x.Votes, ct)
            : new Dictionary<int, int>();
        var options = poll.Options.Select((text, index) => new PollOption(text, counts.GetValueOrDefault(index))).ToArray();
        return new PollDto(poll.Id, poll.Question, options, poll.IsActive, poll.IsOpen(DateTimeOffset.UtcNow), poll.StartsAtUtc, poll.EndsAtUtc, options.Sum(x => x.Votes));
    }
}
