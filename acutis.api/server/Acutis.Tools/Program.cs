using System.Net.Http;
using System.Text.RegularExpressions;
using Acutis.Infrastructure;
using Acutis.Infrastructure.Persistence;
using Acutis.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Data.SqlClient;

internal class Program
{
    private static async Task<int> Main(string[] args)
    {
        try
        {
            if (args.Length == 0)
            {
                PrintHelp();
                return 1;
            }

            var verb = args[0].ToLowerInvariant();
            var kv = ParseArgs(args.Skip(1));

            switch (verb)
            {
                case "seed-db":
                    await SeedDatabaseAsync(kv);
                    return 0;
                case "seed-residents":
                    await SeedResidentsAsync(kv);
                    return 0;
                case "init-schema":
                    await InitSchemaAsync(kv);
                    return 0;
                case "drop-tables":
                    await DropAllTablesAsync(kv);
                    return 0;
                case "reset-seed":
                    await ResetAndSeedAsync(kv);
                    return 0;
                case "download-photos":
                    await DownloadPhotosAsync(kv);
                    return 0;
                case "help":
                default:
                    PrintHelp();
                    return 1;
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error: {ex.Message}\n{ex}");
            return 2;
        }
    }

    private static void PrintHelp()
    {
        Console.WriteLine(@"Acutis.Tools

Usage:
  dotnet run --project Acutis.Tools -- seed-db [--connection <cn>] [--env Development]
  dotnet run --project Acutis.Tools -- seed-residents [--connection <cn>] [--count 25] [--sex Male] [--min-age 20] [--max-age 40]
  dotnet run --project Acutis.Tools -- init-schema [--connection <cn>]
  dotnet run --project Acutis.Tools -- drop-tables [--connection <cn>] [--force]
  dotnet run --project Acutis.Tools -- reset-seed [--connection <cn>] [--count 25] [--sex Male] [--min-age 20] [--max-age 40]
  dotnet run --project Acutis.Tools -- download-photos [--connection <cn>] [--sex Male] [--min-age 0] [--max-age 200] [--output photos]

Connection string order of precedence:
  --connection arg > ACUTIS_CONNECTION env var > appsettings (DefaultConnection | AcutisDatabase)

Examples:
  dotnet run --project Acutis.Tools -- seed-db
  dotnet run --project Acutis.Tools -- download-photos --sex Male --min-age 18 --max-age 35 --output photos
");
    }

    private static Dictionary<string, string> ParseArgs(IEnumerable<string> items)
    {
        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        string? pendingKey = null;
        foreach (var raw in items)
        {
            if (raw.StartsWith("--"))
            {
                pendingKey = raw.TrimStart('-');
                dict[pendingKey] = "true"; // flag default
            }
            else if (pendingKey != null)
            {
                dict[pendingKey] = raw;
                pendingKey = null;
            }
        }
        return dict;
    }

    private static IConfiguration BuildConfiguration(string? environment)
    {
        var env = environment ?? "Development";
        var builder = new ConfigurationBuilder();

        var candidates = new[]
        {
            Directory.GetCurrentDirectory(),
            AppContext.BaseDirectory,
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), ".."))
        };
        foreach (var basePath in candidates.Distinct())
        {
            var appsettings = Path.Combine(basePath, "Acutis.Api", "appsettings.json");
            var appsettingsEnv = Path.Combine(basePath, "Acutis.Api", $"appsettings.{env}.json");
            if (File.Exists(appsettings)) builder.AddJsonFile(appsettings, optional: true, reloadOnChange: false);
            if (File.Exists(appsettingsEnv)) builder.AddJsonFile(appsettingsEnv, optional: true, reloadOnChange: false);
        }

