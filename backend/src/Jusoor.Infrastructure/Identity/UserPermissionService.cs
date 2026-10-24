using Jusoor.Application.Common.Interfaces;
using Jusoor.Domain.Entities;
using Jusoor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Infrastructure.Identity;

public sealed class UserPermissionService : IUserPermissionService
{
    private readonly ApplicationDbContext _db;
    public UserPermissionService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<string>> GetForUserAsync(string userId, CancellationToken cancellationToken = default)
        => await _db.UserPermissionGrants.AsNoTracking().Where(x => x.UserId == userId)
            .OrderBy(x => x.Permission).Select(x => x.Permission).ToListAsync(cancellationToken);

    public Task<bool> HasAsync(string userId, string permission, CancellationToken cancellationToken = default)
        => _db.UserPermissionGrants.AsNoTracking().AnyAsync(x => x.UserId == userId && x.Permission == permission, cancellationToken);

    public async Task<bool> GrantAsync(string userId, string permission, string grantedByUserId, CancellationToken cancellationToken = default)
    {
        if (!AdministrationPermissions.All.Contains(permission)) return false;
        if (await HasAsync(userId, permission, cancellationToken)) return true;
        var now = DateTimeOffset.UtcNow;
        _db.UserPermissionGrants.Add(UserPermissionGrant.Create(userId, permission, grantedByUserId, now));
        _db.UserPermissionChangeAudits.Add(UserPermissionChangeAudit.Create(grantedByUserId, userId, permission, "Granted", now));
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RevokeAsync(string userId, string permission, string revokedByUserId, CancellationToken cancellationToken = default)
    {
        var grant = await _db.UserPermissionGrants.FirstOrDefaultAsync(x => x.UserId == userId && x.Permission == permission, cancellationToken);
        if (grant is null) return true;
        _db.UserPermissionGrants.Remove(grant);
        _db.UserPermissionChangeAudits.Add(UserPermissionChangeAudit.Create(revokedByUserId, userId, permission, "Revoked", DateTimeOffset.UtcNow));
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
