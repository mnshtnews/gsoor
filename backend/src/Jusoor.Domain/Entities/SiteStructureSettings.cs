using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

/// <summary>Singleton, audited public navigation and homepage collection configuration.</summary>
public sealed class SiteStructureSettings : AuditableEntity
{
    public const string SingletonKey = "public";
    public string Key { get; private set; } = SingletonKey;
    public string NavigationJson { get; private set; } = "[]";
    public string HomepageSectionsJson { get; private set; } = "[]";
    public string LeadershipJson { get; private set; } = "{}";
    public string SocialLinksJson { get; private set; } = "[]";
    public Guid? WelcomeVideoAssetId { get; private set; }
    public bool WelcomeIntroEnabled { get; private set; }

    private SiteStructureSettings() { }

    public static SiteStructureSettings Create(string navigationJson, string homepageSectionsJson, string leadershipJson = "{}", string socialLinksJson = "[]", Guid? welcomeVideoAssetId = null, bool welcomeIntroEnabled = false)
    {
        var settings = new SiteStructureSettings();
        settings.Update(navigationJson, homepageSectionsJson, leadershipJson, socialLinksJson, welcomeVideoAssetId, welcomeIntroEnabled);
        return settings;
    }

    public void Update(string navigationJson, string homepageSectionsJson, string leadershipJson = "{}", string socialLinksJson = "[]", Guid? welcomeVideoAssetId = null, bool welcomeIntroEnabled = false)
    {
        if (string.IsNullOrWhiteSpace(navigationJson) || navigationJson.Length > 30_000)
            throw new ArgumentException("Navigation settings must be a bounded JSON document.", nameof(navigationJson));
        if (string.IsNullOrWhiteSpace(homepageSectionsJson) || homepageSectionsJson.Length > 30_000)
            throw new ArgumentException("Homepage settings must be a bounded JSON document.", nameof(homepageSectionsJson));
        if (string.IsNullOrWhiteSpace(leadershipJson) || leadershipJson.Length > 4_000)
            throw new ArgumentException("Leadership settings must be a bounded JSON document.", nameof(leadershipJson));
        if (string.IsNullOrWhiteSpace(socialLinksJson) || socialLinksJson.Length > 8_000)
            throw new ArgumentException("Social links settings must be a bounded JSON document.", nameof(socialLinksJson));
        Key = SingletonKey;
        NavigationJson = navigationJson;
        HomepageSectionsJson = homepageSectionsJson;
        LeadershipJson = leadershipJson;
        SocialLinksJson = socialLinksJson;
        WelcomeVideoAssetId = welcomeVideoAssetId;
        WelcomeIntroEnabled = welcomeIntroEnabled;
    }
}
