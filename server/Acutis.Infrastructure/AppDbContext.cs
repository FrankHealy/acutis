using Microsoft.EntityFrameworkCore;
using Acutis.Domain.Entities;
using Acutis.Domain.Enums;
using Acutis.Domain.Lookups;
using Acutis.Domain.ValueObjects;

namespace Acutis.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<ReligiousAffiliation> ReligiousAffiliations => Set<ReligiousAffiliation>();
    public DbSet<ProbationRequirement> ProbationRequirements => Set<ProbationRequirement>();
    public DbSet<MedicalInsuranceProvider> MedicalInsuranceProviders => Set<MedicalInsuranceProvider>();
    public DbSet<Addiction> Addictions => Set<Addiction>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<ResidentPhoto> ResidentPhotos => Set<ResidentPhoto>();
    public DbSet<ResidentDocument> ResidentDocuments => Set<ResidentDocument>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<County> Counties => Set<County>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<AddictionType> AddictionTypes => Set<AddictionType>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enums as strings
        modelBuilder.Entity<Resident>().Property(r => r.AdmissionPhase).HasConversion<string>();
        modelBuilder.Entity<Resident>().Property(r => r.DataQuality).HasConversion<string>();
        modelBuilder.Entity<Resident>().Property(r => r.PreferredStepDownHouse).HasConversion<string>();

        // Resident relationships
        modelBuilder.Entity<Resident>(e =>
        {
            e.ToTable("Resident");
            e.HasKey(r => r.Id);

            e.HasOne(r => r.Address).WithMany().HasForeignKey(r => r.AddressId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Country).WithMany().HasForeignKey(r => r.CountryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.ReligiousAffiliation).WithMany().HasForeignKey(r => r.ReligiousAffiliationId);
            e.HasOne(r => r.ProbationRequirement).WithMany().HasForeignKey(r => r.ProbationRequirementId);
            e.HasOne(r => r.PrivateMedicalInsuranceProvider).WithMany().HasForeignKey(r => r.PrivateMedicalInsuranceProviderId);
            e.HasOne(r => r.PrimaryAddiction).WithMany().HasForeignKey(r => r.PrimaryAddictionId);

            // Many-to-many join uses singular table ResidentAddiction
            e.HasMany(r => r.SecondaryAddictions)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "ResidentAddiction",
                    right => right
                        .HasOne<Addiction>()
                        .WithMany()
                        .HasForeignKey("AddictionId")
                        .OnDelete(DeleteBehavior.NoAction),
                    left => left
                        .HasOne<Resident>()
                        .WithMany()
                        .HasForeignKey("ResidentId")
                        .OnDelete(DeleteBehavior.NoAction),
                    join =>
                    {
                        join.ToTable("ResidentAddiction");
                        join.HasKey("ResidentId", "AddictionId");
                    });

            e.HasMany(r => r.Prescriptions)
                .WithOne(p => p.Resident)
                .HasForeignKey(p => p.ResidentId);
        });

        modelBuilder.Entity<Address>(e =>
        {
            e.ToTable("Address");
            e.HasKey(a => a.Id);
            e.HasOne(a => a.Country).WithMany().HasForeignKey(a => a.CountryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.County).WithMany().HasForeignKey(a => a.CountyId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Country>().ToTable("Country").HasKey(c => c.Id);
        modelBuilder.Entity<ReligiousAffiliation>().ToTable("ReligiousAffiliation").HasKey(x => x.Id);
        modelBuilder.Entity<ProbationRequirement>(e =>
        {
            e.ToTable("ProbationType");
            e.HasKey(x => x.Id);
            e.Property(x => x.Requirement).HasColumnName("Name");
        });
        modelBuilder.Entity<MedicalInsuranceProvider>().ToTable("MedicalInsuranceProvider").HasKey(x => x.Id);
        modelBuilder.Entity<Addiction>(e =>
        {
            e.ToTable("Addiction");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.AddictionType).WithMany().HasForeignKey(x => x.AddictionTypeId);
        });
        modelBuilder.Entity<Prescription>().ToTable("Prescription").HasKey(x => x.Id);

        modelBuilder.Entity<ResidentPhoto>(e =>
        {
            e.ToTable("ResidentPhoto");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Resident).WithMany().HasForeignKey(x => x.ResidentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ResidentDocument>(e =>
        {
            e.ToTable("ResidentDocument");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Resident).WithMany().HasForeignKey(x => x.ResidentId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.DocumentType).WithMany().HasForeignKey(x => x.DocumentTypeId);
        });

        modelBuilder.Entity<DocumentType>().ToTable("DocumentType").HasKey(x => x.Id);

        modelBuilder.Entity<County>(e =>
        {
            e.ToTable("County");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Country).WithMany().HasForeignKey(x => x.CountryId);
        });

        modelBuilder.Entity<Room>(e =>
        {
            e.ToTable("Room");
            e.HasKey(x => x.Id);
        });

        modelBuilder.Entity<AddictionType>().ToTable("AddictionType").HasKey(x => x.Id);

        // (optional) seeds — add a few safe defaults
        modelBuilder.Entity<Country>().HasData(new Country("IE", "Ireland", "Irish") { });
        modelBuilder.Entity<Addiction>().HasData(
            new Addiction("Alcohol", "Substance") { },
            new Addiction("Cocaine", "Substance") { },
            new Addiction("Gambling", "Behavioural") { }
        );
        modelBuilder.Entity<ProbationRequirement>().HasData(
            new ProbationRequirement("Curfew") { },
            new ProbationRequirement("Weekly Check-in") { }
        );
        modelBuilder.Entity<MedicalInsuranceProvider>().HasData(new MedicalInsuranceProvider("VHI") { }, new MedicalInsuranceProvider("Irish Life") { });
    }
}
