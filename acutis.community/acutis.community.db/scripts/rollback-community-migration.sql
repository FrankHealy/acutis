:setvar TargetDatabase "AcutisCommunity"
:setvar CommunityTenantId "22222222-2222-4222-8222-222222222220"
SET XACT_ABORT ON;
DECLARE @TenantId uniqueidentifier='$(CommunityTenantId)';
BEGIN TRANSACTION;
DELETE FROM [$(TargetDatabase)].dbo.CarePlans WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Assessments WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Appointments WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Participants WHERE TenantId=@TenantId;
DELETE FROM [$(TargetDatabase)].dbo.Tenants WHERE Id=@TenantId;
COMMIT TRANSACTION;
