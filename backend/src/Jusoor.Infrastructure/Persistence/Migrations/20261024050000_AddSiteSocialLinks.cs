using Jusoor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Jusoor.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261024050000_AddSiteSocialLinks")]
public sealed class AddSiteSocialLinks : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
        => migrationBuilder.AddColumn<string>(
            name: "SocialLinksJson",
            table: "SiteStructureSettings",
            type: "character varying(8000)",
            maxLength: 8000,
            nullable: false,
            defaultValue: "[]");

    protected override void Down(MigrationBuilder migrationBuilder)
        => migrationBuilder.DropColumn(name: "SocialLinksJson", table: "SiteStructureSettings");
}