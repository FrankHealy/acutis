:setvar DeploymentEnvironment "Development"
:setvar PractitionerDatabase "AcutisPractitioner"
:setvar CommunityDatabase "AcutisCommunity"
:setvar DemoSubject "frankh"
IF '$(DeploymentEnvironment)' IN ('Production','Prod') THROW 51000,'Demo seeds are forbidden in production.',1;
DECLARE @PractitionerTenant uniqueidentifier='11111111-1111-4111-8111-111111111111';
DECLARE @CommunityTenant uniqueidentifier='22222222-2222-4222-8222-222222222222';
IF NOT EXISTS(SELECT 1 FROM [$(PractitionerDatabase)].dbo.Tenants WHERE Id=@PractitionerTenant) INSERT [$(PractitionerDatabase)].dbo.Tenants VALUES(@PractitionerTenant,N'Acutis Practitioner Demo',1);
IF NOT EXISTS(SELECT 1 FROM [$(PractitionerDatabase)].dbo.Memberships WHERE TenantId=@PractitionerTenant AND ExternalSubject=N'$(DemoSubject)') INSERT [$(PractitionerDatabase)].dbo.Memberships(Id,TenantId,ExternalSubject,RolesJson,IsActive) VALUES('11111111-1111-4111-8111-111111111112',@PractitionerTenant,N'$(DemoSubject)',N'["Practitioner"]',1);
IF NOT EXISTS(SELECT 1 FROM [$(PractitionerDatabase)].dbo.Branding WHERE TenantId=@PractitionerTenant) INSERT [$(PractitionerDatabase)].dbo.Branding(TenantId,ThemeJson,TerminologyJson,FeatureFlagsJson,PoweredByAcutis) VALUES(@PractitionerTenant,N'{"primary":"#2563eb","secondary":"#0891b2"}',N'{}',N'{"demoBanner":true}',1);
IF NOT EXISTS(SELECT 1 FROM [$(CommunityDatabase)].dbo.Tenants WHERE Id=@CommunityTenant) INSERT [$(CommunityDatabase)].dbo.Tenants VALUES(@CommunityTenant,N'Acutis Community Demo',1);
IF NOT EXISTS(SELECT 1 FROM [$(CommunityDatabase)].dbo.Memberships WHERE TenantId=@CommunityTenant AND ExternalSubject=N'$(DemoSubject)') INSERT [$(CommunityDatabase)].dbo.Memberships(Id,TenantId,ExternalSubject,RolesJson,IsActive) VALUES('22222222-2222-4222-8222-222222222223',@CommunityTenant,N'$(DemoSubject)',N'["CommunityManager"]',1);
SELECT N'Demo tenants seeded' Result;
