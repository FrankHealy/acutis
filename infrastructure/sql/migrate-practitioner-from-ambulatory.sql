:setvar SourceDatabase "Acutis_Ambulatory_IE_Dev"
:setvar TargetDatabase "AcutisPractitioner"
:setvar PractitionerTenantId "11111111-1111-4111-8111-111111111110"

SET XACT_ABORT ON;
SET NOCOUNT ON;

DECLARE @TenantId uniqueidentifier = '$(PractitionerTenantId)';
DECLARE @ExpectedClients int = (SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryParticipant WHERE ProgrammeType = N'Practitioner');
DECLARE @ExpectedAppointments int = (SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryAppointment WHERE ProgrammeType = N'Practitioner');
DECLARE @ExpectedAssessments int = (SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryAssessment a JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=a.ParticipantId WHERE p.ProgrammeType=N'Practitioner');
DECLARE @ExpectedCarePlans int = (SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.AmbulatoryCarePlan c JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=c.ParticipantId WHERE p.ProgrammeType=N'Practitioner');
DECLARE @ExpectedConsultations int = (SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.VideoConsultation v JOIN [$(SourceDatabase)].dbo.AmbulatoryAppointment a ON a.Id=v.AppointmentId WHERE a.ProgrammeType=N'Practitioner');
DECLARE @ExpectedInvitations int = (SELECT COUNT(*) FROM [$(SourceDatabase)].dbo.VideoConsultationInvitation i JOIN [$(SourceDatabase)].dbo.VideoConsultation v ON v.Id=i.VideoConsultationId JOIN [$(SourceDatabase)].dbo.AmbulatoryAppointment a ON a.Id=v.AppointmentId WHERE a.ProgrammeType=N'Practitioner');

SELECT @ExpectedClients Clients, @ExpectedAppointments Appointments, @ExpectedAssessments Assessments, @ExpectedCarePlans CarePlans, @ExpectedConsultations VideoConsultations, @ExpectedInvitations VideoInvitations;

BEGIN TRANSACTION;
IF NOT EXISTS (SELECT 1 FROM [$(TargetDatabase)].dbo.Tenants WHERE Id=@TenantId)
    INSERT [$(TargetDatabase)].dbo.Tenants(Id,OrganisationName,IsDemo) VALUES(@TenantId,N'Acutis Practitioner Migration',0);

INSERT [$(TargetDatabase)].dbo.Clients(Id,TenantId,DisplayName,PreferredName,Phone,Email,ReferralSource,Status,PractitionerSubject,PractitionerDisplayName,CreatedAtUtc,UpdatedAtUtc)
SELECT p.Id,@TenantId,p.DisplayName,p.PreferredName,p.Phone,p.Email,p.ReferralSource,p.Status,p.CounsellorUserId,p.CounsellorDisplayName,p.CreatedAtUtc,p.UpdatedAtUtc
FROM [$(SourceDatabase)].dbo.AmbulatoryParticipant p
WHERE p.ProgrammeType=N'Practitioner' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Clients t WHERE t.Id=p.Id);

INSERT [$(TargetDatabase)].dbo.Appointments(Id,TenantId,ClientId,PractitionerSubject,PractitionerDisplayName,AppointmentType,Title,StartsAtUtc,EndsAtUtc,DeliveryMode,Status,Notes,CreatedAtUtc,UpdatedAtUtc)
SELECT a.Id,@TenantId,a.ParticipantId,a.CounsellorUserId,a.CounsellorDisplayName,a.AppointmentType,a.Title,a.StartsAtUtc,a.EndsAtUtc,a.DeliveryMode,a.Status,a.Notes,a.CreatedAtUtc,a.UpdatedAtUtc
FROM [$(SourceDatabase)].dbo.AmbulatoryAppointment a
WHERE a.ProgrammeType=N'Practitioner' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Appointments t WHERE t.Id=a.Id);

