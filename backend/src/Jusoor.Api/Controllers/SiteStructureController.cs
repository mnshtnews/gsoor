using System.Text.Json;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Application.Common.Security;
using Jusoor.Domain.Editorial;
using Jusoor.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/site-structure")]
public sealed class SiteStructureController(IApplicationDbContext context) : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly IReadOnlyDictionary<string, (string Label, string Href)> NavigationCatalog =
        new Dictionary<string, (string, string)>(StringComparer.Ordinal)
        {
            ["home"] = ("الرئيسية", "/"),
            ["mughtarib"] = ("أخبار المغتربين", "/category?cat=mughtarib"),
            ["success"] = ("قصة نجاح", "/category?cat=success"),
            ["egypt"] = ("أخبار مصر", "/category?cat=egypt"),
            ["opportunities"] = ("فرص استثمارية", "/category?cat=opportunities"),
            ["official"] = ("مع مسئول", "/category?cat=official"),
            ["red"] = ("خط أحمر", "/category?cat=red"),
            ["map"] = ("خريطة المهجر", "/diaspora-map"),
            ["events"] = ("فعاليات", "/category?cat=events"),
            ["lamma"] = ("اللمة الحلوة", "/category?cat=lamma"),
            ["secondgen"] = ("الجيل الثاني", "/category?cat=secondgen"),
            ["sports"] = ("رياضة", "/category?cat=sports"),
            ["arts"] = ("فنون", "/category?cat=arts"),
            ["articles"] = ("مقالات رأي", "/category?cat=articles"),
            ["fatwas"] = ("الفتاوى", "/category?cat=fatwas"),
            ["videos"] = ("فيديو", "/videos"),
        };

    public sealed record NavigationItem(string Key, string Label, string Href, bool IsVisible, int DisplayOrder, string Group);
    public sealed record HomepageSection(string Key, string Title, string DeskSlug, string Layout, bool IsEnabled, bool ShowOnWeb, bool ShowOnMobile, int DisplayOrder);
    public sealed record LeadershipInput(string BoardChairman, string EditorInChief, string ExecutiveEditor);
    public sealed record SiteStructureDocument(IReadOnlyList<NavigationItem> Navigation, IReadOnlyList<HomepageSection> HomepageSections, LeadershipInput Leadership, DateTimeOffset? LastModifiedAtUtc);
    public sealed record NavigationInput(string Key, string Label, bool IsVisible, int DisplayOrder, string Group);
    public sealed record HomepageSectionInput(string Key, string Title, string DeskSlug, string Layout, bool IsEnabled, bool ShowOnWeb, bool ShowOnMobile, int DisplayOrder);
    public sealed record SaveInput(IReadOnlyList<NavigationInput> Navigation, IReadOnlyList<HomepageSectionInput> HomepageSections, LeadershipInput? Leadership = null);

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<SiteStructureDocument>> GetPublic(CancellationToken ct)
        => Ok(await ReadDocument(ct));

    [HttpGet("cms")]
    [Authorize(Policy = AuthorizationPolicies.CanManageEditorialTaxonomy)]
    public async Task<ActionResult<SiteStructureDocument>> GetForCms(CancellationToken ct)
        => Ok(await ReadDocument(ct));

    [HttpPut("cms")]
    [Authorize(Policy = AuthorizationPolicies.CanManageEditorialTaxonomy)]
    public async Task<ActionResult<SiteStructureDocument>> Save(SaveInput input, CancellationToken ct)
    {
        var validation = Validate(input);
        if (validation is not null) return BadRequest(new { message = validation });

        var navigation = input.Navigation.Select(x => new NavigationItem(x.Key, x.Label.Trim(), NavigationCatalog[x.Key].Href, x.IsVisible, x.DisplayOrder, x.Group)).OrderBy(x => x.Group == "primary" ? 0 : 1).ThenBy(x => x.DisplayOrder).ToArray();
        var sections = input.HomepageSections.Select(x => new HomepageSection(x.Key, x.Title.Trim(), x.DeskSlug, x.Layout, x.IsEnabled, x.ShowOnWeb, x.ShowOnMobile, x.DisplayOrder)).OrderBy(x => x.DisplayOrder).ToArray();
        var leadership = input.Leadership ?? Defaults().Leadership;
        var settings = await context.SiteStructureSettings.FirstOrDefaultAsync(x => x.Key == SiteStructureSettings.SingletonKey, ct);
        if (settings is null)
        {
            settings = SiteStructureSettings.Create(JsonSerializer.Serialize(navigation, JsonOptions), JsonSerializer.Serialize(sections, JsonOptions), JsonSerializer.Serialize(leadership, JsonOptions));
            context.SiteStructureSettings.Add(settings);
        }
        else
        {
            settings.Update(JsonSerializer.Serialize(navigation, JsonOptions), JsonSerializer.Serialize(sections, JsonOptions), JsonSerializer.Serialize(leadership, JsonOptions));
        }

        await context.SaveChangesAsync(ct);
        return Ok(new SiteStructureDocument(navigation, sections, leadership, settings.LastModifiedAtUtc ?? settings.CreatedAtUtc));
    }

    private async Task<SiteStructureDocument> ReadDocument(CancellationToken ct)
    {
        var settings = await context.SiteStructureSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Key == SiteStructureSettings.SingletonKey, ct);
        if (settings is null) return Defaults();
        try
        {
            var navigation = JsonSerializer.Deserialize<NavigationItem[]>(settings.NavigationJson, JsonOptions) ?? Defaults().Navigation.ToArray();
            var sections = JsonSerializer.Deserialize<HomepageSection[]>(settings.HomepageSectionsJson, JsonOptions) ?? [];
            var leadership = JsonSerializer.Deserialize<LeadershipInput>(settings.LeadershipJson, JsonOptions) ?? Defaults().Leadership;
            // Hrefs always come from this server-owned catalog; stored text can never create an external or unsafe navigation target.
            navigation = navigation.Where(x => NavigationCatalog.ContainsKey(x.Key) || x.Key == "various").Select(x => x.Key == "various" ? x with { Key = "fatwas", Label = "الفتاوى" } : x).Where(x => NavigationCatalog.ContainsKey(x.Key)).Select(x => x with { Href = NavigationCatalog[x.Key].Href }).OrderBy(x => x.Group == "primary" ? 0 : 1).ThenBy(x => x.DisplayOrder).ToArray();
            sections = sections.Where(x => EditorialDesk.IsValid(x.DeskSlug))
                .Select(x => x.DeskSlug == "various" ? x with { Key = "fatwas", DeskSlug = "fatwas", Title = "الفتاوى" } : x)
                .OrderBy(x => x.DisplayOrder).ToArray();
            return new SiteStructureDocument(navigation, sections, leadership, settings.LastModifiedAtUtc ?? settings.CreatedAtUtc);
        }
        catch (JsonException) { return Defaults(); }
    }

    private static SiteStructureDocument Defaults()
    {
        var nav = NavigationCatalog.Select((pair, index) => new NavigationItem(pair.Key, pair.Value.Label, pair.Value.Href, true, index, index <= 6 ? "primary" : "more")).ToArray();
        return new SiteStructureDocument(nav, [], new LeadershipInput("", "أحمد سليمان", "أشرف جبريل"), null);
    }

    private static string? Validate(SaveInput input)
    {
        if (input.Navigation is null || input.HomepageSections is null) return "أرسل إعدادات التنقل وأقسام الرئيسية.";
        if (input.Leadership is { } leadership && new[] { leadership.BoardChairman, leadership.EditorInChief, leadership.ExecutiveEditor }.Any(name => name?.Trim().Length > 100)) return "يجب ألا يتجاوز كل اسم 100 حرف.";
        if (input.Navigation.Count != NavigationCatalog.Count || input.Navigation.Select(x => x.Key).Distinct(StringComparer.Ordinal).Count() != NavigationCatalog.Count || input.Navigation.Any(x => !NavigationCatalog.ContainsKey(x.Key)))
            return "يجب أن تحتوي القائمة على روابط جسور المعتمدة مرة واحدة لكل رابط.";
        if (input.Navigation.Any(x => string.IsNullOrWhiteSpace(x.Label) || x.Label.Trim().Length > 80 || x.DisplayOrder < 0 || x.Group is not ("primary" or "more")))
            return "تحقق من أسماء الروابط وترتيبها ومجموعة العرض.";
        if (input.Navigation.Single(x => x.Key == "home") is not { IsVisible: true, Group: "primary" }) return "يجب إبقاء رابط الرئيسية ظاهرًا في الشريط الرئيسي.";
        foreach (var group in new[] { "primary", "more" })
        {
            var orders = input.Navigation.Where(x => x.Group == group).Select(x => x.DisplayOrder).Order().ToArray();
            if (!orders.SequenceEqual(Enumerable.Range(0, orders.Length))) return "رتّب روابط كل مجموعة ترتيبًا متتابعًا دون تكرار.";
        }
        if (input.HomepageSections.Count > EditorialDesk.Catalog.Count || input.HomepageSections.Select(x => x.Key).Distinct(StringComparer.Ordinal).Count() != input.HomepageSections.Count)
            return "لا يمكن تكرار القسم أو تجاوز الحد المسموح.";
        var sectionOrders = input.HomepageSections.Select(x => x.DisplayOrder).Order().ToArray();
        if (!sectionOrders.SequenceEqual(Enumerable.Range(0, sectionOrders.Length))) return "رتّب أقسام الرئيسية ترتيبًا متتابعًا دون تكرار.";
        foreach (var section in input.HomepageSections)
        {
            if (!EditorialDesk.IsValid(section.DeskSlug) || section.Key != section.DeskSlug) return "اختر قسمًا تحريريًا معتمدًا.";
            if (string.IsNullOrWhiteSpace(section.Title) || section.Title.Trim().Length > 80) return "عنوان القسم مطلوب وبحد أقصى 80 حرفًا.";
            if (section.Layout is not ("cards" or "lead" or "columns")) return "اختر نمط عرض معتمدًا.";
            if (section.DisplayOrder < 0 || (!section.ShowOnWeb && !section.ShowOnMobile)) return "يجب إظهار القسم على الويب أو الموبايل على الأقل.";
        }
        return null;
    }
}
