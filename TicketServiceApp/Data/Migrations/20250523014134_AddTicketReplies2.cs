using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TicketServiceApp.Data.Migrations
{

    public partial class AddTicketReplies2 : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketReply_Tickets_TicketId",
                table: "TicketReply");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TicketReply",
                table: "TicketReply");

            migrationBuilder.RenameTable(
                name: "TicketReply",
                newName: "TicketReplies");

            migrationBuilder.RenameIndex(
                name: "IX_TicketReply_TicketId",
                table: "TicketReplies",
                newName: "IX_TicketReplies_TicketId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TicketReplies",
                table: "TicketReplies",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketReplies_Tickets_TicketId",
                table: "TicketReplies",
                column: "TicketId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketReplies_Tickets_TicketId",
                table: "TicketReplies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TicketReplies",
                table: "TicketReplies");

            migrationBuilder.RenameTable(
                name: "TicketReplies",
                newName: "TicketReply");

            migrationBuilder.RenameIndex(
                name: "IX_TicketReplies_TicketId",
                table: "TicketReply",
                newName: "IX_TicketReply_TicketId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TicketReply",
                table: "TicketReply",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketReply_Tickets_TicketId",
                table: "TicketReply",
                column: "TicketId",
                principalTable: "Tickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
