:setvar SourceDatabase "Acutis_Ambulatory_IE_Dev"
:setvar TargetDatabase "AcutisCommunity"
:setvar CommunityTenantId "22222222-2222-4222-8222-222222222220"

SET XACT_ABORT ON;
SET NOCOUNT ON;
DECLARE @TenantId uniqueidentifier='$(CommunityTenantId)';
DECLARE @Participants int=(SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryParticipant WHERE ProgrammeType=N'Community');
DECLARE @Appointments int=(SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryAppointment WHERE ProgrammeType=N'Community');
DECLARE @Assessments int=(SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryAssessment a JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=a.ParticipantId WHERE p.ProgrammeType=N'Community');
DECLARE @CarePlans int=(SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryCarePlan c JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=c.ParticipantId WHERE p.ProgrammeType=N'Community');
SELECT @Participants Participants,@Appointments Appointments,@Assessments Assessments,@CarePlans CarePlans;

BEGIN TRANSACTION;
IF NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Tenants WHERE Id=@TenantId)
  INSERT [$(TargetDatabase)].dbo.Tenants(Id,OrganisationName,IsDemo) VALUES(@TenantId,N'Acutis Community Migration',0);

INSERT [$(TargetDatabase)].dbo.Participants(Id,TenantId,DisplayName,PreferredName,Phone,Email,ReferralSource,Status,StaffSubject,StaffDisplayName,CreatedAtUtc,UpdatedAtUtc)
SELECT p.Id,@TenantId,p.DisplayName,p.PreferredName,p.Phone,p.Email,p.ReferralSource,p.Status,p.CounsellorUserId,p.CounsellorDisplayName,p.CreatedAtUtc,p.UpdatedAtUtc
FROM [$(SourceDatabase)].dbo.AmbulatoryParticipant p
WHERE p.ProgrammeType=N'Community' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Participants t WHERE t.Id=p.Id);

INSERT [$(TargetDatabase)].dbo.Appointments(Id,TenantId,ParticipantId,StaffSubject,StaffDisplayName,AppointmentType,Title,StartsAtUtc,EndsAtUtc,DeliveryMode,Status,Notes,CreatedAtUtc,UpdatedAtUtc)
SELECT a.Id,@TenantId,a.ParticipantId,a.CounsellorUserId,a.CounsellorDisplayName,a.AppointmentType,a.Title,a.StartsAtUtc,a.EndsAtUtc,a.DeliveryMode,a.Status,a.Notes,a.CreatedAtUtc,a.UpdatedAtUtc
FROM [$(SourceDatabase)].dbo.AmbulatoryAppointment a
WHERE a.ProgrammeType=N'Community' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Appointments t WHERE t.Id=a.Id);

INSERT [$(TargetDatabase)].dbo.Assessments(Id,TenantId,ParticipantId,AssessmentType,CaptureJson,CompletedAtUtc,CompletedBySubject)
SELECT a.Id,@TenantId,a.ParticipantId,a.AssessmentType,(SELECT a.PresentingNeeds,a.RiskSummary,a.Strengths,a.SubstanceOrBehaviourSummary,a.GoalsDiscussed,a.Outcome FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),a.CompletedAtUtc,a.CompletedByUserId
FROM [$(SourceDatabase)].dbo.AmbulatoryAssessment a JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=a.ParticipantId
WHERE p.ProgrammeType=N'Community' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Assessments t WHERE t.Id=a.Id);

INSERT [$(TargetDatabase)].dbo.CarePlans(Id,TenantId,ParticipantId,Status,CaptureJson,ReviewDate,CreatedAtUtc,UpdatedAtUtc)
SELECT c.Id,@TenantId,c.ParticipantId,c.Status,(SELECT c.Needs,c.Strengths,c.Risks,c.Goals,c.Actions,c.ReviewNotes,c.CreatedByUserId,c.UpdatedByUserId FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),c.ReviewDate,c.CreatedAtUtc,c.UpdatedAtUtc
FROM [$(SourceDatabase)].dbo.AmbulatoryCarePlan c JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=c.ParticipantId
WHERE p.ProgrammeType=N'Community' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.CarePlans t WHERE t.Id=c.Id);

IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.Participants WHERE TenantId=@TenantId)<>@Participants THROW 51000,'Community participant count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.Appointments WHERE TenantId=@TenantId)<>@Appointments THROW 51000,'Community appointment count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.Assessments WHERE TenantId=@TenantId)<>@Assessments THROW 51000,'Community assessment count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.CarePlans WHERE TenantId=@TenantId)<>@CarePlans THROW 51000,'Community care-plan count verification failed.',1;
COMMIT TRANSACTION;
SELECT N'Verified' Result,@Participants Participants,@Appointments Appointments,@Assessments Assessments,@CarePlans CarePlans;
