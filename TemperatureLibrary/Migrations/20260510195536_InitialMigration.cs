using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemperatureLibrary.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    RoomId = table.Column<string>(type: "VARCHAR(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.RoomId);
                });

            migrationBuilder.CreateTable(
                name: "Temperatures",
                columns: table => new
                {
                    ReadingId = table.Column<string>(type: "VARCHAR(6)", nullable: false),
                    RoomId = table.Column<string>(type: "VARCHAR(6)", nullable: false),
                    TemperatureValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RecordedAt = table.Column<string>(type: "VARCHAR(30)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Temperatures", x => x.ReadingId);
                    table.ForeignKey(
                        name: "FK_Temperatures_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "RoomId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Temperatures_RoomId",
                table: "Temperatures",
                column: "RoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Temperatures");

            migrationBuilder.DropTable(
                name: "Rooms");
        }
    }
}
