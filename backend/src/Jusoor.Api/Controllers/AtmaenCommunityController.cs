using System.Text.RegularExpressions;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/atmaen/community")]
public sealed class AtmaenCommunityController(IApplicationDbContext db, ICurrentUserService currentUser, IIdentityService identity) : ControllerBase
{
    private static readonly Regex ContactLike = new(@"(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})|(?:https?://|www\.)|(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly string[] Statuses = ["تم الاطمئنان", "شوهد بخير", "تم التواصل", "بحاجة لمزيد من المعلومات"];

    public sealed record CreatePostRequest(Guid CountryId, Guid CityId, string Status, string Message, bool PublicConsent);
    public sealed record CreateCommentRequest(string Text);
    public sealed record CreateReportRequest(string Reason);
    public sealed record SetVisibilityRequest(bool IsPublished);
    public sealed record ReportReviewDto(Guid ReportId, Guid PostId, string Reason, DateTimeOffset ReportedAtUtc, string AuthorName, string Country, string City, string Status, string Message);
    public sealed record CommunityCommentDto(Guid Id, string AuthorName, string Text, DateTimeOffset CreatedAtUtc);
    public sealed record CommunityPostDto(Guid Id, string AuthorName, Guid CountryId, string Country, Guid CityId, string City, string Status, string Message, DateTimeOffset CreatedAtUtc, int LikeCount, int CommentCount, bool IsLiked, IReadOnlyList<CommunityCommentDto> LatestComments);
    public sealed record CommunityFeedDto(IReadOnlyList<CommunityPostDto> Items, int Page, int PageSize, int TotalCount);
    private sealed record PostRow(AtmaenCommunityPost Post, string Country, string City);

    [HttpGet("posts")]
    [AllowAnonymous]
    public async Task<ActionResult<CommunityFeedDto>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] Guid? countryId = null, [FromQuery] string? status = null, [FromQuery] string? sort = "new", CancellationToken ct = default)
    {
        page = Math.Clamp(page, 1, 10000); pageSize = Math.Clamp(pageSize, 1, 20);
        var query = from p in db.AtmaenCommunityPosts.AsNoTracking().Where(x => x.IsPublished)
                    join country in db.Countries.AsNoTracking() on p.CountryId equals country.Id
                    join city in db.Cities.AsNoTracking() on p.CityId equals city.Id
                    where (!countryId.HasValue || p.CountryId == countryId.Value) && (string.IsNullOrWhiteSpace(status) || p.Status == status)
                    select new { Post = p, Country = country.NameAr, City = city.NameAr };
        var total = await query.CountAsync(ct);
        if (sort == "active") query = query.OrderByDescending(x => db.AtmaenCommunityLikes.Count(l => l.PostId == x.Post.Id) + db.AtmaenCommunityComments.Count(c => c.PostId == x.Post.Id)).ThenByDescending(x => x.Post.CreatedAtUtc);
        else query = query.OrderByDescending(x => x.Post.CreatedAtUtc);
        var selected = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        var rows = selected.Select(x => new PostRow(x.Post, x.Country, x.City)).ToList();
        return Ok(new CommunityFeedDto(await MapRows(rows, ct), page, pageSize, total));
    }

    [HttpGet("posts/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<CommunityPostDto>> Get(Guid id, CancellationToken ct)
    {
        var rows = await (from p in db.AtmaenCommunityPosts.AsNoTracking().Where(x => x.Id == id && x.IsPublished)
                          join country in db.Countries.AsNoTracking() on p.CountryId equals country.Id
                          join city in db.Cities.AsNoTracking() on p.CityId equals city.Id
                          select new PostRow(p, country.NameAr, city.NameAr)).ToListAsync(ct);
        if (rows.Count == 0) return NotFound();
        var dto = (await MapRows(rows, ct, true)).Single();
        return Ok(dto);
    }

    [HttpPost("posts")]
    [Authorize]
    public async Task<ActionResult<CommunityPostDto>> Create(CreatePostRequest input, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        if (!input.PublicConsent) return BadRequest(new { message = "يجب الموافقة صراحةً على نشر التحديث للعامة." });
        if (!Statuses.Contains(input.Status, StringComparer.Ordinal)) return BadRequest(new { message = "اختر حالة صحيحة." });
        if (HasContactLike(input.Message)) return BadRequest(new { message = "لا تنشر أرقام هواتف أو بريدًا إلكترونيًا أو روابط. شارك تحديثًا عامًا فقط." });
        var city = await db.Cities.AsNoTracking().Where(x => x.Id == input.CityId && x.CountryId == input.CountryId).Select(x => new { CountryId = x.CountryId, x.Id, Country = x.Country!.NameAr, City = x.NameAr }).FirstOrDefaultAsync(ct);
        if (city is null) return BadRequest(new { message = "الدولة والمدينة غير متطابقتين." });
        var displayName = await identity.GetDisplayNameAsync(userId);
        if (string.IsNullOrWhiteSpace(displayName)) return Unauthorized();
        AtmaenCommunityPost post;
        try { post = AtmaenCommunityPost.Create(input.CountryId, input.CityId, userId, displayName, input.Status, input.Message, DateTimeOffset.UtcNow); }
        catch (ArgumentException e) { return BadRequest(new { message = e.Message }); }
        db.AtmaenCommunityPosts.Add(post);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = post.Id }, new CommunityPostDto(post.Id, displayName, city.CountryId, city.Country, city.Id, city.City, post.Status, post.Message, post.CreatedAtUtc, 0, 0, false, []));
    }

    [HttpPost("posts/{id:guid}/comments")]
    [Authorize]
    public async Task<IActionResult> Comment(Guid id, CreateCommentRequest input, CancellationToken ct)
    {
        var post = await db.AtmaenCommunityPosts.FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, ct);
        if (post is null) return NotFound();
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        if (HasContactLike(input.Text)) return BadRequest(new { message = "لا تنشر بيانات تواصل أو روابط في التعليقات." });
        var name = await identity.GetDisplayNameAsync(userId);
        if (string.IsNullOrWhiteSpace(name)) return Unauthorized();
        AtmaenCommunityComment comment;
        try { comment = AtmaenCommunityComment.Create(id, userId, name, input.Text, DateTimeOffset.UtcNow); }
        catch (ArgumentException e) { return BadRequest(new { message = e.Message }); }
        db.AtmaenCommunityComments.Add(comment);
        await db.SaveChangesAsync(ct);
        return Created($"/api/v1/atmaen/community/posts/{id}#comment-{comment.Id}", new CommunityCommentDto(comment.Id, name, comment.Text, comment.CreatedAtUtc));
    }

    [HttpPost("posts/{id:guid}/like")]
    [Authorize]
    public async Task<IActionResult> ToggleLike(Guid id, CancellationToken ct)
    {
        var postExists = await db.AtmaenCommunityPosts.AnyAsync(x => x.Id == id && x.IsPublished, ct);
        if (!postExists) return NotFound();
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var existing = await db.AtmaenCommunityLikes.FirstOrDefaultAsync(x => x.PostId == id && x.UserId == userId, ct);
        if (existing is not null) { db.AtmaenCommunityLikes.Remove(existing); await db.SaveChangesAsync(ct); return Ok(new { liked = false, likeCount = await db.AtmaenCommunityLikes.CountAsync(x => x.PostId == id, ct) }); }
        db.AtmaenCommunityLikes.Add(AtmaenCommunityLike.Create(id, userId, DateTimeOffset.UtcNow));
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException) { return Conflict(new { message = "تعذّر تسجيل الإعجاب. حدّث الصفحة وحاول مجددًا." }); }
        return Ok(new { liked = true, likeCount = await db.AtmaenCommunityLikes.CountAsync(x => x.PostId == id, ct) });
    }

    [HttpPost("posts/{id:guid}/reports")]
    [Authorize]
    public async Task<IActionResult> Report(Guid id, CreateReportRequest input, CancellationToken ct)
    {
        if (!await db.AtmaenCommunityPosts.AnyAsync(x => x.Id == id && x.IsPublished, ct)) return NotFound();
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        if (await db.AtmaenCommunityReports.AnyAsync(x => x.PostId == id && x.ReporterUserId == userId, ct)) return Conflict(new { message = "سبق أن أبلغت عن هذا التحديث." });
        AtmaenCommunityReport report;
        try { report = AtmaenCommunityReport.Create(id, userId, input.Reason, DateTimeOffset.UtcNow); }
        catch (ArgumentException e) { return BadRequest(new { message = e.Message }); }
        db.AtmaenCommunityReports.Add(report);
        try { await db.SaveChangesAsync(ct); } catch (DbUpdateException) { return Conflict(new { message = "سبق أن أبلغت عن هذا التحديث." }); }
        return Accepted(new { message = "وصل البلاغ إلى فريق جسور للمراجعة." });
    }

    [HttpGet("reports")]
    [Authorize(Roles = "SeniorEditor,ManagingEditor,EditorInChief,SystemAdmin")]
    public async Task<ActionResult<IReadOnlyList<ReportReviewDto>>> GetReports(CancellationToken ct)
    {
        var rows = await (from report in db.AtmaenCommunityReports.AsNoTracking()
                          join post in db.AtmaenCommunityPosts.AsNoTracking() on report.PostId equals post.Id
                          join country in db.Countries.AsNoTracking() on post.CountryId equals country.Id
                          join city in db.Cities.AsNoTracking() on post.CityId equals city.Id
                          where post.IsPublished
                          orderby report.CreatedAtUtc descending
                          select new ReportReviewDto(report.Id, post.Id, report.Reason, report.CreatedAtUtc, post.AuthorDisplayName, country.NameAr, city.NameAr, post.Status, post.Message)).Take(100).ToListAsync(ct);
        return Ok(rows);
    }

    [HttpPost("posts/{id:guid}/moderation")]
    [Authorize(Roles = "SeniorEditor,ManagingEditor,EditorInChief,SystemAdmin")]
    public async Task<IActionResult> SetVisibility(Guid id, SetVisibilityRequest input, CancellationToken ct)
    {
        var post = await db.AtmaenCommunityPosts.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (post is null) return NotFound();
        post.SetPublished(input.IsPublished, DateTimeOffset.UtcNow);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
    private async Task<IReadOnlyList<CommunityPostDto>> MapRows(IReadOnlyList<PostRow> rows, CancellationToken ct, bool includeAllComments = false)
    {
        if (rows.Count == 0) return [];
        var ids = rows.Select(x => x.Post.Id).ToArray();
        var likes = await db.AtmaenCommunityLikes.AsNoTracking().Where(x => ids.Contains(x.PostId)).GroupBy(x => x.PostId).Select(g => new { Id = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Id, x => x.Count, ct);
        var commentCounts = await db.AtmaenCommunityComments.AsNoTracking().Where(x => ids.Contains(x.PostId)).GroupBy(x => x.PostId).Select(g => new { Id = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Id, x => x.Count, ct);
        var userId = currentUser.UserId;
        var likedIds = string.IsNullOrWhiteSpace(userId) ? new HashSet<Guid>() : await db.AtmaenCommunityLikes.AsNoTracking().Where(x => ids.Contains(x.PostId) && x.UserId == userId).Select(x => x.PostId).ToHashSetAsync(ct);
        var result = new List<CommunityPostDto>(rows.Count);
        foreach (var row in rows)
        {
            var maxComments = includeAllComments ? 20 : 3;
            var comments = await db.AtmaenCommunityComments.AsNoTracking().Where(x => x.PostId == row.Post.Id).OrderByDescending(x => x.CreatedAtUtc).Take(maxComments).ToListAsync(ct);
            var display = comments.Select(x => new CommunityCommentDto(x.Id, x.AuthorDisplayName, x.Text, x.CreatedAtUtc)).ToArray();
            result.Add(new CommunityPostDto(row.Post.Id, row.Post.AuthorDisplayName, row.Post.CountryId, row.Country, row.Post.CityId, row.City, row.Post.Status, row.Post.Message, row.Post.CreatedAtUtc, likes.GetValueOrDefault(row.Post.Id), commentCounts.GetValueOrDefault(row.Post.Id), likedIds.Contains(row.Post.Id), display));
        }
        return result;
    }

    private static bool HasContactLike(string? text) => !string.IsNullOrWhiteSpace(text) && ContactLike.IsMatch(text);
}
