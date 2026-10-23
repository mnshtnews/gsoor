using Jusoor.Domain.Enums;
using Jusoor.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Jusoor.Infrastructure.Persistence;

/// <summary>
/// Development-only convenience: creates newsroom accounts from configuration
/// so each position can be tried locally after `docker compose up`.
///
/// Credentials come exclusively from configuration — nothing is hard-coded or
/// committed. Program.cs calls this inside the Development / Bootstrap:RunOnStartup
/// block (the latter is how the hosted client-trial environment gets its logins).
/// Existing accounts only gain the configured role; their password is never reset.
///
/// Each DevSeed:Accounts:&lt;Key&gt; entry uses &lt;Key&gt; as the newsroom role by default.
/// An optional "Role" value overrides that, which allows several accounts to share
/// one role (e.g. three EditorInChief users under keys Ashraf / Hanan / Omar).
/// </summary>
public static class DevelopmentNewsroomSeeder
{
    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager, IConfiguration configuration, ILogger logger)
    {
        var accounts = configuration.GetSection("DevSeed:Accounts").GetChildren();
        foreach (var account in accounts)
        {
            var accountRole = string.IsNullOrWhiteSpace(account["Role"]) ? account.Key : account["Role"]!.Trim();
            await SeedAccountAsync(userManager, accountRole, account["Email"], account["Password"],
                account["DisplayName"], logger);
        }

        // Backward-compatible single-account settings for existing local .env files.
        var section = configuration.GetSection("DevSeed");
        var role = string.IsNullOrWhiteSpace(section["Role"]) ? NewsroomRole.ManagingEditor : section["Role"]!;
        await SeedAccountAsync(userManager, role, section["Email"], section["Password"],
            section["DisplayName"], logger);
    }

    private static async Task SeedAccountAsync(
        UserManager<ApplicationUser> userManager, string role, string? email, string? password,
        string? displayName, ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        if (!NewsroomRole.All.Contains(role))
        {
            logger.LogWarning("DevSeed:Role '{Role}' is not a newsroom role; skipping development newsroom user.", role);
            return;
        }

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                DisplayName = string.IsNullOrWhiteSpace(displayName) ? role : displayName.Trim()
            };

            var created = await userManager.CreateAsync(user, password);
            if (!created.Succeeded)
            {
                logger.LogWarning(
                    "Could not create development newsroom user: {Errors}",
                    string.Join("; ", created.Errors.Select(e => e.Description)));
                return;
            }
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }

        logger.LogInformation("Development newsroom account ensured for role {Role}.", role);
    }
}
