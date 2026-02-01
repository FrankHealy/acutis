using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSingular : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AddictionType",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddictionType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Country",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CountryCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Demonym = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Country", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentType",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicalInsuranceProvider",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalInsuranceProvider", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProbationType",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProbationType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReligiousAffiliation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReligiousAffiliation", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Room",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NumberOfResidents = table.Column<int>(type: "int", nullable: false),
                    IsOpiateDetox = table.Column<bool>(type: "bit", nullable: false),
                    IsQuarantine = table.Column<bool>(type: "bit", nullable: false),
                    HasOwnWC = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Addiction",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddictionTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addiction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Addiction_AddictionType_AddictionTypeId",
                        column: x => x.AddictionTypeId,
                        principalTable: "AddictionType",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "County",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_County", x => x.Id);
                    table.ForeignKey(
                        name: "FK_County_Country_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Country",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Address",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Line1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Line2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PostCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CountryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Address_Country_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Country",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Address_County_CountyId",
                        column: x => x.CountyId,
                        principalTable: "County",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Resident",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SocialSecurityNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateOfAdmission = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Surname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Alias = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPreviousResident = table.Column<bool>(type: "bit", nullable: false),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CountryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReligiousAffiliationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HasProbationRequirement = table.Column<bool>(type: "bit", nullable: false),
                    ProbationRequirementId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HasMedicalCard = table.Column<bool>(type: "bit", nullable: false),
                    MedicalCardNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasPrivateInsurance = table.Column<bool>(type: "bit", nullable: false),
                    PrivateMedicalInsuranceProviderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PrivateMedicalInsuranceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasMobilityIssue = table.Column<bool>(type: "bit", nullable: false),
                    PrimaryAddictionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextOfKinFirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextOfKinSecondName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NextOfKinPhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ArrivalPhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DischargePhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhotoDeclined = table.Column<bool>(type: "bit", nullable: false),
                    PhotoDeclinedReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdmissionPhase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataQuality = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAdmissionFormComplete = table.Column<bool>(type: "bit", nullable: false),
                    AdmissionFormCompletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdmissionFormCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    QuestionnairesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredStepDownHouse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NeedsReview = table.Column<bool>(type: "bit", nullable: false),
                    ReviewedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AdmittedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DoctorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NurseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FinanceOfficerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DepositAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DepositReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RoomNumber = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resident", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resident_Addiction_PrimaryAddictionId",
                        column: x => x.PrimaryAddictionId,
                        principalTable: "Addiction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Resident_Address_AddressId",
                        column: x => x.AddressId,
                        principalTable: "Address",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Resident_Country_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Country",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Resident_MedicalInsuranceProvider_PrivateMedicalInsuranceProviderId",
                        column: x => x.PrivateMedicalInsuranceProviderId,
                        principalTable: "MedicalInsuranceProvider",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Resident_ProbationType_ProbationRequirementId",
                        column: x => x.ProbationRequirementId,
                        principalTable: "ProbationType",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Resident_ReligiousAffiliation_ReligiousAffiliationId",
                        column: x => x.ReligiousAffiliationId,
                        principalTable: "ReligiousAffiliation",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Prescription",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dosage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrescribedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrescribedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescription", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prescription_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResidentAddiction",
                columns: table => new
                {
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddictionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentAddiction", x => new { x.ResidentId, x.AddictionId });
                    table.ForeignKey(
                        name: "FK_ResidentAddiction_Addiction_AddictionId",
                        column: x => x.AddictionId,
                        principalTable: "Addiction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_ResidentAddiction_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                });

            migrationBuilder.CreateTable(
                name: "ResidentDocument",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentDocument", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentDocument_DocumentType_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalTable: "DocumentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResidentDocument_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResidentPhoto",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentPhoto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentPhoto_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Addiction",
                columns: new[] { "Id", "AddictionTypeId", "Category", "Name" },
                values: new object[,]
                {
                    { new Guid("568f321c-f08d-49eb-b895-24c0fff76147"), null, "Substance", "Alcohol" },
                    { new Guid("b0785d0f-d15e-4422-9a20-55071b8846e4"), null, "Substance", "Cocaine" },
                    { new Guid("bcdaef1c-e816-48e0-86cd-22bfd0409163"), null, "Behavioural", "Gambling" }
                });

            migrationBuilder.InsertData(
                table: "Country",
                columns: new[] { "Id", "CountryCode", "CountryName", "Demonym" },
                values: new object[] { new Guid("4c241b3b-bbef-47ef-ad6d-6a485790f802"), "IE", "Ireland", "Irish" });

            migrationBuilder.InsertData(
                table: "MedicalInsuranceProvider",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("505c437e-b9e3-47da-9735-efaa9fe3bd5c"), "Irish Life" },
                    { new Guid("f956cb97-16eb-45d3-8823-9bab84177c5c"), "VHI" }
                });

            migrationBuilder.InsertData(
                table: "ProbationType",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("5ebe9b43-1e7e-4a64-bbe1-8eb2f1884d0b"), "Weekly Check-in" },
                    { new Guid("e8655eed-cca5-428b-a22f-baffdadde3c9"), "Curfew" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addiction_AddictionTypeId",
                table: "Addiction",
                column: "AddictionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Address_CountryId",
                table: "Address",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Address_CountyId",
                table: "Address",
                column: "CountyId");

            migrationBuilder.CreateIndex(
                name: "IX_County_CountryId",
                table: "County",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescription_ResidentId",
                table: "Prescription",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_AddressId",
                table: "Resident",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_CountryId",
                table: "Resident",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_PrimaryAddictionId",
                table: "Resident",
                column: "PrimaryAddictionId");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_PrivateMedicalInsuranceProviderId",
                table: "Resident",
                column: "PrivateMedicalInsuranceProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_ProbationRequirementId",
                table: "Resident",
                column: "ProbationRequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_ReligiousAffiliationId",
                table: "Resident",
                column: "ReligiousAffiliationId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentAddiction_AddictionId",
                table: "ResidentAddiction",
                column: "AddictionId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentDocument_DocumentTypeId",
                table: "ResidentDocument",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentDocument_ResidentId",
                table: "ResidentDocument",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentPhoto_ResidentId",
                table: "ResidentPhoto",
                column: "ResidentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Prescription");

            migrationBuilder.DropTable(
                name: "ResidentAddiction");

            migrationBuilder.DropTable(
                name: "ResidentDocument");

            migrationBuilder.DropTable(
                name: "ResidentPhoto");

            migrationBuilder.DropTable(
                name: "Room");

            migrationBuilder.DropTable(
                name: "DocumentType");

            migrationBuilder.DropTable(
                name: "Resident");

            migrationBuilder.DropTable(
                name: "Addiction");

            migrationBuilder.DropTable(
                name: "Address");

            migrationBuilder.DropTable(
                name: "MedicalInsuranceProvider");

            migrationBuilder.DropTable(
                name: "ProbationType");

            migrationBuilder.DropTable(
                name: "ReligiousAffiliation");

            migrationBuilder.DropTable(
                name: "AddictionType");

            migrationBuilder.DropTable(
                name: "County");

            migrationBuilder.DropTable(
                name: "Country");
        }
    }
}

