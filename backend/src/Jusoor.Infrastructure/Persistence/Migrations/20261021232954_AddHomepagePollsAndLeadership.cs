using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jusoor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHomepagePollsAndLeadership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "EditorialArticles"
                SET "PresentationDesks" = array_replace("PresentationDesks", 'various', 'fatwas')
                WHERE 'various' = ANY("PresentationDesks");

                UPDATE "SiteStructureSettings"
                SET "NavigationJson" = replace(replace("NavigationJson", '"various"', '"fatwas"'), 'منوعات', 'الفتاوى'),
                    "HomepageSectionsJson" = replace(replace("HomepageSectionsJson", 'various', 'fatwas'), 'منوعات', 'الفتاوى')
                WHERE "NavigationJson" LIKE '%various%' OR "HomepageSectionsJson" LIKE '%various%';
                """);

            migrationBuilder.AddColumn<string>(
                name: "LeadershipJson",
                table: "SiteStructureSettings",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.CreateTable(
                name: "HomepagePolls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Question = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: false),
                    Options = table.Column<List<string>>(type: "text[]", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    StartsAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    EndsAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true),
                    LastModifiedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastModifiedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomepagePolls", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomepagePollVotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PollId = table.Column<Guid>(type: "uuid", nullable: false),
                    OptionIndex = table.Column<int>(type: "integer", nullable: false),
                    VoterHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    VotedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomepagePollVotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomepagePollVotes_HomepagePolls_PollId",
                        column: x => x.PollId,
                        principalTable: "HomepagePolls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HomepagePolls_IsActive",
                table: "HomepagePolls",
                column: "IsActive",
                unique: true,
                filter: "\"IsActive\" = TRUE");

            migrationBuilder.CreateIndex(
                name: "IX_HomepagePollVotes_PollId_OptionIndex",
                table: "HomepagePollVotes",
                columns: new[] { "PollId", "OptionIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_HomepagePollVotes_PollId_VoterHash",
                table: "HomepagePollVotes",
                columns: new[] { "PollId", "VoterHash" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "EditorialArticles"
                SET "PresentationDesks" = array_replace("PresentationDesks", 'fatwas', 'various')
                WHERE 'fatwas' = ANY("PresentationDesks");

                UPDATE "SiteStructureSettings"
                SET "NavigationJson" = replace(replace("NavigationJson", '"fatwas"', '"various"'), 'الفتاوى', 'منوعات'),
                    "HomepageSectionsJson" = replace(replace("HomepageSectionsJson", 'fatwas', 'various'), 'الفتاوى', 'منوعات')
                WHERE "NavigationJson" LIKE '%fatwas%' OR "HomepageSectionsJson" LIKE '%fatwas%';
                """);
            migrationBuilder.DropTable(
                name: "HomepagePollVotes");

            migrationBuilder.DropTable(
                name: "HomepagePolls");

            migrationBuilder.DropColumn(
                name: "LeadershipJson",
                table: "SiteStructureSettings");
        }
    }
}
