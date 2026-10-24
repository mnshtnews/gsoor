using Jusoor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Jusoor.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261024070000_AddDirectUserPermissions")]
public sealed class AddDirectUserPermissions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "UserPermissionGrants",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                Permission = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                GrantedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                GrantedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_UserPermissionGrants", x => x.Id));

        migrationBuilder.CreateTable(
            name: "UserPermissionChangeAudits",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ActorUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                TargetUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                Permission = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Action = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                OccurredAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_UserPermissionChangeAudits", x => x.Id));

        migrationBuilder.CreateIndex(name: "IX_UserPermissionGrants_GrantedAtUtc", table: "UserPermissionGrants", column: "GrantedAtUtc");
        migrationBuilder.CreateIndex(name: "IX_UserPermissionGrants_UserId_Permission", table: "UserPermissionGrants", columns: new[] { "UserId", "Permission" }, unique: true);
        migrationBuilder.CreateIndex(name: "IX_UserPermissionChangeAudits_ActorUserId_OccurredAtUtc", table: "UserPermissionChangeAudits", columns: new[] { "ActorUserId", "OccurredAtUtc" });
        migrationBuilder.CreateIndex(name: "IX_UserPermissionChangeAudits_TargetUserId_OccurredAtUtc", table: "UserPermissionChangeAudits", columns: new[] { "TargetUserId", "OccurredAtUtc" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "UserPermissionChangeAudits");
        migrationBuilder.DropTable(name: "UserPermissionGrants");
    }
}
