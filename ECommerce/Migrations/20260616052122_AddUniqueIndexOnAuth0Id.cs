using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Migrations
{
    public partial class AddUniqueIndexOnAuth0Id : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM ""User""
                WHERE ""Auth0Id"" IS NULL;

                DELETE FROM ""User""
                WHERE ""UserId"" NOT IN (
                    SELECT MIN(""UserId"")
                    FROM ""User""
                    GROUP BY ""Auth0Id""
                );
            ");

            migrationBuilder.CreateIndex(
                name: "IX_User_Auth0Id",
                table: "User",
                column: "Auth0Id",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_User_Auth0Id",
                table: "User");
        }
    }
}
