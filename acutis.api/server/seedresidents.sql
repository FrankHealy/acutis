SET NOCOUNT ON;

-- Countries (IE, UK, PL, US, CA, LT)
MERGE dbo.Country AS t
USING (VALUES
  ('IE','Ireland','Irish'),
  ('UK','United Kingdom','British'),
  ('PL','Poland','Polish'),
  ('US','United States','American'),
  ('CA','Canada','Canadian'),
  ('LT','Lithuania','Lithuanian')
) AS s(CountryCode, CountryName, Demonym)
ON t.CountryCode = s.CountryCode
WHEN NOT MATCHED THEN
  INSERT (Id, CountryCode, CountryName, Demonym) VALUES (NEWID(), s.CountryCode, s.CountryName, s.Demonym);

DECLARE @IE uniqueidentifier = (SELECT Id FROM dbo.Country WHERE CountryCode='IE');

-- 32 Irish counties
;WITH CountyList AS (
  SELECT v.Name
  FROM (VALUES
    ('Antrim'),('Armagh'),('Carlow'),('Cavan'),('Clare'),('Cork'),
    ('Derry'),('Donegal'),('Down'),('Dublin'),('Fermanagh'),('Galway'),
    ('Kerry'),('Kildare'),('Kilkenny'),('Laois'),('Leitrim'),('Limerick'),
    ('Longford'),('Louth'),('Mayo'),('Meath'),('Monaghan'),('Offaly'),
    ('Roscommon'),('Sligo'),('Tipperary'),('Tyrone'),('Waterford'),
    ('Westmeath'),('Wexford'),('Wicklow')
  ) v(Name)
)
INSERT INTO dbo.County (Id, Name, CountryId)
SELECT NEWID(), c.Name, @IE
FROM CountyList c
WHERE NOT EXISTS (SELECT 1 FROM dbo.County x WHERE x.Name = c.Name AND x.CountryId = @IE);

-- Lookup: AddictionType (optional), Addiction, ProbationType, ReligiousAffiliation, MedicalInsuranceProvider, DocumentType
MERGE dbo.AddictionType AS t
USING (VALUES ('Substance'),('Behavioural')) s(Name)
ON t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Id, Name) VALUES (NEWID(), s.Name);

DECLARE @TypeSub uniqueidentifier = (SELECT Id FROM dbo.AddictionType WHERE Name='Substance');
DECLARE @TypeBeh uniqueidentifier = (SELECT Id FROM dbo.AddictionType WHERE Name='Behavioural');

MERGE dbo.Addiction AS t
USING (VALUES
  ('Alcohol', @TypeSub),
  ('Cocaine', @TypeSub),
  ('Gambling', @TypeBeh)
) s(Name, AddictionTypeId)
ON t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Id, Name, AddictionTypeId) VALUES (NEWID(), s.Name, s.AddictionTypeId);

MERGE dbo.ProbationType AS t
USING (VALUES ('Curfew'), ('Weekly Check-in')) s(Name)
ON t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Id, Name) VALUES (NEWID(), s.Name);

MERGE dbo.ReligiousAffiliation AS t
USING (VALUES ('Catholic'), ('Protestant'), ('None')) s(Name)
ON t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Id, Name) VALUES (NEWID(), s.Name);

MERGE dbo.MedicalInsuranceProvider AS t
USING (VALUES ('VHI'), ('Irish Life')) s(Name)
ON t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Id, Name) VALUES (NEWID(), s.Name);

MERGE dbo.DocumentType AS t
USING (VALUES ('ID'), ('Passport'), ('Medical Letter'), ('Consent Form')) s(Name)
ON t.Name = s.Name
WHEN NOT MATCHED THEN INSERT (Id, Name) VALUES (NEWID(), s.Name);

