using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    public partial class AddUnitsAndDbAuthorization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[Unit]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [Unit] (
                        [Id] uniqueidentifier NOT NULL,
                        [Code] nvarchar(50) NOT NULL,
                        [Name] nvarchar(200) NOT NULL,
                        [Description] nvarchar(1000) NOT NULL,
                        [Capacity] int NOT NULL,
                        [CurrentOccupancy] int NOT NULL,
                        [CapacityWarningThreshold] int NOT NULL,
                        [DisplayOrder] int NOT NULL,
                        [IsActive] bit NOT NULL,
                        [CreatedAtUtc] datetime2 NOT NULL,
                        [UpdatedAtUtc] datetime2 NOT NULL,
                        CONSTRAINT [PK_Unit] PRIMARY KEY ([Id])
                    );
                END
                """);

            migrationBuilder.Sql(
                """
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Unit_Code' AND object_id = OBJECT_ID(N'[Unit]'))
                    CREATE UNIQUE INDEX [IX_Unit_Code] ON [Unit] ([Code]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Unit_IsActive_DisplayOrder_Name' AND object_id = OBJECT_ID(N'[Unit]'))
                    CREATE INDEX [IX_Unit_IsActive_DisplayOrder_Name] ON [Unit] ([IsActive], [DisplayOrder], [Name]);
                """);

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[AppPermission]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [AppPermission] (
                        [Id] uniqueidentifier NOT NULL,
                        [Key] nvarchar(150) NOT NULL,
                        [Name] nvarchar(200) NOT NULL,
                        [Description] nvarchar(1000) NOT NULL,
                        [Category] nvarchar(100) NOT NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_AppPermission] PRIMARY KEY ([Id])
                    );
                END
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppPermission_Key' AND object_id = OBJECT_ID(N'[AppPermission]'))
                    CREATE UNIQUE INDEX [IX_AppPermission_Key] ON [AppPermission] ([Key]);
                """);

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[AppRole]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [AppRole] (
                        [Id] uniqueidentifier NOT NULL,
                        [Key] nvarchar(100) NOT NULL,
                        [Name] nvarchar(200) NOT NULL,
                        [Description] nvarchar(1000) NOT NULL,
                        [ExternalRoleName] nvarchar(200) NOT NULL,
                        [IsSystemRole] bit NOT NULL,
                        [IsActive] bit NOT NULL,
                        CONSTRAINT [PK_AppRole] PRIMARY KEY ([Id])
                    );
                END
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppRole_Key' AND object_id = OBJECT_ID(N'[AppRole]'))
                    CREATE UNIQUE INDEX [IX_AppRole_Key] ON [AppRole] ([Key]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppRole_ExternalRoleName' AND object_id = OBJECT_ID(N'[AppRole]'))
                    CREATE INDEX [IX_AppRole_ExternalRoleName] ON [AppRole] ([ExternalRoleName]);
                """);

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[AppUser]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [AppUser] (
                        [Id] uniqueidentifier NOT NULL,
                        [ExternalSubject] nvarchar(200) NOT NULL,
                        [UserName] nvarchar(200) NOT NULL,
                        [DisplayName] nvarchar(200) NOT NULL,
                        [Email] nvarchar(320) NOT NULL,
                        [IsActive] bit NOT NULL,
                        [LastSeenAtUtc] datetime2 NULL,
                        [CreatedAtUtc] datetime2 NOT NULL,
                        [UpdatedAtUtc] datetime2 NOT NULL,
                        CONSTRAINT [PK_AppUser] PRIMARY KEY ([Id])
                    );
                END
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppUser_ExternalSubject' AND object_id = OBJECT_ID(N'[AppUser]'))
                    CREATE UNIQUE INDEX [IX_AppUser_ExternalSubject] ON [AppUser] ([ExternalSubject]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppUser_UserName' AND object_id = OBJECT_ID(N'[AppUser]'))
                    CREATE INDEX [IX_AppUser_UserName] ON [AppUser] ([UserName]);
                """);

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[AppRolePermission]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [AppRolePermission] (
                        [AppRoleId] uniqueidentifier NOT NULL,
                        [AppPermissionId] uniqueidentifier NOT NULL,
                        CONSTRAINT [PK_AppRolePermission] PRIMARY KEY ([AppRoleId], [AppPermissionId]),
                        CONSTRAINT [FK_AppRolePermission_AppRole_AppRoleId] FOREIGN KEY ([AppRoleId]) REFERENCES [AppRole] ([Id]) ON DELETE CASCADE,
                        CONSTRAINT [FK_AppRolePermission_AppPermission_AppPermissionId] FOREIGN KEY ([AppPermissionId]) REFERENCES [AppPermission] ([Id]) ON DELETE CASCADE
                    );
                END
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppRolePermission_AppPermissionId' AND object_id = OBJECT_ID(N'[AppRolePermission]'))
                    CREATE INDEX [IX_AppRolePermission_AppPermissionId] ON [AppRolePermission] ([AppPermissionId]);
                """);

            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[AppUserRoleAssignment]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [AppUserRoleAssignment] (
                        [Id] uniqueidentifier NOT NULL,
                        [AppUserId] uniqueidentifier NOT NULL,
                        [AppRoleId] uniqueidentifier NOT NULL,
                        [UnitId] uniqueidentifier NULL,
                        [IsActive] bit NOT NULL,
                        [CreatedAtUtc] datetime2 NOT NULL,
                        [UpdatedAtUtc] datetime2 NOT NULL,
                        CONSTRAINT [PK_AppUserRoleAssignment] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_AppUserRoleAssignment_AppRole_AppRoleId] FOREIGN KEY ([AppRoleId]) REFERENCES [AppRole] ([Id]) ON DELETE CASCADE,
                        CONSTRAINT [FK_AppUserRoleAssignment_AppUser_AppUserId] FOREIGN KEY ([AppUserId]) REFERENCES [AppUser] ([Id]) ON DELETE CASCADE,
                        CONSTRAINT [FK_AppUserRoleAssignment_Unit_UnitId] FOREIGN KEY ([UnitId]) REFERENCES [Unit] ([Id]) ON DELETE NO ACTION
                    );
                END
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppUserRoleAssignment_AppRoleId' AND object_id = OBJECT_ID(N'[AppUserRoleAssignment]'))
                    CREATE INDEX [IX_AppUserRoleAssignment_AppRoleId] ON [AppUserRoleAssignment] ([AppRoleId]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppUserRoleAssignment_AppUserId_AppRoleId_UnitId' AND object_id = OBJECT_ID(N'[AppUserRoleAssignment]'))
                    CREATE UNIQUE INDEX [IX_AppUserRoleAssignment_AppUserId_AppRoleId_UnitId] ON [AppUserRoleAssignment] ([AppUserId], [AppRoleId], [UnitId]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppUserRoleAssignment_UnitId' AND object_id = OBJECT_ID(N'[AppUserRoleAssignment]'))
                    CREATE INDEX [IX_AppUserRoleAssignment_UnitId] ON [AppUserRoleAssignment] ([UnitId]);
                """);

            migrationBuilder.Sql(
                """
                MERGE [Unit] AS target
                USING (VALUES
                    (CAST('11111111-1111-1111-1111-111111111111' AS uniqueidentifier), N'alcohol', N'Alcohol', N'Primary alcohol treatment unit.', 120, 92, 96, 1, CAST(1 AS bit), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2)),
                    (CAST('22222222-2222-2222-2222-222222222222' AS uniqueidentifier), N'detox', N'Detox', N'Detox and medically supervised stabilisation unit.', 16, 12, 14, 2, CAST(1 AS bit), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2)),
                    (CAST('33333333-3333-3333-3333-333333333333' AS uniqueidentifier), N'drugs', N'Drugs', N'Drug recovery residential unit.', 22, 18, 20, 3, CAST(1 AS bit), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2)),
                    (CAST('44444444-4444-4444-4444-444444444444' AS uniqueidentifier), N'ladies', N'Ladies', N'Women-specific residential recovery unit.', 18, 14, 16, 4, CAST(1 AS bit), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2), CAST('2026-02-02T00:00:00.0000000Z' AS datetime2))
                ) AS source ([Id], [Code], [Name], [Description], [Capacity], [CurrentOccupancy], [CapacityWarningThreshold], [DisplayOrder], [IsActive], [CreatedAtUtc], [UpdatedAtUtc])
                ON target.[Id] = source.[Id]
                WHEN MATCHED THEN UPDATE SET
                    [Code] = source.[Code],
                    [Name] = source.[Name],
                    [Description] = source.[Description],
                    [Capacity] = source.[Capacity],
                    [CurrentOccupancy] = source.[CurrentOccupancy],
                    [CapacityWarningThreshold] = source.[CapacityWarningThreshold],
                    [DisplayOrder] = source.[DisplayOrder],
                    [IsActive] = source.[IsActive],
                    [UpdatedAtUtc] = source.[UpdatedAtUtc]
                WHEN NOT MATCHED THEN INSERT ([Id], [Code], [Name], [Description], [Capacity], [CurrentOccupancy], [CapacityWarningThreshold], [DisplayOrder], [IsActive], [CreatedAtUtc], [UpdatedAtUtc])
                    VALUES (source.[Id], source.[Code], source.[Name], source.[Description], source.[Capacity], source.[CurrentOccupancy], source.[CapacityWarningThreshold], source.[DisplayOrder], source.[IsActive], source.[CreatedAtUtc], source.[UpdatedAtUtc]);
                """);

            migrationBuilder.Sql(
                """
                UPDATE sc
                SET
                    sc.[UnitName] = u.[Name],
                    sc.[UnitCapacity] = u.[Capacity],
                    sc.[CurrentOccupancy] = u.[CurrentOccupancy],
                    sc.[CapacityWarningThreshold] = u.[CapacityWarningThreshold],
                    sc.[UpdatedAt] = u.[UpdatedAtUtc]
                FROM [ScreeningControl] sc
                INNER JOIN [Unit] u ON u.[Code] = sc.[UnitCode];

                IF NOT EXISTS (SELECT 1 FROM [ScreeningControl] WHERE [UnitCode] = N'detox')
                    INSERT INTO [ScreeningControl] ([Id], [UnitCode], [UnitName], [UnitCapacity], [CurrentOccupancy], [CapacityWarningThreshold], [CallLogsCacheSeconds], [EvaluationQueueCacheSeconds], [LocalizationCacheSeconds], [EnableClientCacheOverride], [UpdatedAt])
                    VALUES (NEWID(), N'detox', N'Detox', 16, 12, 14, 15, 30, 300, 1, CAST('2026-02-02T00:00:00.0000000Z' AS datetime2));

                IF NOT EXISTS (SELECT 1 FROM [ScreeningControl] WHERE [UnitCode] = N'drugs')
                    INSERT INTO [ScreeningControl] ([Id], [UnitCode], [UnitName], [UnitCapacity], [CurrentOccupancy], [CapacityWarningThreshold], [CallLogsCacheSeconds], [EvaluationQueueCacheSeconds], [LocalizationCacheSeconds], [EnableClientCacheOverride], [UpdatedAt])
                    VALUES (NEWID(), N'drugs', N'Drugs', 22, 18, 20, 15, 30, 300, 1, CAST('2026-02-02T00:00:00.0000000Z' AS datetime2));

                IF NOT EXISTS (SELECT 1 FROM [ScreeningControl] WHERE [UnitCode] = N'ladies')
                    INSERT INTO [ScreeningControl] ([Id], [UnitCode], [UnitName], [UnitCapacity], [CurrentOccupancy], [CapacityWarningThreshold], [CallLogsCacheSeconds], [EvaluationQueueCacheSeconds], [LocalizationCacheSeconds], [EnableClientCacheOverride], [UpdatedAt])
                    VALUES (NEWID(), N'ladies', N'Ladies', 18, 14, 16, 15, 30, 300, 1, CAST('2026-02-02T00:00:00.0000000Z' AS datetime2));
                """);

            migrationBuilder.Sql(
                """
                MERGE [AppPermission] AS target
                USING (VALUES
                    (CAST('55555555-1111-1111-1111-111111111111' AS uniqueidentifier), N'configuration.manage', N'Manage configuration', N'Manage global application configuration.', N'configuration', CAST(1 AS bit)),
                    (CAST('55555555-2222-2222-2222-222222222222' AS uniqueidentifier), N'units.manage', N'Manage units', N'Create, update, and archive units.', N'units', CAST(1 AS bit)),
                    (CAST('55555555-3333-3333-3333-333333333333' AS uniqueidentifier), N'access.manage', N'Manage access', N'Manage users, roles, and role assignments.', N'security', CAST(1 AS bit)),
                    (CAST('55555555-4444-4444-4444-444444444444' AS uniqueidentifier), N'screening.view', N'View screening', N'Access screening controls and screening workflow data.', N'screening', CAST(1 AS bit)),
                    (CAST('55555555-5555-5555-5555-555555555555' AS uniqueidentifier), N'residents.view', N'View residents', N'Access resident lists scoped to a unit.', N'residents', CAST(1 AS bit)),
                    (CAST('55555555-6666-6666-6666-666666666666' AS uniqueidentifier), N'media.view', N'View media', N'Access unit media catalogues and media assets.', N'media', CAST(1 AS bit)),
                    (CAST('55555555-7777-7777-7777-777777777777' AS uniqueidentifier), N'group_therapy.view', N'View group therapy', N'Access group therapy programmes and remarks.', N'group_therapy', CAST(1 AS bit)),
                    (CAST('55555555-8888-8888-8888-888888888888' AS uniqueidentifier), N'unit_operations.view', N'View unit operations', N'Access room assignments and OT schedules.', N'units', CAST(1 AS bit))
                ) AS source ([Id], [Key], [Name], [Description], [Category], [IsActive])
                ON target.[Id] = source.[Id]
                WHEN MATCHED THEN UPDATE SET
                    [Key] = source.[Key],
                    [Name] = source.[Name],
                    [Description] = source.[Description],
                    [Category] = source.[Category],
                    [IsActive] = source.[IsActive]
                WHEN NOT MATCHED THEN INSERT ([Id], [Key], [Name], [Description], [Category], [IsActive])
                    VALUES (source.[Id], source.[Key], source.[Name], source.[Description], source.[Category], source.[IsActive]);
                """);

            migrationBuilder.Sql(
                """
                MERGE [AppRole] AS target
                USING (VALUES
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), N'platform_admin', N'Platform admin', N'Global administrator role for configuration and access control.', N'admin', CAST(1 AS bit), CAST(1 AS bit)),
                    (CAST('66666666-2222-2222-2222-222222222222' AS uniqueidentifier), N'clinical_viewer', N'Clinical viewer', N'Read-only role for operational unit features.', N'', CAST(1 AS bit), CAST(1 AS bit))
                ) AS source ([Id], [Key], [Name], [Description], [ExternalRoleName], [IsSystemRole], [IsActive])
                ON target.[Id] = source.[Id]
                WHEN MATCHED THEN UPDATE SET
                    [Key] = source.[Key],
                    [Name] = source.[Name],
                    [Description] = source.[Description],
                    [ExternalRoleName] = source.[ExternalRoleName],
                    [IsSystemRole] = source.[IsSystemRole],
                    [IsActive] = source.[IsActive]
                WHEN NOT MATCHED THEN INSERT ([Id], [Key], [Name], [Description], [ExternalRoleName], [IsSystemRole], [IsActive])
                    VALUES (source.[Id], source.[Key], source.[Name], source.[Description], source.[ExternalRoleName], source.[IsSystemRole], source.[IsActive]);
                """);

            migrationBuilder.Sql(
                """
                MERGE [AppRolePermission] AS target
                USING (VALUES
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-1111-1111-1111-111111111111' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-2222-2222-2222-222222222222' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-3333-3333-3333-333333333333' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-4444-4444-4444-444444444444' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-5555-5555-5555-555555555555' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-6666-6666-6666-666666666666' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-7777-7777-7777-777777777777' AS uniqueidentifier)),
                    (CAST('66666666-1111-1111-1111-111111111111' AS uniqueidentifier), CAST('55555555-8888-8888-8888-888888888888' AS uniqueidentifier)),
                    (CAST('66666666-2222-2222-2222-222222222222' AS uniqueidentifier), CAST('55555555-4444-4444-4444-444444444444' AS uniqueidentifier)),
                    (CAST('66666666-2222-2222-2222-222222222222' AS uniqueidentifier), CAST('55555555-5555-5555-5555-555555555555' AS uniqueidentifier)),
                    (CAST('66666666-2222-2222-2222-222222222222' AS uniqueidentifier), CAST('55555555-6666-6666-6666-666666666666' AS uniqueidentifier)),
                    (CAST('66666666-2222-2222-2222-222222222222' AS uniqueidentifier), CAST('55555555-7777-7777-7777-777777777777' AS uniqueidentifier)),
                    (CAST('66666666-2222-2222-2222-222222222222' AS uniqueidentifier), CAST('55555555-8888-8888-8888-888888888888' AS uniqueidentifier))
                ) AS source ([AppRoleId], [AppPermissionId])
                ON target.[AppRoleId] = source.[AppRoleId] AND target.[AppPermissionId] = source.[AppPermissionId]
                WHEN NOT MATCHED THEN INSERT ([AppRoleId], [AppPermissionId]) VALUES (source.[AppRoleId], source.[AppPermissionId]);
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF OBJECT_ID(N'[AppUserRoleAssignment]', N'U') IS NOT NULL DROP TABLE [AppUserRoleAssignment];
                IF OBJECT_ID(N'[AppRolePermission]', N'U') IS NOT NULL DROP TABLE [AppRolePermission];
                IF OBJECT_ID(N'[AppUser]', N'U') IS NOT NULL DROP TABLE [AppUser];
                IF OBJECT_ID(N'[AppRole]', N'U') IS NOT NULL DROP TABLE [AppRole];
                IF OBJECT_ID(N'[AppPermission]', N'U') IS NOT NULL DROP TABLE [AppPermission];
                IF OBJECT_ID(N'[Unit]', N'U') IS NOT NULL DROP TABLE [Unit];
                """);
        }
    }
}
