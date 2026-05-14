using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomsLibrary.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "VARCHAR(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    RoomId = table.Column<string>(type: "VARCHAR(6)", nullable: false),
                    RoomName = table.Column<string>(type: "VARCHAR(30)", nullable: false),
                    MinTemp = table.Column<int>(type: "int", nullable: false),
                    MaxTemp = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "VARCHAR(6)", nullable: false),
                    CreatedAt = table.Column<string>(type: "VARCHAR(30)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.RoomId);
                    table.ForeignKey(
                        name: "FK_Rooms_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    AlertId = table.Column<string>(type: "VARCHAR(6)", nullable: false),
                    RoomId = table.Column<string>(type: "VARCHAR(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.AlertId);
                    table.ForeignKey(
                        name: "FK_Alerts_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "RoomId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tempratures",
                columns: table => new
                {
                    ReadingId = table.Column<string>(type: "VARCHAR(6)", nullable: false),
                    RoomId = table.Column<string>(type: "VARCHAR(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tempratures", x => x.ReadingId);
                    table.ForeignKey(
                        name: "FK_Tempratures_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "RoomId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_RoomId",
                table: "Alerts",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_CreatedByUserId",
                table: "Rooms",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tempratures_RoomId",
                table: "Tempratures",
                column: "RoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.DropTable(
                name: "Tempratures");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
