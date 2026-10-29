using System.Text.Json;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Application.Common.Security;
using Jusoor.Domain.Editorial;
using Jusoor.Domain.Enums;
using Jusoor.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/site-structure")]
public sealed class SiteStructureController(IApplicationDbContext context, IEditorialMediaStorage mediaStorage) : ControllerBase
{
    private const string DefaultLogoSlogan = "صوت المصريين في الخارج";
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
            ["fatwas"] = ("فتاوى", "/category?cat=fatwas"),
            ["videos"] = ("فيديو", "/videos"),
        };

    public sealed record NavigationItem(string Key, string Label, string Href, bool IsVisible, int DisplayOrder, string Group);
    public sealed record HomepageSection(string Key, string Title, string DeskSlug, string Layout, bool IsEnabled, bool ShowOnWeb, bool ShowOnMobile, int DisplayOrder);
    public sealed record LeadershipEntry(string Id, string Title, string Name);
    public sealed record LeadershipInput(IReadOnlyList<LeadershipEntry>? Entries, Guid? LogoAssetId = null, string? LogoUrl = null, string? Slogan = null);
    public sealed record SocialLink(string Id, string Name, string Href, string Icon, bool IsVisible);
    public sealed record WelcomeIntro(bool IsEnabled, Guid? AssetId, string? VideoUrl, string? FileName);
    public sealed record SiteStructureDocument(IReadOnlyList<NavigationItem> Navigation, IReadOnlyList<HomepageSection> HomepageSections, LeadershipInput Leadership, IReadOnlyList<SocialLink> SocialLinks, WelcomeIntro WelcomeIntro, DateTimeOffset? LastModifiedAtUtc);
    public sealed record NavigationInput(string Key, string Label, bool IsVisible, int DisplayOrder, string Group);
    public sealed record HomepageSectionInput(string Key, string Title, string DeskSlug, string Layout, bool IsEnabled, bool ShowOnWeb, bool ShowOnMobile, int DisplayOrder);
    public sealed record SaveInput(IReadOnlyList<NavigationInput> Navigation, IReadOnlyList<HomepageSectionInput> HomepageSections, LeadershipInput? Leadership = null, IReadOnlyList<SocialLink>? SocialLinks = null, Guid? WelcomeVideoAssetId = null, bool? WelcomeIntroEnabled = null);

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<SiteStructureDocument>> GetPublic(CancellationToken ct)
        => Ok(await ReadDocument(ct));

    [HttpGet("cms")]
    [Authorize(Policy = AuthorizationPolicies.CanManageSiteStructure)]
    public async Task<ActionResult<SiteStructureDocument>> GetForCms(CancellationToken ct)
        => Ok(await ReadDocument(ct));

    [HttpPut("cms")]
    [Authorize(Policy = AuthorizationPolicies.CanManageSiteStructure)]
    public async Task<ActionResult<SiteStructureDocument>> Save(SaveInput input, CancellationToken ct)
    {
        var validation = Validate(input);
        if (input.Leadership?.LogoAssetId is { } logoAssetId && !await context.EditorialMediaAssets.AnyAsync(x => x.Id == logoAssetId && x.Kind == EditorialMediaKind.Image && x.Status == EditorialMediaStatus.Ready, ct)) return BadRequest(new { message = "اختر صورة شعار جاهزة من مكتبة الوسائط." });
        if (validation is not null) return BadRequest(new { message = validation });

        var settings = await context.SiteStructureSettings.FirstOrDefaultAsync(x => x.Key == SiteStructureSettings.SingletonKey, ct);
        var navigation = input.Navigation.Select(x => new NavigationItem(x.Key, x.Key == "fatwas" ? NavigationCatalog[x.Key].Label : x.Label.Trim(), NavigationCatalog[x.Key].Href, x.IsVisible, x.DisplayOrder, x.Group)).OrderBy(x => x.Group == "primary" ? 0 : 1).ThenBy(x => x.DisplayOrder).ToArray();
        var sections = input.HomepageSections.Select(x => new HomepageSection(x.Key, x.Title.Trim(), x.DeskSlug, x.Layout, x.IsEnabled, x.ShowOnWeb, x.ShowOnMobile, x.DisplayOrder)).OrderBy(x => x.DisplayOrder).ToArray();
        var savedSlogan = settings is null ? null : ReadLeadership(settings.LeadershipJson).Slogan;
        var leadership = NormalizeLeadership(input.Leadership, savedSlogan);
        var socialLinks = input.SocialLinks is not null ? NormalizeSocialLinks(input.SocialLinks) : settings is null ? DefaultSocialLinks() : ReadSocialLinks(settings.SocialLinksJson);
        var introEnabled = input.WelcomeIntroEnabled ?? settings?.WelcomeIntroEnabled ?? false;
        var introVideoId = input.WelcomeVideoAssetId;
        if (introEnabled && introVideoId is null) return BadRequest(new { message = "ارفع فيديو تعريفيًا أو اختر فيديو جاهزًا قبل تفعيل عرضه." });
        if (introVideoId is { } selectedVideoId && !await context.EditorialMediaAssets.AnyAsync(x => x.Id == selectedVideoId && x.Kind == EditorialMediaKind.Video && x.Status == EditorialMediaStatus.Ready, ct)) return BadRequest(new { message = "الفيديو المختار غير جاهز أو ليس ملف فيديو معتمدًا." });
        if (settings is null)
        {
            settings = SiteStructureSettings.Create(JsonSerializer.Serialize(navigation, JsonOptions), JsonSerializer.Serialize(sections, JsonOptions), JsonSerializer.Serialize(leadership, JsonOptions), JsonSerializer.Serialize(socialLinks, JsonOptions), introVideoId, introEnabled);
            context.SiteStructureSettings.Add(settings);
        }
        else
        {
            settings.Update(JsonSerializer.Serialize(navigation, JsonOptions), JsonSerializer.Serialize(sections, JsonOptions), JsonSerializer.Serialize(leadership, JsonOptions), JsonSerializer.Serialize(socialLinks, JsonOptions), introVideoId, introEnabled);
        }

        await context.SaveChangesAsync(ct);
        return Ok(await ToDocumentAsync(navigation, sections, leadership, socialLinks, settings, ct));
    }

    private async Task<SiteStructureDocument> ReadDocument(CancellationToken ct)
    {
        var settings = await context.SiteStructureSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Key == SiteStructureSettings.SingletonKey, ct);
        if (settings is null) return Defaults();
        try
        {
            var navigation = JsonSerializer.Deserialize<NavigationItem[]>(settings.NavigationJson, JsonOptions) ?? Defaults().Navigation.ToArray();
            var sections = JsonSerializer.Deserialize<HomepageSection[]>(settings.HomepageSectionsJson, JsonOptions) ?? [];
            var leadership = ReadLeadership(settings.LeadershipJson);
            var socialLinks = ReadSocialLinks(settings.SocialLinksJson);
            // Hrefs always come from this server-owned catalog; stored text can never create an external or unsafe navigation target.
            navigation = navigation.Where(x => NavigationCatalog.ContainsKey(x.Key) || x.Key == "various").Select(x => x.Key == "various" ? x with { Key = "fatwas", Label = "فتاوى" } : x).Where(x => NavigationCatalog.ContainsKey(x.Key)).Select(x => x with { Label = x.Key == "fatwas" ? NavigationCatalog[x.Key].Label : x.Label, Href = NavigationCatalog[x.Key].Href }).OrderBy(x => x.Group == "primary" ? 0 : 1).ThenBy(x => x.DisplayOrder).ToArray();
            sections = sections.Where(x => EditorialDesk.IsValid(x.DeskSlug))
                .Select(x => x.DeskSlug == "various" || x.DeskSlug == "fatwas" ? x with { Key = "fatwas", DeskSlug = "fatwas", Title = "فتاوى" } : x)
                .OrderBy(x => x.DisplayOrder).ToArray();
            return await ToDocumentAsync(navigation, sections, leadership, socialLinks, settings, ct);
        }
        catch (JsonException) { return Defaults(); }
    }


    private async Task<SiteStructureDocument> ToDocumentAsync(NavigationItem[] navigation, HomepageSection[] sections, LeadershipInput leadership, IReadOnlyList<SocialLink> socialLinks, SiteStructureSettings settings, CancellationToken ct)
    {
        var intro = new WelcomeIntro(false, null, null, null);
        if (settings.WelcomeVideoAssetId is { } assetId)
        {
            var asset = await context.EditorialMediaAssets.AsNoTracking().FirstOrDefaultAsync(x => x.Id == assetId && x.Kind == EditorialMediaKind.Video && x.Status == EditorialMediaStatus.Ready, ct);
            if (asset is not null) intro = new WelcomeIntro(settings.WelcomeIntroEnabled, asset.Id, mediaStorage.GetPublicUrl(asset.ObjectPath), asset.OriginalFileName);
        }
        if (leadership.LogoAssetId is { } logoId)
        {
            var logo = await context.EditorialMediaAssets.AsNoTracking().FirstOrDefaultAsync(x => x.Id == logoId && x.Kind == EditorialMediaKind.Image && x.Status == EditorialMediaStatus.Ready, ct);
            if (logo is not null) leadership = leadership with { LogoUrl = mediaStorage.GetPublicUrl(logo.ObjectPath) };
        }
        return new SiteStructureDocument(navigation, sections, leadership, socialLinks, intro, settings.LastModifiedAtUtc ?? settings.CreatedAtUtc);
    }
    private static SiteStructureDocument Defaults()
    {
        var nav = NavigationCatalog.Select((pair, index) => new NavigationItem(pair.Key, pair.Value.Label, pair.Value.Href, true, index, index <= 6 ? "primary" : "more")).ToArray();
        return new SiteStructureDocument(nav, [], DefaultLeadership(), DefaultSocialLinks(), new WelcomeIntro(false, null, null, null), null);
    }

    private static IReadOnlyList<SocialLink> DefaultSocialLinks() => new[]
    {
        new SocialLink("facebook", "فيسبوك", "https://www.facebook.com/jswr.gosour", "facebook", true),
        new SocialLink("x", "X", "https://x.com/gosour22", "x", true),
        new SocialLink("instagram", "إنستجرام", "https://www.instagram.com/gosour22/", "instagram", true),
        new SocialLink("youtube", "يوتيوب", "", "youtube", false)
    };

    private static IReadOnlyList<SocialLink> NormalizeSocialLinks(IReadOnlyList<SocialLink> links)
        => links.Select(x => new SocialLink(x.Id?.Trim() ?? "", x.Name?.Trim() ?? "", x.Href?.Trim() ?? "", x.Icon?.Trim() ?? "", x.IsVisible)).ToArray();

    private static IReadOnlyList<SocialLink> ReadSocialLinks(string json)
    {
        try { return NormalizeSocialLinks(JsonSerializer.Deserialize<SocialLink[]>(json, JsonOptions) ?? DefaultSocialLinks()); }
        catch (JsonException) { return DefaultSocialLinks(); }
    }
    private static LeadershipInput DefaultLeadership() => new(new[]
    {
        new LeadershipEntry("board-editor", "رئيس مجلس الإدارة ورئيس التحرير", "أحمد سليمان"),
        new LeadershipEntry("executive-editor", "رئيس التحرير التنفيذي", "أشرف جبريل")
    }, Slogan: DefaultLogoSlogan);

    private static LeadershipInput ReadLeadership(string json)
    {
        try
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;
            if (root.TryGetProperty("entries", out _))
                return NormalizeLeadership(JsonSerializer.Deserialize<LeadershipInput>(json, JsonOptions));

            // Backward compatibility for persisted settings from the former fixed fields.
            string ReadLegacy(string property) => root.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
                ? value.GetString() ?? ""
                : "";
            var firstName = ReadLegacy("editorInChief");
            if (string.IsNullOrWhiteSpace(firstName)) firstName = ReadLegacy("boardChairman");
            var executiveName = ReadLegacy("executiveEditor");
            var migrated = DefaultLeadership().Entries!.Select(x => x.Id == "board-editor" ? x with { Name = firstName } : x with { Name = executiveName }).ToArray();
            return NormalizeLeadership(new LeadershipInput(migrated));
        }
        catch (JsonException) { return DefaultLeadership(); }
    }

    private static LeadershipInput NormalizeLeadership(LeadershipInput? leadership, string? fallbackSlogan = null)
    {
        if (leadership?.Entries is not { } entries) return DefaultLeadership();
        var slogan = leadership.Slogan?.Trim();
        if (string.IsNullOrWhiteSpace(slogan)) slogan = string.IsNullOrWhiteSpace(fallbackSlogan) ? DefaultLogoSlogan : fallbackSlogan.Trim();
        return new LeadershipInput(entries.Select(x => new LeadershipEntry(x.Id?.Trim() ?? "", x.Title?.Trim() ?? "", x.Name?.Trim() ?? "")).ToArray(), leadership.LogoAssetId, Slogan: slogan);
    }

    private static string? Validate(SaveInput input)
    {
        if (input.Navigation is null || input.HomepageSections is null) return "أرسل إعدادات التنقل وأقسام الرئيسية.";
        var leadership = input.Leadership;
        if (leadership is null || leadership.Entries is not { } leaders || leaders.Count is < 2 or > 10) return "أضف الحقلين الأساسيين، ويمكن إدارة حتى 8 حقول إضافية.";
        if (leaders.Select(x => x.Id).Distinct(StringComparer.Ordinal).Count() != leaders.Count) return "معرّفات حقول القيادة يجب أن تكون فريدة.";
        var slogan = leadership.Slogan;
        if (slogan is not null && (string.IsNullOrWhiteSpace(slogan) || slogan.Trim().Length > 80)) return "اكتب عبارة تعريفية للشعار لا تتجاوز 80 حرفًا.";
        if (leaders[0].Id != "board-editor" || leaders[0].Title != "رئيس مجلس الإدارة ورئيس التحرير" || leaders[1].Id != "executive-editor" || leaders[1].Title != "رئيس التحرير التنفيذي")
            return "الحقلان الأساسيان للقيادة لا يمكن حذفهما أو تغيير مسماهما.";
        if (leaders.Any(x => string.IsNullOrWhiteSpace(x.Id) || x.Id.Length > 80 || string.IsNullOrWhiteSpace(x.Title) || x.Title.Trim().Length > 80 || x.Name?.Trim().Length > 100))
            return "تحقق من مسميات وأسماء الحقول (المسمى حتى 80 حرفًا والاسم حتى 100 حرف).";
        if (input.SocialLinks is { } links)
        {
            if (links.Count > 12 || links.Select(x => x.Id).Distinct(StringComparer.Ordinal).Count() != links.Count)
                return "لا يمكن تكرار منصة التواصل أو تجاوز 12 منصة.";
            foreach (var link in links)
            {
                if (string.IsNullOrWhiteSpace(link.Id) || link.Id.Length > 40 || !System.Text.RegularExpressions.Regex.IsMatch(link.Id, "^[a-z0-9-]+$") ||
                    string.IsNullOrWhiteSpace(link.Name) || link.Name.Trim().Length > 60 || link.Icon is not ("facebook" or "x" or "instagram" or "youtube" or "globe" or "tiktok" or "linkedin"))
                    return "تحقق من اسم المنصة ومعرّفها وأيقونتها.";
                if (link.IsVisible && (!Uri.TryCreate(link.Href, UriKind.Absolute, out var socialUri) || socialUri.Scheme != Uri.UriSchemeHttps || !string.IsNullOrEmpty(socialUri.UserInfo)))
                    return "أدخل رابط HTTPS صحيحًا لكل منصة ظاهرة.";
                if (link.Href?.Length > 500) return "رابط المنصة طويل أكثر من الحد المسموح.";
            }
        }        if (input.Navigation.Count != NavigationCatalog.Count || input.Navigation.Select(x => x.Key).Distinct(StringComparer.Ordinal).Count() != NavigationCatalog.Count || input.Navigation.Any(x => !NavigationCatalog.ContainsKey(x.Key)))
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
