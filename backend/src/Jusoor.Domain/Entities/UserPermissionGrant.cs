using Jusoor.Domain.Common;

namespace Jusoor.Domain.Entities;

/// <summary>A directly assigned, auditable CMS capability for one account.</summary>
public class UserPermissionGrant : BaseEntity
{
    public string UserId { get; private set; } = null!;
    public string Permission { get; private set; } = null!;
    public string GrantedByUserId { get; private set; } = null!;
    public DateTimeOffset GrantedAtUtc { get; private set; }

    private UserPermissionGrant() { }

    public static UserPermissionGrant Create(string userId, string permission, string grantedByUserId, DateTimeOffset nowUtc)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(grantedByUserId))
            throw new ArgumentException("A permission grant must identify its recipient and grantor.");
        if (!AdministrationPermissions.All.Contains(permission))
            throw new ArgumentException("Unknown administration permission.", nameof(permission));
        return new UserPermissionGrant { UserId = userId, Permission = permission, GrantedByUserId = grantedByUserId, GrantedAtUtc = nowUtc };
    }
}

/// <summary>Server-owned allowlist. New capabilities must be wired to server checks before being exposed here.</summary>
public static class AdministrationPermissions
{
    public const string ViewUsers = "Users.View";
    public const string CreateUsers = "Users.Create";
    public const string ManageRoles = "Users.ManageRoles";
    public static readonly IReadOnlyList<string> All = [ViewUsers, CreateUsers, ManageRoles];
    public static readonly IReadOnlyDictionary<string, string> Labels = new Dictionary<string, string>
    {
        [ViewUsers] = "عرض المستخدمين والصلاحيات",
        [CreateUsers] = "إنشاء حسابات المستخدمين",
        [ManageRoles] = "منح وسحب أدوار المستخدمين"
    };
}
