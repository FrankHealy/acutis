using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedDetoxAdmissionLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
DECLARE @Resources TABLE ([Key] nvarchar(450) NOT NULL, [DefaultText] nvarchar(max) NOT NULL);

INSERT INTO @Resources ([Key], [DefaultText])
VALUES
    (N'admission.detox.form.title', N'Detox Admission Form'),
    (N'admission.detox.form.description', N'Capture detox admission, consent, substance use, health, safety and assessor action details.'),
    (N'admission.detox.section.01.title', N'Personal, Referral and GP Details'),
    (N'admission.detox.section.02.title', N'Family, Social Support and Emergency Contacts'),
    (N'admission.detox.section.03.title', N'Housing and Accommodation'),
    (N'admission.detox.section.04.title', N'Consent and Assessment Signatures'),
    (N'admission.detox.section.05.title', N'Substance Use and Treatment History'),
    (N'admission.detox.section.06.title', N'Alcohol Use History'),
    (N'admission.detox.section.07.title', N'Physical Health'),
    (N'admission.detox.section.08.title', N'Sexual Health and Wellbeing'),
    (N'admission.detox.section.09.title', N'Mental Health'),
    (N'admission.detox.section.10.title', N'Safety, Justice and Additional Comments'),
    (N'admission.detox.section.11.title', N'Happiness Scale'),
    (N'admission.detox.section.12.title', N'Assessor Actions Required'),
    (N'admission.error.camera_unavailable', N'Camera capture is not available in this browser. Please upload a photo instead.'),
    (N'admission.error.camera_secure_context', N'Camera permission prompts require HTTPS or localhost. Open the app on a secure address, or upload a photo instead.');

MERGE [TextResource] AS target
USING @Resources AS source
ON target.[Key] = source.[Key]
WHEN MATCHED THEN
    UPDATE SET
        [DefaultText] = source.[DefaultText],
        [UpdatedAtUtc] = SYSUTCDATETIME(),
        [UpdatedByUserId] = '00000000-0000-0000-0000-000000000000'
WHEN NOT MATCHED THEN
    INSERT ([Key], [DefaultText], [CreatedAtUtc], [CreatedByUserId], [UpdatedAtUtc], [UpdatedByUserId])
    VALUES (source.[Key], source.[DefaultText], SYSUTCDATETIME(), '00000000-0000-0000-0000-000000000000', SYSUTCDATETIME(), '00000000-0000-0000-0000-000000000000');
""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
DELETE FROM [TextResource]
WHERE [Key] IN (
    N'admission.detox.form.title',
    N'admission.detox.form.description',
    N'admission.detox.section.01.title',
    N'admission.detox.section.02.title',
    N'admission.detox.section.03.title',
    N'admission.detox.section.04.title',
    N'admission.detox.section.05.title',
    N'admission.detox.section.06.title',
    N'admission.detox.section.07.title',
    N'admission.detox.section.08.title',
    N'admission.detox.section.09.title',
    N'admission.detox.section.10.title',
    N'admission.detox.section.11.title',
    N'admission.detox.section.12.title',
    N'admission.error.camera_unavailable',
    N'admission.error.camera_secure_context'
);
""");
        }
    }
}
