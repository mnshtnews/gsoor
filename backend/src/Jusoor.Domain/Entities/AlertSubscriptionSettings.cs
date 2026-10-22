namespace Jusoor.Domain.Entities;

/// <summary>Singleton switch controlling whether visitors may opt in to crisis email alerts.</summary>
public sealed class AlertSubscriptionSettings
{
    public const string SingletonKey = "global";
    public string Key { get; private set; } = SingletonKey;
    public bool IsEnabled { get; private set; } = true;
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    private AlertSubscriptionSettings() { }

    public static AlertSubscriptionSettings Create(bool isEnabled, DateTimeOffset nowUtc)
        => new() { IsEnabled = isEnabled, UpdatedAtUtc = nowUtc };

    public void SetEnabled(bool isEnabled, DateTimeOffset nowUtc)
    {
        IsEnabled = isEnabled;
        UpdatedAtUtc = nowUtc;
    }
}