-- Ensure at least 60 addresses (Ireland)
DECLARE @ExistingAddr int = (SELECT COUNT(*) FROM dbo.Address);
IF @ExistingAddr < 60
BEGIN
  ;WITH N(n) AS (
    SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10
  ),
  Tally(i) AS (
    SELECT TOP (60 - @ExistingAddr) ROW_NUMBER() OVER (ORDER BY (SELECT NULL))
    FROM N a CROSS JOIN N b CROSS JOIN N c CROSS JOIN N d
  )
  INSERT INTO dbo.Address (Id, Line1, Line2, City, CountyId, PostCode, CountryId)
  SELECT
    NEWID(),
    CONCAT('Seed ', i, ' Main Street'),
    NULL,
    c.Name,
    c.Id,
    CASE WHEN LEFT(c.Name,1)='D' THEN 'D01' ELSE CONCAT('X', RIGHT(CONCAT('0', i % 100), 2)) END,
    @IE
  FROM Tally t
  CROSS APPLY (SELECT TOP 1 Id, Name FROM dbo.County WHERE CountryId=@IE ORDER BY NEWID()) c;
END;

-- Rooms: 50 total (30 Alcohol, 10 Drugs, 10 Detox)
IF NOT EXISTS (SELECT 1 FROM dbo.Room)
BEGIN
  DECLARE @i int = 1;
  WHILE @i <= 50
  BEGIN
    DECLARE @RoomType nvarchar(20) =
      CASE
        WHEN @i <= 30 THEN 'Alcohol'
        WHEN @i <= 40 THEN 'Drugs'
        ELSE 'Detox'
      END;

    INSERT INTO dbo.Room (Id, RoomNumber, RoomType, NumberOfResidents, IsOpiateDetox, IsQuarantine, HasOwnWC)
    VALUES (NEWID(), CONCAT('R', RIGHT(CONCAT('00', @i), 3)), @RoomType,
            CASE WHEN @RoomType='Detox' THEN 1 ELSE 1 + ABS(CHECKSUM(NEWID())) % 3 END,
            CASE WHEN @RoomType='Detox' AND ABS(CHECKSUM(NEWID()))%2=0 THEN 1 ELSE 0 END,
            CASE WHEN @RoomType='Detox' AND ABS(CHECKSUM(NEWID()))%5=0 THEN 1 ELSE 0 END,
            CASE WHEN ABS(CHECKSUM(NEWID()))%5=0 THEN 1 ELSE 0 END);
    SET @i += 1;
  END
END;

-- Residents: 60 male, age 20..66, linked to addresses and lookups
DECLARE @AlcoholId uniqueidentifier = (SELECT Id FROM dbo.Addiction WHERE Name='Alcohol');
DECLARE @RelCath uniqueidentifier = (SELECT Id FROM dbo.ReligiousAffiliation WHERE Name='Catholic');

