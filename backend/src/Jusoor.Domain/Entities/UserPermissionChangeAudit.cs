using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

/// <summary>Append-only security record for a direct capability grant or revocation.</summary>
public class UserPermissionChangeAudit : BaseEntity
{
    public string ActorUserId { get; private set; } = null!;
    public string TargetUserId { get; private set; } = null!;
    public string Permission { get; private set; } = null!;
    public string Action { get; private set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; private set; }

    private UserPermissionChangeAudit() { }
    public static UserPermissionChangeAudit Create(string actorId, string targetId, string permission, string action, DateTimeOffset nowUtc)
    {
        if (string.IsNullOrWhiteSpace(actorId) || string.IsNullOrWhiteSpace(targetId)) throw new ArgumentException("Audit actor and target are required.");
        if (!AdministrationPermissions.All.Contains(permission) || action is not ("Granted" or "Revoked")) throw new ArgumentException("Invalid permission audit entry.");
        return new UserPermissionChangeAudit { ActorUserId = actorId, TargetUserId = targetId, Permission = permission, Action = action, OccurredAtUtc = nowUtc };
    }
}
