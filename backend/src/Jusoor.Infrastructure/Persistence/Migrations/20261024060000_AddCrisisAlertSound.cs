using Jusoor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Jusoor.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261024060000_AddCrisisAlertSound")]
public sealed class AddCrisisAlertSound : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(name: "SoundAssetId", table: "CrisisModes", type: "uuid", nullable: true);
        migrationBuilder.AddColumn<int>(name: "SoundRepeatIntervalSeconds", table: "CrisisModes", type: "integer", nullable: false, defaultValue: 60);
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "SoundAssetId", table: "CrisisModes");
        migrationBuilder.DropColumn(name: "SoundRepeatIntervalSeconds", table: "CrisisModes");
    }
}