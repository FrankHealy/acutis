using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("Unit");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.CentreId).IsRequired();
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Capacity).IsRequired();
        builder.Property(x => x.CurrentOccupancy).IsRequired();
        builder.Property(x => x.CapacityWarningThreshold).IsRequired();
        builder.Property(x => x.DefaultResidentWeekNumber).HasDefaultValue(1).IsRequired();
        builder.Property(x => x.DisplayOrder).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => new { x.CentreId, x.DisplayOrder, x.Name });
        builder.HasIndex(x => new { x.IsActive, x.DisplayOrder, x.Name });
        builder.HasOne(x => x.Centre)
            .WithMany(x => x.Units)
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
