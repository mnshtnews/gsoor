using Jusoor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Jusoor.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261024053000_AddWelcomeIntroConfiguration")]
public sealed class AddWelcomeIntroConfiguration : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(name: "WelcomeVideoAssetId", table: "SiteStructureSettings", type: "uuid", nullable: true);
        migrationBuilder.AddColumn<bool>(name: "WelcomeIntroEnabled", table: "SiteStructureSettings", type: "boolean", nullable: false, defaultValue: false);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "WelcomeVideoAssetId", table: "SiteStructureSettings");
        migrationBuilder.DropColumn(name: "WelcomeIntroEnabled", table: "SiteStructureSettings");
    }
}