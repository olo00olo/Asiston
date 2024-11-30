using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Asiston.Migrations
{
    /// <inheritdoc />
    public partial class TreeNodeUpdate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TreeNodes_TreeNodes_ParentId",
                schema: "identity",
                table: "TreeNodes");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "identity",
                table: "TreeNodes",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "identity",
                table: "TreeNodes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AddForeignKey(
                name: "FK_TreeNodes_TreeNodes_ParentId",
                schema: "identity",
                table: "TreeNodes",
                column: "ParentId",
                principalSchema: "identity",
                principalTable: "TreeNodes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
