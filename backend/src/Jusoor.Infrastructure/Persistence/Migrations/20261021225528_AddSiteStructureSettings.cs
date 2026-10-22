using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jusoor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteStructureSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteStructureSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    NavigationJson = table.Column<string>(type: "character varying(30000)", maxLength: 30000, nullable: false),
                    HomepageSectionsJson = table.Column<string>(type: "character varying(30000)", maxLength: 30000, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    LastModifiedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastModifiedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteStructureSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SiteStructureSettings_Key",
                table: "SiteStructureSettings",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SiteStructureSettings");
        }
    }
}
