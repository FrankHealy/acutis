using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AcutisDbContext))]
    [Migration("20260612120000_SeedFrankhAndAdminPlatformAccess")]
    public partial class SeedFrankhAndAdminPlatformAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DECLARE @now datetime2 = SYSUTCDATETIME();
                DECLARE @platformAdminRoleId uniqueidentifier = '66666666-1111-1111-1111-111111111111';
                DECLARE @brureeCentreId uniqueidentifier = 'aaaaaaaa-1111-1111-1111-111111111111';

                DECLARE @seedUsers TABLE
                (
                    AppUserId uniqueidentifier NOT NULL,
                    ExternalSubject nvarchar(200) NOT NULL,
                    UserName nvarchar(200) NOT NULL,
                    DisplayName nvarchar(200) NOT NULL,
                    Email nvarchar(320) NOT NULL
                );

                INSERT INTO @seedUsers (AppUserId, ExternalSubject, UserName, DisplayName, Email)
                VALUES
                    ('77777777-1111-1111-1111-111111111111', N'63ecf7f3-a6b1-44e9-b2d1-07311d08c822', N'frankh', N'frankh', N''),
                    ('77777777-2222-2222-2222-222222222222', N'74490338-3232-4663-93dc-f6ecae1acfef', N'admin', N'Admin User', N'');

                UPDATE target
                SET
                    target.UserName = source.UserName,
                    target.DisplayName = source.DisplayName,
                    target.Email = source.Email,
                    target.IsActive = CAST(1 AS bit),
                    target.UpdatedAtUtc = @now
                FROM [AppUser] target
                INNER JOIN @seedUsers source ON source.ExternalSubject = target.ExternalSubject;

                UPDATE target
                SET
                    target.ExternalSubject = source.ExternalSubject,
                    target.DisplayName = source.DisplayName,
                    target.Email = source.Email,
                    target.IsActive = CAST(1 AS bit),
                    target.UpdatedAtUtc = @now
                FROM [AppUser] target
                INNER JOIN @seedUsers source ON source.UserName = target.UserName
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [AppUser] existing
                    WHERE existing.ExternalSubject = source.ExternalSubject
                );

                INSERT INTO [AppUser] ([Id], [ExternalSubject], [UserName], [DisplayName], [Email], [IsActive], [LastSeenAtUtc], [CreatedAtUtc], [UpdatedAtUtc])
                SELECT source.AppUserId, source.ExternalSubject, source.UserName, source.DisplayName, source.Email, CAST(1 AS bit), NULL, @now, @now
                FROM @seedUsers source
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [AppUser] existing
                    WHERE existing.ExternalSubject = source.ExternalSubject
                       OR existing.UserName = source.UserName
                );

                UPDATE assignment
                SET
                    assignment.ScopeType = N'centre',
                    assignment.CentreId = @brureeCentreId,
                    assignment.UnitId = NULL,
                    assignment.IsActive = CAST(1 AS bit),
                    assignment.UpdatedAtUtc = @now
                FROM [AppUserRoleAssignment] assignment
                INNER JOIN [AppUser] appUser ON appUser.Id = assignment.AppUserId
                INNER JOIN @seedUsers source ON source.ExternalSubject = appUser.ExternalSubject
                WHERE assignment.AppRoleId = @platformAdminRoleId
                  AND assignment.UnitId IS NULL;

                INSERT INTO [AppUserRoleAssignment] ([Id], [AppUserId], [AppRoleId], [ScopeType], [CentreId], [UnitId], [IsActive], [CreatedAtUtc], [UpdatedAtUtc])
                SELECT NEWID(), appUser.Id, @platformAdminRoleId, N'centre', @brureeCentreId, NULL, CAST(1 AS bit), @now, @now
                FROM @seedUsers source
                INNER JOIN [AppUser] appUser ON appUser.ExternalSubject = source.ExternalSubject
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [AppUserRoleAssignment] assignment
                    WHERE assignment.AppUserId = appUser.Id
                      AND assignment.AppRoleId = @platformAdminRoleId
                      AND assignment.ScopeType = N'centre'
                      AND assignment.CentreId = @brureeCentreId
                      AND assignment.UnitId IS NULL
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE assignment
                FROM [AppUserRoleAssignment] assignment
                INNER JOIN [AppUser] appUser ON appUser.Id = assignment.AppUserId
                WHERE appUser.ExternalSubject IN (
                    N'63ecf7f3-a6b1-44e9-b2d1-07311d08c822',
                    N'74490338-3232-4663-93dc-f6ecae1acfef'
                )
                  AND assignment.AppRoleId = '66666666-1111-1111-1111-111111111111';
                """);
        }
    }
}
