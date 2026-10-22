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

    private SiteStructureSettings() { }

    public static SiteStructureSettings Create(string navigationJson, string homepageSectionsJson, string leadershipJson = "{}")
    {
        var settings = new SiteStructureSettings();
        settings.Update(navigationJson, homepageSectionsJson, leadershipJson);
        return settings;
    }

    public void Update(string navigationJson, string homepageSectionsJson, string leadershipJson = "{}")
    {
        if (string.IsNullOrWhiteSpace(navigationJson) || navigationJson.Length > 30_000)
            throw new ArgumentException("Navigation settings must be a bounded JSON document.", nameof(navigationJson));
        if (string.IsNullOrWhiteSpace(homepageSectionsJson) || homepageSectionsJson.Length > 30_000)
            throw new ArgumentException("Homepage settings must be a bounded JSON document.", nameof(homepageSectionsJson));
        if (string.IsNullOrWhiteSpace(leadershipJson) || leadershipJson.Length > 4_000)
            throw new ArgumentException("Leadership settings must be a bounded JSON document.", nameof(leadershipJson));
        Key = SingletonKey;
        NavigationJson = navigationJson;
        HomepageSectionsJson = homepageSectionsJson;
        LeadershipJson = leadershipJson;
    }
}
