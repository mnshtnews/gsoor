namespace Jusoor.Application.Common.Interfaces;

/// <summary>Reads and changes explicit per-user administration capabilities.</summary>
public interface IUserPermissionService
{
    Task<IReadOnlyList<string>> GetForUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> HasAsync(string userId, string permission, CancellationToken cancellationToken = default);
    Task<bool> GrantAsync(string userId, string permission, string grantedByUserId, CancellationToken cancellationToken = default);
    Task<bool> RevokeAsync(string userId, string permission, string revokedByUserId, CancellationToken cancellationToken = default);
}
