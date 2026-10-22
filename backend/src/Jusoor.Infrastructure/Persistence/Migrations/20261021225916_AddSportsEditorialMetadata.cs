using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jusoor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSportsEditorialMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SportsCompetitionName",
                table: "EditorialArticles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SportsCountryName",
                table: "EditorialArticles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SportsCoverageType",
                table: "EditorialArticles",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "SportsPlayerNames",
                table: "EditorialArticles",
                type: "text[]",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "SportsTeamName",
                table: "EditorialArticles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SportsCompetitionName",
                table: "EditorialArticles");

            migrationBuilder.DropColumn(
                name: "SportsCountryName",
                table: "EditorialArticles");

            migrationBuilder.DropColumn(
                name: "SportsCoverageType",
                table: "EditorialArticles");

            migrationBuilder.DropColumn(
                name: "SportsPlayerNames",
                table: "EditorialArticles");

            migrationBuilder.DropColumn(
                name: "SportsTeamName",
                table: "EditorialArticles");
        }
    }
}
