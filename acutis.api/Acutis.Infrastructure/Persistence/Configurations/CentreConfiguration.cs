using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class CentreConfiguration : IEntityTypeConfiguration<Centre>
{
    public void Configure(EntityTypeBuilder<Centre> builder)
    {
        builder.ToTable("Centre");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.DisplayOrder).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => new { x.IsActive, x.DisplayOrder, x.Name });
        builder.HasMany(x => x.Units)
            .WithOne(x => x.Centre)
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.UserAssignments)
            .WithOne(x => x.Centre)
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