        builder.AddEnvironmentVariables();
        return builder.Build();
    }

    private static string ResolveConnectionString(IConfiguration config, IDictionary<string, string> args)
    {
        if (args.TryGetValue("connection", out var cn) && !string.IsNullOrWhiteSpace(cn))
            return cn;
        var envCn = Environment.GetEnvironmentVariable("ACUTIS_CONNECTION");
        if (!string.IsNullOrWhiteSpace(envCn)) return envCn!;
        var fromConfig = config.GetConnectionString("DefaultConnection")
                        ?? config.GetConnectionString("AcutisDatabase");
        if (string.IsNullOrWhiteSpace(fromConfig))
            throw new InvalidOperationException("No connection string found. Provide --connection or set ACUTIS_CONNECTION or appsettings.");
        return fromConfig!;
    }

    private static async Task SeedDatabaseAsync(IDictionary<string, string> args)
    {
        var environment = args.TryGetValue("env", out var env) ? env : Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";
        var config = BuildConfiguration(environment);
        var connection = ResolveConnectionString(config, args);

        using var loggerFactory = LoggerFactory.Create(b => b.AddConsole());
        var dataLogger = loggerFactory.CreateLogger("SeedData");

        // 1) Ensure main application schema (AppDbContext) is created and up-to-date
        var appOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connection)
            .Options;
        await using (var appDb = new AppDbContext(appOptions))
        {
            try
            {
                await appDb.Database.MigrateAsync();
                Console.WriteLine("AppDbContext migrations applied.");
                await SeedSupportDataAsync(appDb, dataLogger);
                await SeedRoomsAsync(connection, dataLogger);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Warning: failed to apply AppDbContext migrations: {ex.Message}");
            }
        }

        // 2) Create therapy schema (AcutisDbContext) tables if missing, then seed
        var therapyOptions = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseSqlServer(connection)
            .Options;
        await using (var therapyDb = new AcutisDbContext(therapyOptions))
        {
            try
            {
                var cs = therapyDb.Database.GetDbConnection().ConnectionString;
                Console.WriteLine($"AcutisDbContext connection resolved length: {cs?.Length ?? 0}");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Warning: could not inspect AcutisDbContext connection: {ex.Message}");
            }
            var haveTherapyTables = await TableExistsAsync(therapyDb, "Therapy", "TherapyTermRatings");
            if (!haveTherapyTables)
            {
                try
                {
                    // Try direct DDL creation via generated script
                    var ddl = therapyDb.Database.GenerateCreateScript();
                    ddl = PreprocessCreateScript(ddl);
                    await ExecuteSqlAsync(connection, ddl);
                    Console.WriteLine("AcutisDbContext tables created from model.");
                    haveTherapyTables = await TableExistsAsync(therapyDb, "Therapy", "TherapyTermRatings");
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Warning: failed creating therapy tables: {ex.Message}");
                }
            }

            try
            {
                await SeedTherapyBasicsAsync(therapyDb);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Skipping therapy seed due to error: {ex.Message}");
            }
        }

        Console.WriteLine("Database seeding completed.");
    }

    private static async Task ResetAndSeedAsync(IDictionary<string, string> args)
    {
        var environment = args.TryGetValue("env", out var env) ? env : Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";
        var config = BuildConfiguration(environment);
        var connection = ResolveConnectionString(config, args);

        if (!ConfirmDangerous(connection))
        {
            Console.WriteLine("Aborted by user.");
            return;
        }

        Console.WriteLine("Clearing all data (constraints temporarily disabled)...");
        await ResetDatabaseDataAsync(connection);
        Console.WriteLine("Data cleared. Seeding support, rooms, therapy basics, and residents...");

        await SeedDatabaseAsync(args);
        await SeedResidentsAsync(args);

        Console.WriteLine("Reset and seed completed.");
    }

    private static async Task InitSchemaAsync(IDictionary<string, string> args)
    {
        var environment = args.TryGetValue("env", out var env) ? env : Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";
        var config = BuildConfiguration(environment);
        var connection = ResolveConnectionString(config, args);

        var ddl = @"
-- Country
IF OBJECT_ID(N'[dbo].[Country]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Country](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [CountryCode] NVARCHAR(10) NOT NULL,
        [CountryName] NVARCHAR(100) NOT NULL,
        [Demonym] NVARCHAR(100) NULL
    );
END
GO

-- County
IF OBJECT_ID(N'[dbo].[County]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[County](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [CountryId] UNIQUEIDENTIFIER NOT NULL
    );
    ALTER TABLE [dbo].[County] ADD CONSTRAINT [FK_County_Country] FOREIGN KEY ([CountryId]) REFERENCES [dbo].[Country]([Id]);
END
GO

-- Address
IF OBJECT_ID(N'[dbo].[Address]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Address](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Line1] NVARCHAR(200) NOT NULL,
        [Line2] NVARCHAR(200) NULL,
        [City] NVARCHAR(100) NOT NULL,
        [CountyId] UNIQUEIDENTIFIER NOT NULL,
        [PostCode] NVARCHAR(20) NULL,
        [CountryId] UNIQUEIDENTIFIER NOT NULL
    );
    ALTER TABLE [dbo].[Address] ADD CONSTRAINT [FK_Address_County] FOREIGN KEY ([CountyId]) REFERENCES [dbo].[County]([Id]);
    ALTER TABLE [dbo].[Address] ADD CONSTRAINT [FK_Address_Country] FOREIGN KEY ([CountryId]) REFERENCES [dbo].[Country]([Id]);
END
GO

-- AddictionType
IF OBJECT_ID(N'[dbo].[AddictionType]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AddictionType](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL
    );
END
GO

-- Addiction
IF OBJECT_ID(N'[dbo].[Addiction]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Addiction](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [AddictionTypeId] UNIQUEIDENTIFIER NOT NULL
    );
    ALTER TABLE [dbo].[Addiction] ADD CONSTRAINT [FK_Addiction_AddictionType] FOREIGN KEY ([AddictionTypeId]) REFERENCES [dbo].[AddictionType]([Id]);
END
GO

-- ProbationType
IF OBJECT_ID(N'[dbo].[ProbationType]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProbationType](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL
    );
END
GO

-- ReligiousAffiliation
IF OBJECT_ID(N'[dbo].[ReligiousAffiliation]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ReligiousAffiliation](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL
    );
END
GO

-- MedicalInsuranceProvider
IF OBJECT_ID(N'[dbo].[MedicalInsuranceProvider]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[MedicalInsuranceProvider](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL
    );
END
GO

-- Room
IF OBJECT_ID(N'[dbo].[Room]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Room](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [RoomNumber] NVARCHAR(20) NOT NULL,
        [RoomType] NVARCHAR(20) NOT NULL,
        [NumberOfResidents] INT NOT NULL DEFAULT 0,
        [IsOpiateDetox] BIT NOT NULL DEFAULT 0,
        [IsQuarantine] BIT NOT NULL DEFAULT 0,
        [HasOwnWC] BIT NOT NULL DEFAULT 0
    );
END
GO

-- Resident
IF OBJECT_ID(N'[dbo].[Resident]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Resident](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [SocialSecurityNumber] NVARCHAR(50) NULL,
        [DateOfAdmission] DATETIME2 NOT NULL,
        [DateOfBirth] DATETIME2 NULL,
        [FirstName] NVARCHAR(100) NOT NULL,
        [MiddleName] NVARCHAR(100) NULL,
        [Surname] NVARCHAR(100) NOT NULL,
        [Alias] NVARCHAR(100) NULL,
        [IsPreviousResident] BIT NOT NULL DEFAULT 0,
        [Sex] NVARCHAR(20) NULL,
        [AddressId] UNIQUEIDENTIFIER NOT NULL,
        [CountryId] UNIQUEIDENTIFIER NOT NULL,
        [ReligiousAffiliationId] UNIQUEIDENTIFIER NULL,
        [ProbationTypeId] UNIQUEIDENTIFIER NULL,
        [PrimaryAddictionId] UNIQUEIDENTIFIER NOT NULL,
        [PhoneNumber] NVARCHAR(50) NULL,
        [EmailAddress] NVARCHAR(200) NULL,
        [NextOfKinFirstName] NVARCHAR(100) NULL,
        [NextOfKinSecondName] NVARCHAR(100) NULL,
        [NextOfKinPhoneNumber] NVARCHAR(50) NULL,
        [PhotoUrl] NVARCHAR(400) NULL,
        [ArrivalPhotoUrl] NVARCHAR(400) NULL,
        [DischargePhotoUrl] NVARCHAR(400) NULL,
        [PhotoDeclined] BIT NOT NULL DEFAULT 0,
        [PhotoDeclinedReason] NVARCHAR(200) NULL,
        [IsAdmissionFormComplete] BIT NOT NULL DEFAULT 0,
        [AdmissionFormCompletedBy] NVARCHAR(100) NULL,
        [AdmissionFormCompletedAt] DATETIME2 NULL,
        [QuestionnairesJson] NVARCHAR(MAX) NULL,
        [PreferredStepDownHouse] NVARCHAR(50) NULL,
        [RoomNumber] NVARCHAR(20) NULL,
        [HasMedicalCard] BIT NOT NULL DEFAULT 0,
        [MedicalCardNumber] NVARCHAR(50) NULL,
        [HasPrivateInsurance] BIT NOT NULL DEFAULT 0,
        [MedicalInsuranceProviderId] UNIQUEIDENTIFIER NULL
    );
    ALTER TABLE [dbo].[Resident] ADD CONSTRAINT [FK_Resident_Address] FOREIGN KEY ([AddressId]) REFERENCES [dbo].[Address]([Id]);
    ALTER TABLE [dbo].[Resident] ADD CONSTRAINT [FK_Resident_Country] FOREIGN KEY ([CountryId]) REFERENCES [dbo].[Country]([Id]);
    ALTER TABLE [dbo].[Resident] ADD CONSTRAINT [FK_Resident_ReligiousAffiliation] FOREIGN KEY ([ReligiousAffiliationId]) REFERENCES [dbo].[ReligiousAffiliation]([Id]);
    ALTER TABLE [dbo].[Resident] ADD CONSTRAINT [FK_Resident_ProbationType] FOREIGN KEY ([ProbationTypeId]) REFERENCES [dbo].[ProbationType]([Id]);
    ALTER TABLE [dbo].[Resident] ADD CONSTRAINT [FK_Resident_PrimaryAddiction] FOREIGN KEY ([PrimaryAddictionId]) REFERENCES [dbo].[Addiction]([Id]);
    ALTER TABLE [dbo].[Resident] ADD CONSTRAINT [FK_Resident_MedicalInsuranceProvider] FOREIGN KEY ([MedicalInsuranceProviderId]) REFERENCES [dbo].[MedicalInsuranceProvider]([Id]);
END
GO

-- ResidentAddiction (additional addictions)
IF OBJECT_ID(N'[dbo].[ResidentAddiction]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ResidentAddiction](
        [ResidentId] UNIQUEIDENTIFIER NOT NULL,
        [AddictionId] UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT [PK_ResidentAddiction] PRIMARY KEY ([ResidentId],[AddictionId])
    );
    ALTER TABLE [dbo].[ResidentAddiction] ADD CONSTRAINT [FK_ResidentAddiction_Resident] FOREIGN KEY ([ResidentId]) REFERENCES [dbo].[Resident]([Id]) ON DELETE CASCADE;
    ALTER TABLE [dbo].[ResidentAddiction] ADD CONSTRAINT [FK_ResidentAddiction_Addiction] FOREIGN KEY ([AddictionId]) REFERENCES [dbo].[Addiction]([Id]) ON DELETE CASCADE;
END
GO

-- DocumentType (satellite lookup)
IF OBJECT_ID(N'[dbo].[DocumentType]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[DocumentType](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL
    );
END
GO

-- ResidentDocument (satellite)
IF OBJECT_ID(N'[dbo].[ResidentDocument]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ResidentDocument](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [ResidentId] UNIQUEIDENTIFIER NOT NULL,
        [DocumentTypeId] UNIQUEIDENTIFIER NOT NULL,
        [Url] NVARCHAR(400) NOT NULL
    );
    ALTER TABLE [dbo].[ResidentDocument] ADD CONSTRAINT [FK_ResidentDocument_Resident] FOREIGN KEY ([ResidentId]) REFERENCES [dbo].[Resident]([Id]) ON DELETE CASCADE;
    ALTER TABLE [dbo].[ResidentDocument] ADD CONSTRAINT [FK_ResidentDocument_DocumentType] FOREIGN KEY ([DocumentTypeId]) REFERENCES [dbo].[DocumentType]([Id]);
END
GO

-- ResidentPhoto (satellite)
IF OBJECT_ID(N'[dbo].[ResidentPhoto]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ResidentPhoto](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [ResidentId] UNIQUEIDENTIFIER NOT NULL,
        [Url] NVARCHAR(400) NOT NULL,
        [IsPrimary] BIT NOT NULL DEFAULT 0
    );
    ALTER TABLE [dbo].[ResidentPhoto] ADD CONSTRAINT [FK_ResidentPhoto_Resident] FOREIGN KEY ([ResidentId]) REFERENCES [dbo].[Resident]([Id]) ON DELETE CASCADE;
END
GO

-- Prescription (satellite)
IF OBJECT_ID(N'[dbo].[Prescription]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Prescription](
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        [ResidentId] UNIQUEIDENTIFIER NOT NULL,
        [MedicationName] NVARCHAR(200) NOT NULL,
        [Dosage] NVARCHAR(100) NOT NULL,
        [Frequency] NVARCHAR(100) NOT NULL,
        [PrescribedBy] NVARCHAR(100) NOT NULL,
        [PrescribedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [Notes] NVARCHAR(MAX) NULL
    );
    ALTER TABLE [dbo].[Prescription] ADD CONSTRAINT [FK_Prescription_Resident] FOREIGN KEY ([ResidentId]) REFERENCES [dbo].[Resident]([Id]) ON DELETE CASCADE;
END
GO
";

        await ExecuteSqlAsync(connection, ddl);
        Console.WriteLine("Schema initialized (Country, County, Address, Resident, Addiction, AddictionType, Room, ProbationType, ResidentAddiction + satellites).");
    }

    private static async Task DropAllTablesAsync(IDictionary<string, string> args)
    {
        var environment = args.TryGetValue("env", out var env) ? env : Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";
        var config = BuildConfiguration(environment);
        var connection = ResolveConnectionString(config, args);

        var force = args.TryGetValue("force", out var f) && (f.Equals("true", StringComparison.OrdinalIgnoreCase) || f.Equals("1"));
        if (!force && !ConfirmDangerous(connection))
        {
            Console.WriteLine("Aborted by user.");
            return;
        }

        var script = @"
DECLARE @sql NVARCHAR(MAX);

-- Drop all foreign keys
SELECT @sql = STRING_AGG(
    'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) +
    ' DROP CONSTRAINT ' + QUOTENAME(name) + ';', CHAR(10))
FROM sys.foreign_keys
WHERE is_ms_shipped = 0;

IF @sql IS NOT NULL AND LEN(@sql) > 0 EXEC sp_executesql @sql;

-- Drop all user tables
SELECT @sql = STRING_AGG(
    'DROP TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ';', CHAR(10))
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

IF @sql IS NOT NULL AND LEN(@sql) > 0 EXEC sp_executesql @sql;
";

        await ExecuteSqlAsync(connection, script);
        Console.WriteLine("All user tables dropped.");
    }

    private static async Task DownloadPhotosAsync(IDictionary<string, string> args)
    {
        var environment = args.TryGetValue("env", out var env) ? env : Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";
        var config = BuildConfiguration(environment);
        var connection = ResolveConnectionString(config, args);

        var sex = args.TryGetValue("sex", out var sexArg) ? sexArg : "Male";
        var anySex = string.Equals(sex, "any", StringComparison.OrdinalIgnoreCase) || string.Equals(sex, "all", StringComparison.OrdinalIgnoreCase);
        var minAge = args.TryGetValue("min-age", out var minAgeStr) && int.TryParse(minAgeStr, out var mi) ? mi : 0;
        var maxAge = args.TryGetValue("max-age", out var maxAgeStr) && int.TryParse(maxAgeStr, out var ma) ? ma : 200;
        var output = args.TryGetValue("output", out var outDir) ? outDir : "photos";

        Directory.CreateDirectory(output);

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connection)
            .Options;

        await using var db = new AppDbContext(options);

        var today = DateTime.Today;

        // Pull candidates: Sex filter (case-insensitive), age by DOB, has a photo URL
        var query = db.Residents.Where(r => r.DateOfBirth != null);
        if (!anySex)
        {
            query = query.Where(r => r.Sex != null && r.Sex.ToLower() == sex.ToLower());
        }
        var residents = query
            .AsEnumerable() // compute age client-side to avoid provider differences
            .Select(r => new
            {
                Resident = r,
                Age = r.CalculateAge(),
                Url = FirstNonEmpty(r.PhotoUrl, r.ArrivalPhotoUrl, r.DischargePhotoUrl)
            })
            .Where(x => x.Age >= minAge && x.Age <= maxAge)
            .Where(x => !string.IsNullOrWhiteSpace(x.Url))
            .ToList();

        if (residents.Count == 0)
        {
            Console.WriteLine("No residents matched the criteria.");
            return;
        }

        using var http = new HttpClient();
        http.Timeout = TimeSpan.FromSeconds(30);

        foreach (var item in residents)
        {
            var ppsn = string.IsNullOrWhiteSpace(item.Resident.SocialSecurityNumber) ? item.Resident.Id.ToString() : SanitizeForPath(item.Resident.SocialSecurityNumber!);
            var folder = Path.Combine(output, ppsn);
            Directory.CreateDirectory(folder);

            var url = item.Url!.Trim();
            var fileName = GetFileNameFromUrl(url);
            var filePath = Path.Combine(folder, fileName);

            try
            {
                Console.WriteLine($"Downloading {url} -> {filePath}");
                using var resp = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
                resp.EnsureSuccessStatusCode();
                await using var fs = File.Create(filePath);
                await resp.Content.CopyToAsync(fs);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Failed to download for {ppsn}: {ex.Message}");
            }
        }

        Console.WriteLine("Download complete.");
    }

    private static string? FirstNonEmpty(params string?[] values)
        => values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v));

    private static string GetFileNameFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var last = Path.GetFileName(uri.LocalPath);
            if (string.IsNullOrWhiteSpace(last) || last == "/")
                return "photo.jpg";
            // Ensure an extension; default to .jpg
            return Path.HasExtension(last) ? last : last + ".jpg";
        }
        catch
        {
            return "photo.jpg";
        }
    }

    private static string SanitizeForPath(string input)
    {
        var invalid = new string(Path.GetInvalidFileNameChars()) + new string(Path.GetInvalidPathChars());
        var regex = new Regex($"[{Regex.Escape(invalid)}]");
        return regex.Replace(input, "_");
    }

    private static async Task<bool> TableExistsAsync(DbContext db, string schema, string tableName)
    {
        try
        {
            await using var conn = db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
                await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = @p0 AND TABLE_NAME = @p1";
            var p0 = cmd.CreateParameter();
            p0.ParameterName = "@p0";
            p0.Value = schema;
            cmd.Parameters.Add(p0);
            var p1 = cmd.CreateParameter();
            p1.ParameterName = "@p1";
            p1.Value = tableName;
            cmd.Parameters.Add(p1);
            var result = await cmd.ExecuteScalarAsync();
            return result != null;
        }
        catch
        {
            return false;
        }
    }

    private static async Task ExecuteSqlAsync(string connectionString, string sql)
    {
        static IEnumerable<string> SplitBatches(string script)
        {
            var lines = script.Replace("\r\n", "\n").Split('\n');
            var batch = new System.Text.StringBuilder();
            foreach (var line in lines)
            {
                if (line.Trim().Equals("GO", StringComparison.OrdinalIgnoreCase))
                {
                    if (batch.Length > 0)
                    {
                        yield return batch.ToString();
                        batch.Clear();
                    }
                }
                else
                {
                    batch.AppendLine(line);
                }
            }
            if (batch.Length > 0) yield return batch.ToString();
        }

        await using var conn = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
        await conn.OpenAsync();
        foreach (var batch in SplitBatches(sql))
        {
            var text = batch.Trim();
            if (string.IsNullOrWhiteSpace(text)) continue;
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = text;
            cmd.CommandTimeout = 120;
            try { await cmd.ExecuteNonQueryAsync(); }
            catch (Exception ex)
            {
                // Continue past already-exists errors to create what we can
                Console.Error.WriteLine($"Batch execution warning: {ex.Message}");
            }
        }
    }

    private static bool ConfirmDangerous(string connectionString)
    {
        try
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            Console.WriteLine($"WARNING: This will DELETE ALL DATA in database '{builder.InitialCatalog}' on server '{builder.DataSource}'.");
        }
        catch
        {
            Console.WriteLine("WARNING: This will DELETE ALL DATA in the target database.");
        }
        Console.Write("Type YES to proceed: ");
        var input = Console.ReadLine();
        return string.Equals(input?.Trim(), "YES", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task ResetDatabaseDataAsync(string connectionString)
    {
        var script = @"
DECLARE @sql NVARCHAR(MAX) = N'';
-- Disable all constraints
SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ' NOCHECK CONSTRAINT ALL;'
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

EXEC sp_executesql @sql;

-- Build delete statements for all user tables except migration history
SET @sql = N'';
SELECT @sql = @sql + 'DELETE FROM ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ';'
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0 AND NOT (t.name = '__EFMigrationsHistory');

EXEC sp_executesql @sql;

-- Re-enable all constraints
SET @sql = N'';
SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ' WITH CHECK CHECK CONSTRAINT ALL;'
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0;

EXEC sp_executesql @sql;
";
        await ExecuteSqlAsync(connectionString, script);
    }

    private static string PreprocessCreateScript(string ddl)
    {
        var batches = ddl.Replace("\r\n", "\n").Split("\nGO\n", StringSplitOptions.None).ToList();
        bool removed = false;
        for (int i = batches.Count - 1; i >= 0; i--)
        {
            var b = batches[i];
            var normalized = b.ToLowerInvariant();
            if (normalized.Contains("create table [residents]") || normalized.Contains("create table [dbo].[residents]"))
            {
                batches.RemoveAt(i);
                removed = true;
            }
        }
        if (removed) Console.WriteLine("Filtered duplicate Residents table from therapy DDL.");
        return string.Join("\nGO\n", batches);
    }

    private static async Task SeedTherapyBasicsAsync(AcutisDbContext db)
    {
        // Seed default quick comment templates
        if (!await db.QuickCommentTemplates.AnyAsync())
        {
            var comments = new[]
            {
                "Excellent insight",
                "Good participation",
                "Needs encouragement",
                "Struggling with concept",
                "Very emotional response",
                "Defensive attitude",
                "Making progress",
                "Requires follow-up"
            };
            foreach (var c in comments)
            {
                db.QuickCommentTemplates.Add(new Acutis.Domain.Entities.QuickCommentTemplate { Text = c, IsActive = true });
            }
            await db.SaveChangesAsync();
            Console.WriteLine("Seeded QuickCommentTemplates.");
        }

        // Seed a minimal Step 1 module if none exist
        if (!await db.TherapyModules.AnyAsync())
        {
            var module = new Acutis.Domain.Entities.TherapyModule
            {
                Title = "Step 1: Powerlessness",
                Body = "We admitted we were powerless over alcohol - that our lives had become unmanageable."
            };
            module.Questions.Add(new Acutis.Domain.Entities.ModuleQuestion { Prompt = "How did you first realize you were powerless over alcohol?", DisplayOrder = 1 });
            module.Questions.Add(new Acutis.Domain.Entities.ModuleQuestion { Prompt = "What does 'unmanageable' mean to you?", DisplayOrder = 2 });
            db.TherapyModules.Add(module);
            await db.SaveChangesAsync();
            Console.WriteLine("Seeded initial TherapyModule and questions.");
        }
    }

    private static async Task SeedResidentsAsync(IDictionary<string, string> args)
    {
        var environment = args.TryGetValue("env", out var env) ? env : Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Development";
        var config = BuildConfiguration(environment);
        var connection = ResolveConnectionString(config, args);

        var count = args.TryGetValue("count", out var countStr) && int.TryParse(countStr, out var c) ? Math.Max(1, c) : 25;
        var sex = args.TryGetValue("sex", out var s) ? s : "Male";
        var minAge = args.TryGetValue("min-age", out var minAgeStr) && int.TryParse(minAgeStr, out var mi) ? mi : 20;
        var maxAge = args.TryGetValue("max-age", out var maxAgeStr) && int.TryParse(maxAgeStr, out var ma) ? ma : 40;

        var rnd = new Random(12345);

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connection)
            .Options;

        await using var db = new AppDbContext(options);
        await db.Database.MigrateAsync();

        var country = await db.Countries.FirstOrDefaultAsync(c => c.CountryCode == "IE")
                      ?? new Acutis.Domain.Lookups.Country("IE", "Ireland", "Irish");
        if (country.Id == Guid.Empty || db.Entry(country).State == EntityState.Detached)
        {
            db.Countries.Add(country);
            await db.SaveChangesAsync();
        }

        await EnsureAddressPoolAsync(db, country.Id, count);
        var addressIds = await db.Addresses.Select(a => a.Id).ToListAsync();

        var primaryAddiction = await db.Addictions.FirstOrDefaultAsync(a => a.Name == "Alcohol")
                               ?? await db.Addictions.FirstAsync();

        var basePhotos = new[]
        {
            "https://randomuser.me/api/portraits/men/1.jpg",
            "https://randomuser.me/api/portraits/men/2.jpg",
            "https://randomuser.me/api/portraits/men/3.jpg",
            "https://randomuser.me/api/portraits/men/4.jpg",
            "https://randomuser.me/api/portraits/men/5.jpg",
            "https://randomuser.me/api/portraits/men/6.jpg",
            "https://randomuser.me/api/portraits/men/7.jpg",
            "https://randomuser.me/api/portraits/men/8.jpg",
            "https://randomuser.me/api/portraits/men/9.jpg",
            "https://randomuser.me/api/portraits/men/10.jpg"
        };

        var firstNames = new[] { "John", "Michael", "David", "James", "Robert", "Daniel", "Mark", "Paul", "Kevin", "Brian" };
        var lastNames = new[] { "Murphy", "Kelly", "Byrne", "Ryan", "O'Brien", "Walsh", "O'Sullivan", "Doyle", "McCarthy", "Gallagher" };

        var created = 0;
        for (int i = 0; i < count; i++)
        {
            var age = rnd.Next(minAge, maxAge + 1);
            var dob = DateTime.Today.AddYears(-age).AddDays(-rnd.Next(0, 365));
            var fn = firstNames[i % firstNames.Length];
            var ln = lastNames[(i / firstNames.Length) % lastNames.Length];
            var ppsn = $"PPSN{(1000 + i)}A";
            var photo = basePhotos[i % basePhotos.Length];

            var resident = new Acutis.Domain.Entities.Resident(
                socialSecurityNumber: ppsn,
                dateOfBirth: dob,
                dateOfAdmission: DateTime.Today,
                firstName: fn,
                middleName: null,
                surname: ln,
                isPreviousResident: false,
                primaryAddictionId: primaryAddiction.Id,
                countryId: country.Id
            );

            var addrId = addressIds[i % addressIds.Count];
            resident.UpdateAddress(addrId);
            resident.UpdateContact($"08{rnd.Next(10000000, 99999999)}", $"{fn.ToLower()}.{ln.ToLower()}@example.com");
            resident.UpdatePhoto(photo);

            // Set Sex even though the property has a private setter: use EF property API
            db.Entry(resident).Property("Sex").CurrentValue = sex;

            db.Residents.Add(resident);
            created++;
        }

        await db.SaveChangesAsync();
        Console.WriteLine($"Seeded {created} residents.");
    }
    private static async Task EnsureAddressPoolAsync(AppDbContext db, Guid countryId, int target)
    {
        var current = await db.Addresses.CountAsync();
        if (current >= target) return;

        var counties = new[] { "Antrim","Armagh","Carlow","Cavan","Clare","Cork","Derry","Donegal","Down","Dublin","Fermanagh","Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary","Tyrone","Waterford","Westmeath","Wexford","Wicklow" };
        var i = current + 1;
        while (await db.Addresses.CountAsync() < target)
        {
            var countyName = counties[(i - 1) % counties.Length];
            var city = countyName;
            var line1 = $"{i} Main Street";
            var post = countyName.StartsWith("D", StringComparison.OrdinalIgnoreCase) ? "D01" : "X" + (i % 100).ToString("00");
            var county = await db.Counties.FirstOrDefaultAsync(c => c.Name == countyName) ?? new Acutis.Domain.Lookups.County(countyName, countryId);
            if (db.Entry(county).State == EntityState.Detached) { db.Counties.Add(county); await db.SaveChangesAsync(); }
            db.Addresses.Add(new Acutis.Domain.ValueObjects.Address(line1, null, city, county.Id, post, countryId));
            i++;
        }
        await db.SaveChangesAsync();
    }
    private static async Task SeedSupportDataAsync(AppDbContext db, ILogger logger)
    {
        // Countries (singular schema) - add if missing
        var desiredCountries = new (string Code, string Name, string? Demonym)[]
        {
            ("IE","Ireland","Irish"),
            ("UK","United Kingdom","British"),
            ("PL","Poland","Polish"),
            ("US","United States","American"),
            ("CA","Canada","Canadian"),
            ("LT","Lithuania","Lithuanian")
        };
        foreach (var (code,name,dem) in desiredCountries)
        {
            if (!await db.Countries.AnyAsync(c => c.CountryCode == code))
            {
                db.Countries.Add(new Acutis.Domain.Lookups.Country(code, name, dem));
            }
        }
        if (db.ChangeTracker.Entries<Acutis.Domain.Lookups.Country>().Any(e => e.State == EntityState.Added))
        {
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded Countries (added missing entries)");
        }

        // Medical Insurance Providers
        if (!await db.MedicalInsuranceProviders.AnyAsync())
        {
            db.MedicalInsuranceProviders.AddRange(
                new Acutis.Domain.Lookups.MedicalInsuranceProvider("VHI"),
                new Acutis.Domain.Lookups.MedicalInsuranceProvider("Irish Life")
            );
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded MedicalInsuranceProviders");
        }

        // Probation Requirements
        if (!await db.ProbationRequirements.AnyAsync())
        {
            db.ProbationRequirements.AddRange(
                new Acutis.Domain.Lookups.ProbationRequirement("Curfew"),
                new Acutis.Domain.Lookups.ProbationRequirement("Weekly Check-in")
            );
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded ProbationRequirements");
        }

        // Addictions
        if (!await db.Addictions.AnyAsync())
        {
            db.Addictions.AddRange(
                new Acutis.Domain.Lookups.Addiction("Alcohol", "Substance"),
                new Acutis.Domain.Lookups.Addiction("Cocaine", "Substance"),
                new Acutis.Domain.Lookups.Addiction("Gambling", "Behavioural")
            );
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded Addictions");
        }

        // Religious Affiliations
        if (!await db.ReligiousAffiliations.AnyAsync())
        {
            db.ReligiousAffiliations.AddRange(
                new Acutis.Domain.Lookups.ReligiousAffiliation("Catholic"),
                new Acutis.Domain.Lookups.ReligiousAffiliation("Protestant"),
                new Acutis.Domain.Lookups.ReligiousAffiliation("None")
            );
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded ReligiousAffiliations");
        }

        // Counties + Addresses (Ireland focus for now) – create if none exist
        if (!await db.Addresses.AnyAsync())
        {
            var ie = await db.Countries.FirstOrDefaultAsync(c => c.CountryCode == "IE")
                     ?? new Acutis.Domain.Lookups.Country("IE", "Ireland", "Irish");
            if (db.Entry(ie).State == EntityState.Detached)
            {
                db.Countries.Add(ie);
                await db.SaveChangesAsync();
            }

            var counties = new[] { "Antrim","Armagh","Carlow","Cavan","Clare","Cork","Derry","Donegal","Down","Dublin","Fermanagh","Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth","Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary","Tyrone","Waterford","Westmeath","Wexford","Wicklow" };
            var i = 1;
            foreach (var countyName in counties)
            {
                var city = countyName;
                var line1 = $"{i} Main Street";
                var post = countyName.StartsWith("D", StringComparison.OrdinalIgnoreCase) ? "D01" : "X" + i.ToString("00");
                var county = await db.Counties.FirstOrDefaultAsync(c => c.Name == countyName) ?? new Acutis.Domain.Lookups.County(countyName, ie.Id);
                if (db.Entry(county).State == EntityState.Detached) { db.Counties.Add(county); await db.SaveChangesAsync(); }
                db.Addresses.Add(new Acutis.Domain.ValueObjects.Address(line1, null, city, county.Id, post, ie.Id));
                i++;
            }
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded Addresses");
        }
    }

    private static async Task SeedRoomsAsync(string connectionString, ILogger logger)
    {
        var createSql = @"
IF OBJECT_ID(N'[dbo].[Room]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Room](
        [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        [RoomNumber] NVARCHAR(20) NOT NULL,
        [RoomType] NVARCHAR(20) NOT NULL,
        [NumberOfResidents] INT NOT NULL,
        [IsOpiateDetox] BIT NOT NULL,
        [IsQuarantine] BIT NOT NULL,
        [HasOwnWC] BIT NOT NULL
    );
END
";
        await ExecuteSqlAsync(connectionString, createSql);

        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();
        var countCmd = new SqlCommand("SELECT COUNT(1) FROM [dbo].[Room]", conn);
        var existing = (int)await countCmd.ExecuteScalarAsync();
        if (existing > 0) { logger.LogInformation("Rooms already seeded ({Count} rows)", existing); return; }

        var plan = new List<(string type, int qty)>
        {
            ("Alcohol", 30),
            ("Drugs", 10),
            ("Detox", 10)
        };

        var rnd = new Random(777);
        var roomNo = 1;
        foreach (var (type, qty) in plan)
        {
            for (int i = 0; i < qty; i++)
            {
                var id = Guid.NewGuid();
                var number = $"R{roomNo:000}";
                var capacity = type == "Detox" ? 1 : rnd.Next(1, 4);
                var isOpiate = type == "Detox" && rnd.NextDouble() < 0.5;
                var isQuarantine = type == "Detox" && rnd.NextDouble() < 0.2;
                var ownWc = rnd.NextDouble() < 0.4;

                var insert = new SqlCommand(@"INSERT INTO [dbo].[Room]
                    ([Id],[RoomNumber],[RoomType],[NumberOfResidents],[IsOpiateDetox],[IsQuarantine],[HasOwnWC])
                    VALUES (@id,@num,@type,@cap,@op,@q,@wc)", conn);
                insert.Parameters.AddWithValue("@id", id);
                insert.Parameters.AddWithValue("@num", number);
                insert.Parameters.AddWithValue("@type", type);
                insert.Parameters.AddWithValue("@cap", capacity);
                insert.Parameters.AddWithValue("@op", isOpiate);
                insert.Parameters.AddWithValue("@q", isQuarantine);
                insert.Parameters.AddWithValue("@wc", ownWc);
                await insert.ExecuteNonQueryAsync();
                roomNo++;
            }
        }

        logger.LogInformation("Seeded Rooms: 50");
    }
}
