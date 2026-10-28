using Jusoor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jusoor.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261027020000_AllowAnonymousAtmaenCommunityPosts")]
public partial class AllowAnonymousAtmaenCommunityPosts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AlterColumn<string>(
        name: "AuthorUserId", table: "AtmaenCommunityPosts", type: "character varying(450)", maxLength: 450,
        nullable: true, oldClrType: typeof(string), oldType: "character varying(450)", oldMaxLength: 450);

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("UPDATE \"AtmaenCommunityPosts\" SET \"AuthorUserId\" = 'legacy-anonymous' WHERE \"AuthorUserId\" IS NULL;");
        migrationBuilder.AlterColumn<string>(
            name: "AuthorUserId", table: "AtmaenCommunityPosts", type: "character varying(450)", maxLength: 450,
            nullable: false, oldClrType: typeof(string), oldType: "character varying(450)", oldMaxLength: 450, oldNullable: true);
    }
}
