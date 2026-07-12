using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Acutis.Infrastructure.Data;

#nullable disable

namespace Acutis.Infrastructure.Migrations;

[DbContext(typeof(AcutisDbContext))]
[Migration("20260711170000_SeedVideoConsultationLocalization")]
public partial class SeedVideoConsultationLocalization : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
DECLARE @Resources TABLE ([Key] nvarchar(200) NOT NULL, [DefaultText] nvarchar(1000) NOT NULL, [ArabicText] nvarchar(1000) NOT NULL);
INSERT INTO @Resources ([Key], [DefaultText], [ArabicText]) VALUES
(N'video_consultation.brand', N'Acutis Practitioner', N'أكيوتيس للممارسين'),
(N'video_consultation.title', N'Video consultation', N'استشارة عبر الفيديو'),
(N'video_consultation.ended.title', N'Consultation ended', N'انتهت الاستشارة'),
(N'video_consultation.ended.description', N'You can safely close this window.', N'يمكنك إغلاق هذه النافذة بأمان.'),
(N'video_consultation.context.with_practitioner', N'With {{name}}', N'مع {{name}}'),
(N'video_consultation.error.join', N'Unable to join the consultation. The invitation may be expired, revoked, cancelled or already ended.', N'تعذر الانضمام إلى الاستشارة. قد تكون الدعوة منتهية الصلاحية أو ملغاة أو قد تكون الاستشارة قد انتهت.'),
(N'video_consultation.error.device_permission', N'Camera or microphone permission was not granted. Check your browser and device settings.', N'لم يتم منح إذن الكاميرا أو الميكروفون. تحقق من إعدادات المتصفح والجهاز.'),
(N'video_consultation.label.practitioner', N'Practitioner', N'الممارس'),
(N'video_consultation.label.confirm_display_name', N'Confirm your display name', N'أكد اسم العرض الخاص بك'),
(N'video_consultation.action.join', N'Join consultation', N'الانضمام إلى الاستشارة'),
(N'video_consultation.device.microphone', N'Microphone', N'الميكروفون'),
(N'video_consultation.device.camera', N'Camera', N'الكاميرا'),
(N'video_consultation.device.speaker', N'Speaker', N'مكبر الصوت'),
(N'video_consultation.status.connecting', N'Connecting…', N'جارٍ الاتصال…'),
(N'video_consultation.status.connected', N'Connected', N'متصل'),
(N'video_consultation.status.reconnecting', N'Reconnecting…', N'جارٍ إعادة الاتصال…'),
(N'video_consultation.status.waiting', N'Waiting for the other participant…', N'في انتظار المشارك الآخر…');

MERGE [TextResource] AS target
USING @Resources AS source ON target.[Key] = source.[Key]
WHEN MATCHED THEN UPDATE SET [DefaultText] = source.[DefaultText], [UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT ([Key], [DefaultText]) VALUES (source.[Key], source.[DefaultText]);

MERGE [TextTranslation] AS target
USING (SELECT [Key], N'ar' AS [Locale], [ArabicText] AS [Text] FROM @Resources) AS source
ON target.[Key] = source.[Key] AND target.[Locale] = source.[Locale]
WHEN MATCHED THEN UPDATE SET [Text] = source.[Text], [UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT ([Id], [Key], [Locale], [Text]) VALUES (NEWID(), source.[Key], source.[Locale], source.[Text]);
""");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
DELETE FROM [TextTranslation] WHERE [Key] LIKE N'video_consultation.%';
DELETE FROM [TextResource] WHERE [Key] LIKE N'video_consultation.%';
""");
    }
}
