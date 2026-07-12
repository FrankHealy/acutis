using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGlobalAuditMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "WeeklyTherapyRun",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "WeeklyTherapyRun",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "WeeklyTherapyRun",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "WeeklyTherapyRun",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Video",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Video",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Video",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "UnitVideoCuration",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "UnitVideoCuration",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "UnitVideoCuration",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "UnitVideoCuration",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "UnitQuoteCuration",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "UnitQuoteCuration",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "UnitQuoteCuration",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "UnitQuoteCuration",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Unit",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Unit",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "TherapyTopicCompletion",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "TherapyTopicCompletion",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "TherapyTopicCompletion",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "TherapyTopic",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "TherapyTopic",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "TherapyTopic",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "TherapyTopic",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "TherapySchedulingConfig",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "TherapySchedulingConfig",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "TherapySchedulingConfig",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "TherapySchedulingConfig",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "TextTranslation",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "TextTranslation",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "TextTranslation",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "TextTranslation",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "TextResource",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "TextResource",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "TextResource",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "TextResource",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ScreeningScheduleSlot",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ScreeningScheduleSlot",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "ScreeningControl",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ScreeningControl",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "ScreeningControl",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ScreeningControl",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ScheduledIntake",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ScheduledIntake",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "ResidentWeeklyTherapyAssignment",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "ResidentWeeklyTherapyAssignment",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ResidentWeeklyTherapyAssignment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "ResidentProgrammeEpisode",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ResidentProgrammeEpisode",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "ResidentProgrammeEpisode",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ResidentProgrammeEpisode",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ResidentPreviousTreatment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ResidentPreviousTreatment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Resident",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Resident",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "Quote",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Quote",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Quote",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Quote",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "OptionSet",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "OptionSet",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "OptionSet",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "OptionSet",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "OptionItem",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "OptionItem",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "OptionItem",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "OptionItem",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "MediaAsset",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "MediaAsset",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "dbo",
                table: "LookupValueLabel",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                schema: "dbo",
                table: "LookupValueLabel",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "dbo",
                table: "LookupValueLabel",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                schema: "dbo",
                table: "LookupValueLabel",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "dbo",
                table: "LookupValue",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                schema: "dbo",
                table: "LookupValue",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "dbo",
                table: "LookupValue",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                schema: "dbo",
                table: "LookupValue",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                schema: "dbo",
                table: "LookupType",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                schema: "dbo",
                table: "LookupType",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "dbo",
                table: "LookupType",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                schema: "dbo",
                table: "LookupType",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "IncidentType",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "IncidentType",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "IncidentType",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "IncidentType",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Incident",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Incident",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "GroupTherapySubjectTemplate",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "GroupTherapySubjectTemplate",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "GroupTherapySubjectTemplate",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "GroupTherapySubjectTemplate",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "GroupTherapyResidentRemark",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "GroupTherapyResidentRemark",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "GroupTherapyResidentObservation",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "GroupTherapyResidentObservation",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "GroupTherapyDailyQuestion",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "GroupTherapyDailyQuestion",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "GroupTherapyDailyQuestion",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "GroupTherapyDailyQuestion",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "FormSubmission",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "FormSubmission",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "FormSubmission",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "FormSubmission",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "FormDefinition",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "FormDefinition",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "FormDefinition",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "FormDefinition",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "EpisodeEventType",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "EpisodeEventType",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "EpisodeEventType",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "EpisodeEventType",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "EpisodeEvent",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "EpisodeEvent",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "EpisodeEvent",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ElementGroup",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ElementGroup",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "ElementDefinition",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "ElementDefinition",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Centre",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Centre",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "Calls",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Calls",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Calls",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "Calls",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "AuditLog",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "AuditLog",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "AuditLog",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "AuditLog",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "AppUserRoleAssignment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "AppUserRoleAssignment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "AppUser",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "AppUser",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "AppRolePermission",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "AppRolePermission",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "AppRolePermission",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "AppRolePermission",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "AppRole",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "AppRole",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "AppRole",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "AppRole",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "AppPermission",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "AppPermission",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "AppPermission",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()");

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                table: "AppPermission",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.Sql(
                """
                DECLARE @sql nvarchar(max) = N'';

                SELECT @sql += N'
                IF COL_LENGTH(N''' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N''', ''CreatedAtUtc'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N' ADD [CreatedAtUtc] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME());
                END;

                IF COL_LENGTH(N''' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N''', ''CreatedByUserId'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N' ADD [CreatedByUserId] uniqueidentifier NOT NULL DEFAULT (''00000000-0000-0000-0000-000000000001'');
                END;

                IF COL_LENGTH(N''' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N''', ''UpdatedAtUtc'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N' ADD [UpdatedAtUtc] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME());
                END;

                IF COL_LENGTH(N''' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N''', ''UpdatedByUserId'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N' ADD [UpdatedByUserId] uniqueidentifier NOT NULL DEFAULT (''00000000-0000-0000-0000-000000000001'');
                END;
                '
                FROM sys.tables t
                INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
                WHERE t.is_ms_shipped = 0
                  AND t.name <> '__EFMigrationsHistory';

                EXEC sys.sp_executesql @sql;
                """);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "WeeklyTherapyRun");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "WeeklyTherapyRun");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "WeeklyTherapyRun");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "WeeklyTherapyRun");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Video");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Video");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Video");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "UnitVideoCuration");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "UnitVideoCuration");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "UnitVideoCuration");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "UnitVideoCuration");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "UnitQuoteCuration");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "UnitQuoteCuration");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "UnitQuoteCuration");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "UnitQuoteCuration");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Unit");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Unit");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "TherapyTopicCompletion");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "TherapyTopicCompletion");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "TherapyTopicCompletion");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "TherapyTopic");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "TherapyTopic");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "TherapyTopic");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "TherapyTopic");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "TherapySchedulingConfig");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "TherapySchedulingConfig");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "TherapySchedulingConfig");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "TherapySchedulingConfig");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "TextTranslation");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "TextTranslation");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "TextTranslation");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "TextTranslation");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "TextResource");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "TextResource");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "TextResource");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "TextResource");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ScreeningScheduleSlot");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ScreeningScheduleSlot");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "ScreeningControl");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ScreeningControl");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "ScreeningControl");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ScreeningControl");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ScheduledIntake");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ScheduledIntake");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "ResidentWeeklyTherapyAssignment");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "ResidentWeeklyTherapyAssignment");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ResidentWeeklyTherapyAssignment");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ResidentPreviousTreatment");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ResidentPreviousTreatment");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Resident");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Resident");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "Quote");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Quote");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Quote");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Quote");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "OptionSet");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "OptionSet");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "OptionSet");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "OptionSet");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "OptionItem");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "OptionItem");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "OptionItem");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "OptionItem");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "MediaAsset");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "MediaAsset");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                schema: "dbo",
                table: "LookupValueLabel");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                schema: "dbo",
                table: "LookupValueLabel");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                schema: "dbo",
                table: "LookupValueLabel");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                schema: "dbo",
                table: "LookupValueLabel");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                schema: "dbo",
                table: "LookupValue");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                schema: "dbo",
                table: "LookupValue");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                schema: "dbo",
                table: "LookupValue");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                schema: "dbo",
                table: "LookupValue");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                schema: "dbo",
                table: "LookupType");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                schema: "dbo",
                table: "LookupType");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                schema: "dbo",
                table: "LookupType");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                schema: "dbo",
                table: "LookupType");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "IncidentType");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "IncidentType");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "IncidentType");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "IncidentType");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Incident");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Incident");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "GroupTherapySubjectTemplate");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "GroupTherapySubjectTemplate");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "GroupTherapySubjectTemplate");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "GroupTherapySubjectTemplate");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "GroupTherapyResidentRemark");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "GroupTherapyResidentRemark");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "GroupTherapyResidentObservation");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "GroupTherapyResidentObservation");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "GroupTherapyDailyQuestion");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "GroupTherapyDailyQuestion");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "GroupTherapyDailyQuestion");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "GroupTherapyDailyQuestion");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "FormSubmission");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "FormSubmission");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "FormSubmission");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "FormSubmission");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "FormDefinition");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "FormDefinition");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "FormDefinition");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "FormDefinition");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "EpisodeEventType");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "EpisodeEventType");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "EpisodeEventType");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "EpisodeEventType");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "EpisodeEvent");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "EpisodeEvent");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "EpisodeEvent");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ElementGroup");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ElementGroup");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "ElementDefinition");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ElementDefinition");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Centre");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Centre");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "Calls");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Calls");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Calls");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Calls");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "AuditLog");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "AuditLog");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "AuditLog");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "AuditLog");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "AppUser");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "AppUser");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "AppRolePermission");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "AppRolePermission");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "AppRolePermission");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "AppRolePermission");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "AppRole");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "AppRole");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "AppRole");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "AppRole");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "AppPermission");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "AppPermission");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "AppPermission");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "AppPermission");
        }
    }
}

