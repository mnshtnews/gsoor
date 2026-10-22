using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jusoor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertEmailSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlertEmailSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    EmailHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ConsentedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UnsubscribedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertEmailSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AlertSubscriptionSettings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertSubscriptionSettings", x => x.Key);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertEmailSubscriptions_EmailHash",
                table: "AlertEmailSubscriptions",
                column: "EmailHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AlertEmailSubscriptions_IsActive",
                table: "AlertEmailSubscriptions",
                column: "IsActive");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertEmailSubscriptions");

            migrationBuilder.DropTable(
                name: "AlertSubscriptionSettings");
        }
    }
}
