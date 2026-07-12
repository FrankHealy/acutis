:setvar TargetDatabase "AcutisPractitioner"
:setvar PractitionerTenantId "11111111-1111-4111-8111-111111111110"
SET XACT_ABORT ON; BEGIN TRANSACTION;
DECLARE @TenantId uniqueidentifier='$(PractitionerTenantId)';
DELETE FROM [$(TargetDatabase)].dbo.VideoInvitations WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.VideoConsultations WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.FormResponses WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.FormAssignments WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.FormDefinitions WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Assessments WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.CarePlans WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Appointments WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Clients WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Memberships WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Branding WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.AuditEvents WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Tenants WHERE Id=@TenantId;
COMMIT TRANSACTION;
