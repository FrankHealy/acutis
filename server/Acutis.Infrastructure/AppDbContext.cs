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
            e.ToTable("Residents");
            e.HasKey(r => r.Id);

            e.HasOne(r => r.Address).WithMany().HasForeignKey(r => r.AddressId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Country).WithMany().HasForeignKey(r => r.CountryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.ReligiousAffiliation).WithMany().HasForeignKey(r => r.ReligiousAffiliationId);
            e.HasOne(r => r.ProbationRequirement).WithMany().HasForeignKey(r => r.ProbationRequirementId);
            e.HasOne(r => r.PrivateMedicalInsuranceProvider).WithMany().HasForeignKey(r => r.PrivateMedicalInsuranceProviderId);
            e.HasOne(r => r.PrimaryAddiction).WithMany().HasForeignKey(r => r.PrimaryAddictionId);

            e.HasMany(r => r.SecondaryAddictions).WithMany()
                .UsingEntity(j => j.ToTable("ResidentSecondaryAddictions"));

            e.HasMany(r => r.Prescriptions)
                .WithOne(p => p.Resident)
                .HasForeignKey(p => p.ResidentId);
        });

        modelBuilder.Entity<Address>(e =>
        {
            e.ToTable("Addresses");
            e.HasKey(a => a.Id);
            e.HasOne(a => a.Country).WithMany().HasForeignKey(a => a.CountryId);
        });

        modelBuilder.Entity<Country>().ToTable("Countries").HasKey(c => c.Id);
        modelBuilder.Entity<ReligiousAffiliation>().ToTable("ReligiousAffiliations").HasKey(x => x.Id);
        modelBuilder.Entity<ProbationRequirement>().ToTable("ProbationRequirements").HasKey(x => x.Id);
        modelBuilder.Entity<MedicalInsuranceProvider>().ToTable("MedicalInsuranceProviders").HasKey(x => x.Id);
        modelBuilder.Entity<Addiction>().ToTable("Addictions").HasKey(x => x.Id);
        modelBuilder.Entity<Prescription>().ToTable("Prescriptions").HasKey(x => x.Id);

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
