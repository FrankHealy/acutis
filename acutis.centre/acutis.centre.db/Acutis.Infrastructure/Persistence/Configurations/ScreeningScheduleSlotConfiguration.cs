using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ScreeningScheduleSlotConfiguration : IEntityTypeConfiguration<ScreeningScheduleSlot>
{
    public void Configure(EntityTypeBuilder<ScreeningScheduleSlot> builder)
    {
        builder.ToTable("ScreeningScheduleSlot");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScheduledDate).HasColumnType("date");
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2");

        builder.HasIndex(x => new { x.UnitId, x.ScheduledDate }).IsUnique();

        builder.HasOne(x => x.Centre)
            .WithMany()
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
