using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Data;

public sealed class AcutisDbContext : DbContext
{
    public AcutisDbContext(DbContextOptions<AcutisDbContext> options)
        : base(options)
    {
    }

    public DbSet<Call> Calls => Set<Call>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Call>(entity =>
        {
            entity.ToTable("Calls");
            entity.HasKey(call => call.Id);
            entity.Property(call => call.Caller).HasMaxLength(200);
            entity.Property(call => call.PhoneNumber).HasMaxLength(50);
            entity.Property(call => call.Notes).HasMaxLength(2000);
            entity.Property(call => call.Source).HasMaxLength(200);
            entity.Property(call => call.CallTimeUtc).IsRequired();
        });
    }
}