INSERT [$(TargetDatabase)].dbo.Assessments(Id,TenantId,ClientId,AssessmentType,CaptureJson,CompletedAtUtc,CompletedBySubject)
SELECT a.Id,@TenantId,a.ParticipantId,a.AssessmentType,(SELECT a.PresentingNeeds,a.RiskSummary,a.Strengths,a.SubstanceOrBehaviourSummary,a.GoalsDiscussed,a.Outcome FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),a.CompletedAtUtc,a.CompletedByUserId
FROM [$(SourceDatabase)].dbo.AmbulatoryAssessment a JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=a.ParticipantId
WHERE p.ProgrammeType=N'Practitioner' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.Assessments t WHERE t.Id=a.Id);

INSERT [$(TargetDatabase)].dbo.CarePlans(Id,TenantId,ClientId,Status,CaptureJson,ReviewDate,CreatedAtUtc,UpdatedAtUtc)
SELECT c.Id,@TenantId,c.ParticipantId,c.Status,(SELECT c.Needs,c.Strengths,c.Risks,c.Goals,c.Actions,c.ReviewNotes,c.CreatedByUserId,c.UpdatedByUserId FOR JSON PATH,WITHOUT_ARRAY_WRAPPER),c.ReviewDate,c.CreatedAtUtc,c.UpdatedAtUtc
FROM [$(SourceDatabase)].dbo.AmbulatoryCarePlan c JOIN [$(SourceDatabase)].dbo.AmbulatoryParticipant p ON p.Id=c.ParticipantId
WHERE p.ProgrammeType=N'Practitioner' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.CarePlans t WHERE t.Id=c.Id);

INSERT [$(TargetDatabase)].dbo.VideoConsultations(Id,TenantId,AppointmentId,RoomName,Status,CreatedAtUtc,StartedAtUtc,EndedAtUtc)
SELECT v.Id,@TenantId,v.AppointmentId,v.RoomName,v.Status,v.CreatedAtUtc,v.StartedAtUtc,v.EndedAtUtc
FROM [$(SourceDatabase)].dbo.VideoConsultation v JOIN [$(SourceDatabase)].dbo.AmbulatoryAppointment a ON a.Id=v.AppointmentId
WHERE a.ProgrammeType=N'Practitioner' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.VideoConsultations t WHERE t.Id=v.Id);

INSERT [$(TargetDatabase)].dbo.VideoInvitations(Id,TenantId,VideoConsultationId,TokenHash,ExpiresAtUtc,RevokedAtUtc,UsedAtUtc,CreatedAtUtc)
SELECT i.Id,@TenantId,i.VideoConsultationId,i.TokenHash,i.ExpiresAtUtc,i.RevokedAtUtc,i.UsedAtUtc,i.CreatedAtUtc
FROM [$(SourceDatabase)].dbo.VideoConsultationInvitation i JOIN [$(SourceDatabase)].dbo.VideoConsultation v ON v.Id=i.VideoConsultationId JOIN [$(SourceDatabase)].dbo.AmbulatoryAppointment a ON a.Id=v.AppointmentId
WHERE a.ProgrammeType=N'Practitioner' AND NOT EXISTS(SELECT 1 FROM [$(TargetDatabase)].dbo.VideoInvitations t WHERE t.Id=i.Id);

IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.Clients WHERE TenantId=@TenantId)<>@ExpectedClients THROW 51000,'Practitioner client count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.Appointments WHERE TenantId=@TenantId)<>@ExpectedAppointments THROW 51000,'Practitioner appointment count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.Assessments WHERE TenantId=@TenantId)<>@ExpectedAssessments THROW 51000,'Practitioner assessment count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.CarePlans WHERE TenantId=@TenantId)<>@ExpectedCarePlans THROW 51000,'Practitioner care-plan count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.VideoConsultations WHERE TenantId=@TenantId)<>@ExpectedConsultations THROW 51000,'Practitioner consultation count verification failed.',1;
IF (SELECT COUNT(*) FROM [$(TargetDatabase)].dbo.VideoInvitations WHERE TenantId=@TenantId)<>@ExpectedInvitations THROW 51000,'Practitioner invitation count verification failed.',1;
COMMIT TRANSACTION;

SELECT N'Verified' Result,@ExpectedClients Clients,@ExpectedAppointments Appointments,@ExpectedAssessments Assessments,@ExpectedCarePlans CarePlans,@ExpectedConsultations VideoConsultations,@ExpectedInvitations VideoInvitations;
