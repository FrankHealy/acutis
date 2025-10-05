using Microsoft.EntityFrameworkCore;
using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Acutis.Domain.ValueObjects;

namespace Acutis.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Resident> Residents { get; set; } = null!;
    public DbSet<Address> Addresses { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<ProbationRequirement> ProbationRequirements { get; set; } = null!;
    public DbSet<Addiction> Addictions { get; set; } = null!; // for primary + secondary

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Resident
        modelBuilder.Entity<Resident>(entity =>
        {
            entity.ToTable("Residents");
            entity.HasKey(r => r.Id);

            entity.HasOne(r => r.Address)
                  .WithMany()
                  .HasForeignKey(r => r.AddressId);

            entity.HasOne(r => r.Country)
                  .WithMany()
                  .HasForeignKey(r => r.CountryId);

            entity.HasOne(r => r.ProbationRequirement)
                  .WithMany()
                  .HasForeignKey(r => r.ProbationRequirementId);

            entity.HasOne(r => r.PrimaryAddiction)
                  .WithMany()
                  .HasForeignKey(r => r.PrimaryAddictionId);

            // Many-to-many for secondary addictions
            entity.HasMany(r => r.SecondaryAddictions)
                  .WithMany()
                  .UsingEntity(j => j.ToTable("ResidentSecondaryAddictions"));
        });

        // Address
        modelBuilder.Entity<Address>(entity =>
        {
            entity.ToTable("Addresses");
            entity.HasKey(a => a.Id);

            entity.HasOne(a => a.Country)
                  .WithMany()
                  .HasForeignKey(a => a.CountryId);
        });

        // Country
        modelBuilder.Entity<Country>(entity =>
        {
            entity.ToTable("Countries");
            entity.HasKey(c => c.CountryId);
        });

        // ProbationRequirement
        modelBuilder.Entity<ProbationRequirement>(entity =>
        {
            entity.ToTable("ProbationRequirements");
            entity.HasKey(p => p.Id);
        });

        // Addiction
        modelBuilder.Entity<Addiction>(entity =>
        {
            entity.ToTable("Addictions");
            entity.HasKey(a => a.Id);
        });
    }
}
