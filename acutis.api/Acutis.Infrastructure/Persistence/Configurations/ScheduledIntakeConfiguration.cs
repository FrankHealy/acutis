using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ScheduledIntakeConfiguration : IEntityTypeConfiguration<ScheduledIntake>
{
    public void Configure(EntityTypeBuilder<ScheduledIntake> builder)
    {
        builder.ToTable("ScheduledIntake");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.StatusLookupValueId).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.ScheduledDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => x.ResidentCaseId).IsUnique();
        builder.HasIndex(x => new { x.UnitId, x.ScheduledDate, x.StatusLookupValueId });
        builder.HasIndex(x => new { x.UnitId, x.ScheduledDate, x.Status });

        builder.HasOne(x => x.ResidentCase)
            .WithMany()
            .HasForeignKey(x => x.ResidentCaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<LookupValue>()
            .WithMany()
            .HasForeignKey(x => x.StatusLookupValueId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
