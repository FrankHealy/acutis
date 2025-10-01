using Microsoft.EntityFrameworkCore;
using Acutis.Domain.Admissions;
using Acutis.Domain.Lookups;

namespace Acutis.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<AddictionType> AddictionTypes => Set<AddictionType>();
    public DbSet<ResidentSecondaryAddiction> ResidentSecondaryAddictions => Set<ResidentSecondaryAddiction>();
    public DbSet<ResidentAddress> ResidentAddresses => Set<ResidentAddress>();
    public DbSet<ResidentPhoto> ResidentPhotos => Set<ResidentPhoto>();
    public DbSet<ResidentDocument> ResidentDocuments => Set<ResidentDocument>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<Nationality> Nationalities => Set<Nationality>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ResidentSecondaryAddiction>()
            .HasKey(rsa => new { rsa.ResidentId, rsa.AddictionTypeId });
    }
}
