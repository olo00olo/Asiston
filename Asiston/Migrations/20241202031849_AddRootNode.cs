using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asiston.Migrations
{
    /// <inheritdoc />
    public partial class AddRootNode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "identity",
                table: "TreeNodes",
                columns: new[] { "Id", "Name", "ParentId" },
                values: new object[] { 1, "Root", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "identity",
                table: "TreeNodes",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
