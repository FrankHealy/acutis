using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResidentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[Resident]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [Resident] (
                        [Id] int NOT NULL IDENTITY,
                        [Psn] nvarchar(50) NOT NULL,
                        [UnitId] uniqueidentifier NULL,
                        [UnitCode] nvarchar(20) NOT NULL,
                        [FirstName] nvarchar(100) NOT NULL,
                        [Surname] nvarchar(100) NOT NULL,
                        [Nationality] nvarchar(100) NOT NULL,
                        [DateOfBirth] date NULL,
                        [WeekNumber] int NOT NULL CONSTRAINT [DF_Resident_WeekNumber] DEFAULT 1,
                        [RoomNumber] nvarchar(20) NOT NULL CONSTRAINT [DF_Resident_RoomNumber] DEFAULT N'',
                        [PhotoUrl] nvarchar(500) NULL,
                        [AdmissionDate] date NULL,
                        [ExpectedCompletionDate] date NULL,
                        [PrimaryAddiction] nvarchar(100) NOT NULL CONSTRAINT [DF_Resident_PrimaryAddiction] DEFAULT N'Alcohol',
                        [IsDrug] bit NOT NULL CONSTRAINT [DF_Resident_IsDrug] DEFAULT 0,
                        [IsGambeler] bit NOT NULL CONSTRAINT [DF_Resident_IsGambeler] DEFAULT 0,
                        [IsPreviousResident] bit NOT NULL CONSTRAINT [DF_Resident_IsPreviousResident] DEFAULT 0,
                        [DietaryNeedsCode] int NOT NULL CONSTRAINT [DF_Resident_DietaryNeedsCode] DEFAULT 0,
                        [IsSnorer] bit NOT NULL CONSTRAINT [DF_Resident_IsSnorer] DEFAULT 0,
                        [HasCriminalHistory] bit NOT NULL CONSTRAINT [DF_Resident_HasCriminalHistory] DEFAULT 0,
                        [IsOnProbation] bit NOT NULL CONSTRAINT [DF_Resident_IsOnProbation] DEFAULT 0,
                        [ArgumentativeScale] int NOT NULL CONSTRAINT [DF_Resident_ArgumentativeScale] DEFAULT 0,
                        [LearningDifficultyScale] int NOT NULL CONSTRAINT [DF_Resident_LearningDifficultyScale] DEFAULT 0,
                        [LiteracyScale] int NOT NULL CONSTRAINT [DF_Resident_LiteracyScale] DEFAULT 0,
                        [CreatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_Resident_CreatedAtUtc] DEFAULT SYSUTCDATETIME(),
                        [UpdatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_Resident_UpdatedAtUtc] DEFAULT SYSUTCDATETIME(),
                        CONSTRAINT [PK_Resident] PRIMARY KEY ([Id])
                    );
                END
                """);

            migrationBuilder.Sql(
                """
                IF COL_LENGTH('Resident', 'UnitId') IS NULL
                    ALTER TABLE [Resident] ADD [UnitId] uniqueidentifier NULL;
                IF COL_LENGTH('Resident', 'Psn') IS NULL
                    ALTER TABLE [Resident] ADD [Psn] nvarchar(50) NOT NULL CONSTRAINT [DF_Resident_Psn] DEFAULT N'';
                IF COL_LENGTH('Resident', 'UnitCode') IS NULL
                    ALTER TABLE [Resident] ADD [UnitCode] nvarchar(20) NOT NULL CONSTRAINT [DF_Resident_UnitCode] DEFAULT N'alcohol';
                IF COL_LENGTH('Resident', 'FirstName') IS NULL
                    ALTER TABLE [Resident] ADD [FirstName] nvarchar(100) NOT NULL CONSTRAINT [DF_Resident_FirstName] DEFAULT N'';
                IF COL_LENGTH('Resident', 'Surname') IS NULL
                    ALTER TABLE [Resident] ADD [Surname] nvarchar(100) NOT NULL CONSTRAINT [DF_Resident_Surname] DEFAULT N'';
                IF COL_LENGTH('Resident', 'Nationality') IS NULL
                    ALTER TABLE [Resident] ADD [Nationality] nvarchar(100) NOT NULL CONSTRAINT [DF_Resident_Nationality] DEFAULT N'Unknown';
                IF COL_LENGTH('Resident', 'DateOfBirth') IS NULL
                    ALTER TABLE [Resident] ADD [DateOfBirth] date NULL;
                IF COL_LENGTH('Resident', 'WeekNumber') IS NULL
                    ALTER TABLE [Resident] ADD [WeekNumber] int NOT NULL CONSTRAINT [DF_Resident_WeekNumber_Existing] DEFAULT 1;
                IF COL_LENGTH('Resident', 'RoomNumber') IS NULL
                    ALTER TABLE [Resident] ADD [RoomNumber] nvarchar(20) NOT NULL CONSTRAINT [DF_Resident_RoomNumber_Existing] DEFAULT N'';
                IF COL_LENGTH('Resident', 'PhotoUrl') IS NULL
                    ALTER TABLE [Resident] ADD [PhotoUrl] nvarchar(500) NULL;
                IF COL_LENGTH('Resident', 'AdmissionDate') IS NULL
                    ALTER TABLE [Resident] ADD [AdmissionDate] date NULL;
                IF COL_LENGTH('Resident', 'ExpectedCompletionDate') IS NULL
                    ALTER TABLE [Resident] ADD [ExpectedCompletionDate] date NULL;
                IF COL_LENGTH('Resident', 'PrimaryAddiction') IS NULL
                    ALTER TABLE [Resident] ADD [PrimaryAddiction] nvarchar(100) NOT NULL CONSTRAINT [DF_Resident_PrimaryAddiction_Existing] DEFAULT N'Alcohol';
                IF COL_LENGTH('Resident', 'IsDrug') IS NULL
                    ALTER TABLE [Resident] ADD [IsDrug] bit NOT NULL CONSTRAINT [DF_Resident_IsDrug_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'IsGambeler') IS NULL
                    ALTER TABLE [Resident] ADD [IsGambeler] bit NOT NULL CONSTRAINT [DF_Resident_IsGambeler_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'IsPreviousResident') IS NULL
                    ALTER TABLE [Resident] ADD [IsPreviousResident] bit NOT NULL CONSTRAINT [DF_Resident_IsPreviousResident_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'DietaryNeedsCode') IS NULL
                    ALTER TABLE [Resident] ADD [DietaryNeedsCode] int NOT NULL CONSTRAINT [DF_Resident_DietaryNeedsCode_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'IsSnorer') IS NULL
                    ALTER TABLE [Resident] ADD [IsSnorer] bit NOT NULL CONSTRAINT [DF_Resident_IsSnorer_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'HasCriminalHistory') IS NULL
                    ALTER TABLE [Resident] ADD [HasCriminalHistory] bit NOT NULL CONSTRAINT [DF_Resident_HasCriminalHistory_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'IsOnProbation') IS NULL
                    ALTER TABLE [Resident] ADD [IsOnProbation] bit NOT NULL CONSTRAINT [DF_Resident_IsOnProbation_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'ArgumentativeScale') IS NULL
                    ALTER TABLE [Resident] ADD [ArgumentativeScale] int NOT NULL CONSTRAINT [DF_Resident_ArgumentativeScale_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'LearningDifficultyScale') IS NULL
                    ALTER TABLE [Resident] ADD [LearningDifficultyScale] int NOT NULL CONSTRAINT [DF_Resident_LearningDifficultyScale_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'LiteracyScale') IS NULL
                    ALTER TABLE [Resident] ADD [LiteracyScale] int NOT NULL CONSTRAINT [DF_Resident_LiteracyScale_Existing] DEFAULT 0;
                IF COL_LENGTH('Resident', 'CreatedAtUtc') IS NULL
                    ALTER TABLE [Resident] ADD [CreatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_Resident_CreatedAtUtc_Existing] DEFAULT SYSUTCDATETIME();
                IF COL_LENGTH('Resident', 'UpdatedAtUtc') IS NULL
                    ALTER TABLE [Resident] ADD [UpdatedAtUtc] datetime2 NOT NULL CONSTRAINT [DF_Resident_UpdatedAtUtc_Existing] DEFAULT SYSUTCDATETIME();
                """);

            migrationBuilder.Sql(
                """
                UPDATE [Resident]
                SET [Psn] = CONCAT(N'LEGACY-', CONVERT(nvarchar(36), NEWID()))
                WHERE [Psn] IS NULL OR LTRIM(RTRIM([Psn])) = N'';

                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Resident_Psn' AND object_id = OBJECT_ID(N'[Resident]'))
                    CREATE UNIQUE INDEX [IX_Resident_Psn] ON [Resident] ([Psn]);
                IF EXISTS (
                    SELECT 1
                    FROM sys.columns c
                    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
                    WHERE c.object_id = OBJECT_ID(N'[Resident]')
                      AND c.name = N'RoomNumber'
                      AND t.name IN (N'nvarchar', N'varchar', N'nchar', N'char')
                      AND c.max_length > 0
                      AND c.max_length <> -1
                )
                AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Resident_UnitCode_RoomNumber' AND object_id = OBJECT_ID(N'[Resident]'))
                    CREATE INDEX [IX_Resident_UnitCode_RoomNumber] ON [Resident] ([UnitCode], [RoomNumber]);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[Resident]', N'U') IS NOT NULL
                    DROP TABLE [Resident];
                """);
        }
    }
}
