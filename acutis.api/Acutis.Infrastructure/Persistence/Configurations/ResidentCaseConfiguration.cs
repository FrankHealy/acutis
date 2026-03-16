using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ResidentCaseConfiguration : IEntityTypeConfiguration<ResidentCase>
{
    public void Configure(EntityTypeBuilder<ResidentCase> builder)
    {
        builder.ToTable("ResidentCase");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CaseStatus).HasMaxLength(40).IsRequired();
        builder.Property(x => x.CasePhase).HasMaxLength(40).IsRequired();
        builder.Property(x => x.ReferralSource).HasMaxLength(120);
        builder.Property(x => x.ReferralReference).HasMaxLength(120);
        builder.Property(x => x.ReferralReceivedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.ScreeningStartedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.ScreeningCompletedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.AdmissionDecisionAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.AdmissionDecisionStatus).HasMaxLength(40);
        builder.Property(x => x.AdmissionDecisionReason).HasMaxLength(1000);
        builder.Property(x => x.ClosedWithoutAdmissionAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.OpenedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.LastContactAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.ClosedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.SummaryNotes).HasMaxLength(4000);

        builder.HasIndex(x => new { x.CentreId, x.CaseStatus, x.OpenedAtUtc });
        builder.HasIndex(x => new { x.ResidentId, x.OpenedAtUtc });
        builder.HasIndex(x => new { x.CentreId, x.AdmissionDecisionStatus, x.AdmissionDecisionAtUtc });
        builder.HasIndex(x => new { x.CentreId, x.ScreeningCompletedAtUtc });
        builder.HasIndex(x => x.UnitId);

        builder.HasOne(x => x.Resident)
            .WithMany()
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.SetNull);

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
