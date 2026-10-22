namespace Jusoor.Domain.Entities;

/// <summary>Consent-based email opt-in for public, country-specific crisis alerts.</summary>
public sealed class AlertEmailSubscription
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Email { get; private set; } = string.Empty;
    public string EmailHash { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset ConsentedAtUtc { get; private set; }
    public DateTimeOffset? UnsubscribedAtUtc { get; private set; }

    private AlertEmailSubscription() { }

    public static AlertEmailSubscription Create(string email, string emailHash, DateTimeOffset nowUtc)
        => new() { Email = email, EmailHash = emailHash, ConsentedAtUtc = nowUtc };

    public void Resubscribe(DateTimeOffset nowUtc)
    {
        IsActive = true;
        ConsentedAtUtc = nowUtc;
        UnsubscribedAtUtc = null;
    }
}