;WITH N(n) AS (
  SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
  SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
),
Nums(i) AS (
  SELECT TOP (60) ROW_NUMBER() OVER (ORDER BY (SELECT NULL))
  FROM N a CROSS JOIN N b CROSS JOIN N c CROSS JOIN N d CROSS JOIN N e CROSS JOIN N f
),
NameFirst(i, FirstName) AS (
  SELECT i, CASE (i-1) % 10
    WHEN 0 THEN 'John' WHEN 1 THEN 'Michael' WHEN 2 THEN 'David' WHEN 3 THEN 'James' WHEN 4 THEN 'Robert'
    WHEN 5 THEN 'Daniel' WHEN 6 THEN 'Mark' WHEN 7 THEN 'Paul' WHEN 8 THEN 'Kevin' ELSE 'Brian' END
  FROM Nums
),
NameLast(i, Surname) AS (
  SELECT i, CASE (i-1) % 10
    WHEN 0 THEN 'Murphy' WHEN 1 THEN 'Kelly' WHEN 2 THEN 'Byrne' WHEN 3 THEN 'Ryan' WHEN 4 THEN 'OBrien'
    WHEN 5 THEN 'Walsh' WHEN 6 THEN 'OSullivan' WHEN 7 THEN 'Doyle' WHEN 8 THEN 'McCarthy' ELSE 'Gallagher' END
  FROM Nums
),
Ages(i, Age) AS (
  SELECT i, 20 + ((i-1) % 47) FROM Nums -- 20..66 inclusive
)
INSERT INTO dbo.Resident
(
  Id, SocialSecurityNumber, DateOfAdmission, DateOfBirth,
  FirstName, MiddleName, Surname, Alias,
  IsPreviousResident, Sex,
  AddressId, CountryId, ReligiousAffiliationId,
  HasProbationRequirement, ProbationRequirementId,
  HasMedicalCard, MedicalCardNumber,
  HasPrivateInsurance, PrivateMedicalInsuranceProviderId, PrivateMedicalInsuranceNumber,
  HasMobilityIssue, PrimaryAddictionId,
  PhoneNumber, EmailAddress,
  PhotoDeclined, PhotoDeclinedReason,
  IsAdmissionFormComplete, AdmissionFormCompletedBy, AdmissionFormCompletedAt,
  AdmissionPhase, DataQuality, PreferredStepDownHouse,
  NeedsReview, IsCompleted, CompletedBy, CompletedAt,
  QuestionnairesJson, RoomNumber
)
SELECT
  NEWID(),
  CONCAT('PPSN', RIGHT(CONCAT('0000', 1000 + n.i), 4), 'A'),
  CAST(GETDATE() AS datetime2),
  DATEADD(day, -ABS(CHECKSUM(NEWID())) % 365, DATEADD(year, -a.Age, CAST(GETDATE() AS date))),
  f.FirstName, NULL, l.Surname, NULL,
  0, 'Male',
  addr.Id, @IE, @RelCath,
  0, NULL,
  0, NULL,
  0, NULL, NULL,
  0, @AlcoholId,
  CONCAT('08', RIGHT(CONCAT('00000000', ABS(CHECKSUM(NEWID())) % 100000000), 8)),
  LOWER(CONCAT(LEFT(f.FirstName,1), l.Surname, n.i, '@example.com')),
  0, NULL,
  0, NULL, NULL,
  'Intake', 'Draft', 'None',
  0, 0, NULL, NULL,
  NULL, NULL
FROM Nums n
JOIN NameFirst f ON f.i = n.i
JOIN NameLast  l ON l.i = n.i
JOIN Ages      a ON a.i = n.i
CROSS APPLY (SELECT TOP 1 Id FROM dbo.Address ORDER BY NEWID()) addr;

-- Optional: add a simple arrival photo per resident (first 10)
INSERT INTO dbo.ResidentPhoto (Id, ResidentId, Url, IsPrimary)
SELECT TOP 10 NEWID(), r.Id, CONCAT('https://randomuser.me/api/portraits/men/', (ABS(CHECKSUM(NEWID()))%90)+1, '.jpg'), 1
FROM dbo.Resident r
WHERE NOT EXISTS (SELECT 1 FROM dbo.ResidentPhoto p WHERE p.ResidentId = r.Id);

-- Quick counts to verify
SELECT
  (SELECT COUNT(*) FROM dbo.Country)               AS Countries,
  (SELECT COUNT(*) FROM dbo.County)                AS Counties,
  (SELECT COUNT(*) FROM dbo.Address)               AS Addresses,
  (SELECT COUNT(*) FROM dbo.Room)                  AS Rooms,
  (SELECT COUNT(*) FROM dbo.Addiction)             AS Addictions,
  (SELECT COUNT(*) FROM dbo.ProbationType)         AS ProbationTypes,
  (SELECT COUNT(*) FROM dbo.ReligiousAffiliation)  AS ReligiousAffiliations,
  (SELECT COUNT(*) FROM dbo.MedicalInsuranceProvider) AS MedicalInsuranceProviders,
  (SELECT COUNT(*) FROM dbo.Resident)              AS Residents;
