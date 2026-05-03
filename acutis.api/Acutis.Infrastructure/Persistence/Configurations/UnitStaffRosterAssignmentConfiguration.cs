using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class UnitStaffRosterAssignmentConfiguration : IEntityTypeConfiguration<UnitStaffRosterAssignment>
{
    public void Configure(EntityTypeBuilder<UnitStaffRosterAssignment> builder)
    {
        builder.ToTable("UnitStaffRosterAssignment");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScheduledDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.ShiftType).HasConversion<string>().HasMaxLength(48).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.UnitId, x.ScheduledDate, x.ShiftType }).IsUnique();
        builder.HasIndex(x => new { x.UnitId, x.ScheduledDate });

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.AssignedAppUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedAppUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
