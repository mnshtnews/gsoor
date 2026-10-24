using System.ComponentModel.DataAnnotations;
using Jusoor.Application.Administration;
using Jusoor.Application.Common.Interfaces;
using Jusoor.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jusoor.Api.Controllers;

/// <summary>Newsroom users, roles, and direct per-user CMS capability grants.</summary>
[ApiController]
[Route("api/v1/admin/users")]
[Authorize]
public class RoleAssignmentsController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly ICurrentUserService _currentUser;
    private readonly IIdentityService _identity;
    private readonly IUserPermissionService _permissions;

    public RoleAssignmentsController(ISender mediator, ICurrentUserService currentUser, IIdentityService identity, IUserPermissionService permissions)
    {
        _mediator = mediator;
        _currentUser = currentUser;
        _identity = identity;
        _permissions = permissions;
    }

    public record GrantRoleRequest(string Role);
    public record GrantPermissionRequest(string Permission);
    public sealed record CreateNewsroomUserRequest(
        [Required, EmailAddress, MaxLength(256)] string Email,
        [Required, MinLength(12), MaxLength(128)] string Password,
        [Required, MaxLength(100)] string DisplayName,
        [Required, MaxLength(64)] string Role);

    [HttpPost]
    public async Task<IActionResult> CreateNewsroomUser(CreateNewsroomUserRequest request, CancellationToken cancellationToken)
    {
        if (!await HasAsync(AdministrationPermissions.CreateUsers, cancellationToken)) return Forbid();
        if (string.IsNullOrWhiteSpace(request.DisplayName) || !Jusoor.Domain.Enums.NewsroomRole.All.Contains(request.Role) || request.Role == Jusoor.Domain.Enums.NewsroomRole.SystemAdmin)
            return BadRequest(new { message = "تحقق من الاسم واختر دورًا تحريريًا معتمدًا." });
        var created = await _identity.CreateUserAsync(request.Email.Trim(), request.Password, request.DisplayName.Trim());
        if (!created.Succeeded) return Conflict(new { message = "تعذر إنشاء الحساب.", errors = created.Errors });
        if (created.UserId is null) return StatusCode(StatusCodes.Status500InternalServerError);
        var actorId = _currentUser.UserId ?? string.Empty;
        // Creating an account includes assigning its initial, non-admin role.
        var actorPermissions = (await _permissions.GetForUserAsync(actorId, cancellationToken)).Append(AdministrationPermissions.ManageRoles).Distinct().ToArray();
        var grant = await _mediator.Send(new GrantRoleCommand(created.UserId, request.Role, actorId, _currentUser.Roles, actorPermissions), cancellationToken);
        if (grant.Outcome is not (RoleChangeOutcome.Success or RoleChangeOutcome.Unchanged))
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "أُنشئ الحساب لكن تعذّر إسناد الدور. ابحث عن الحساب وأسنِد الدور يدويًا.", userId = created.UserId });
        return CreatedAtAction(nameof(List), new { page = 1, pageSize = 20 }, grant.User);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search, [FromQuery] int page, [FromQuery] int pageSize, CancellationToken cancellationToken)
    {
        var actorId = _currentUser.UserId;
        var actorPermissions = actorId is null ? Array.Empty<string>() : await _permissions.GetForUserAsync(actorId, cancellationToken);
        var result = await _mediator.Send(new ListNewsroomUsersQuery(search, page == 0 ? 1 : page, pageSize == 0 ? 20 : pageSize, _currentUser.Roles, actorPermissions), cancellationToken);
        if (result is null) return Forbid();
        var items = new List<object>(result.Items.Count);
        foreach (var user in result.Items)
            items.Add(new { user.Id, user.Email, user.DisplayName, user.Roles, permissions = await _permissions.GetForUserAsync(user.Id, cancellationToken) });
        return Ok(new { items, result.Page, result.PageSize, result.TotalCount, result.TotalPages });
    }

    [HttpPost("{userId}/roles")]
    public async Task<IActionResult> Grant(string userId, GrantRoleRequest request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not { } actorId) return Unauthorized();
        var permissions = await _permissions.GetForUserAsync(actorId, cancellationToken);
        var result = await _mediator.Send(new GrantRoleCommand(userId, request.Role ?? string.Empty, actorId, _currentUser.Roles, permissions), cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("{userId}/roles/{role}")]
    public async Task<IActionResult> Revoke(string userId, string role, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not { } actorId) return Unauthorized();
        var permissions = await _permissions.GetForUserAsync(actorId, cancellationToken);
        var result = await _mediator.Send(new RevokeRoleCommand(userId, role, actorId, _currentUser.Roles, permissions), cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("current-permissions")]
    public async Task<IActionResult> CurrentPermissions(CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not { } userId) return Unauthorized();
        return Ok(new { permissions = await _permissions.GetForUserAsync(userId, cancellationToken) });
    }

    [HttpGet("{userId}/permissions")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetPermissions(string userId, CancellationToken cancellationToken)
    {
        if (await _identity.FindUserAsync(userId) is null) return NotFound();
        return Ok(new { available = AdministrationPermissions.All.Select(key => new { key, label = AdministrationPermissions.Labels[key] }), granted = await _permissions.GetForUserAsync(userId, cancellationToken) });
    }

    [HttpPost("{userId}/permissions")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GrantPermission(string userId, GrantPermissionRequest request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not { } actorId) return Unauthorized();
        if (!AdministrationPermissions.All.Contains(request.Permission)) return BadRequest(new { message = "الصلاحية غير معروفة." });
        if (await _identity.FindUserAsync(userId) is null) return NotFound();
        await _permissions.GrantAsync(userId, request.Permission, actorId, cancellationToken);
        return Ok(new { granted = await _permissions.GetForUserAsync(userId, cancellationToken) });
    }

    [HttpDelete("{userId}/permissions/{permission}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> RevokePermission(string userId, string permission, CancellationToken cancellationToken)
    {
        if (!AdministrationPermissions.All.Contains(permission)) return BadRequest(new { message = "الصلاحية غير معروفة." });
        if (await _identity.FindUserAsync(userId) is null) return NotFound();
        await _permissions.RevokeAsync(userId, permission, _currentUser.UserId ?? string.Empty, cancellationToken);
        return Ok(new { granted = await _permissions.GetForUserAsync(userId, cancellationToken) });
    }

    private async Task<bool> HasAsync(string permission, CancellationToken cancellationToken)
    {
        if (_currentUser.Roles.Contains("SystemAdmin")) return true;
        return _currentUser.UserId is { } id && await _permissions.HasAsync(id, permission, cancellationToken);
    }

    private IActionResult ToActionResult(RoleChangeResult result) => result.Outcome switch
    {
        RoleChangeOutcome.Success or RoleChangeOutcome.Unchanged => Ok(result.User),
        RoleChangeOutcome.NotFound => NotFound(new { message = "المستخدم غير موجود." }),
        RoleChangeOutcome.InvalidRole => BadRequest(new { message = "الدور غير معروف." }),
        RoleChangeOutcome.Conflict => Conflict(new { message = result.Reason ?? "لا يمكن تنفيذ التغيير." }),
        RoleChangeOutcome.Forbidden => Forbid(),
        _ => StatusCode(StatusCodes.Status500InternalServerError)
    };
}
