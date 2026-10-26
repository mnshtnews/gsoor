using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jusoor.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAtmaenCommunityRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AtmaenCommunityPosts_CityId",
                table: "AtmaenCommunityPosts",
                column: "CityId");

            migrationBuilder.CreateIndex(
                name: "IX_AtmaenCommunityPosts_CountryId",
                table: "AtmaenCommunityPosts",
                column: "CountryId");

            migrationBuilder.AddForeignKey(
                name: "FK_AtmaenCommunityComments_AtmaenCommunityPosts_PostId",
                table: "AtmaenCommunityComments",
                column: "PostId",
                principalTable: "AtmaenCommunityPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AtmaenCommunityLikes_AtmaenCommunityPosts_PostId",
                table: "AtmaenCommunityLikes",
                column: "PostId",
                principalTable: "AtmaenCommunityPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AtmaenCommunityPosts_Cities_CityId",
                table: "AtmaenCommunityPosts",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AtmaenCommunityPosts_Countries_CountryId",
                table: "AtmaenCommunityPosts",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AtmaenCommunityReports_AtmaenCommunityPosts_PostId",
                table: "AtmaenCommunityReports",
                column: "PostId",
                principalTable: "AtmaenCommunityPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AtmaenCommunityComments_AtmaenCommunityPosts_PostId",
                table: "AtmaenCommunityComments");

            migrationBuilder.DropForeignKey(
                name: "FK_AtmaenCommunityLikes_AtmaenCommunityPosts_PostId",
                table: "AtmaenCommunityLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_AtmaenCommunityPosts_Cities_CityId",
                table: "AtmaenCommunityPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_AtmaenCommunityPosts_Countries_CountryId",
                table: "AtmaenCommunityPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_AtmaenCommunityReports_AtmaenCommunityPosts_PostId",
                table: "AtmaenCommunityReports");

            migrationBuilder.DropIndex(
                name: "IX_AtmaenCommunityPosts_CityId",
                table: "AtmaenCommunityPosts");

            migrationBuilder.DropIndex(
                name: "IX_AtmaenCommunityPosts_CountryId",
                table: "AtmaenCommunityPosts");
        }
    }
}
