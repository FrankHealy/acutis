using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapyResidentObservationConfiguration : IEntityTypeConfiguration<GroupTherapyResidentObservation>
{
    public void Configure(EntityTypeBuilder<GroupTherapyResidentObservation> builder)
    {
        builder.ToTable("GroupTherapyResidentObservation");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ProgramCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ModuleKey).HasMaxLength(100).IsRequired();
        builder.Property(x => x.SelectedTermsJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.Property(x => x.ObservedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.ModuleKey, x.SessionNumber, x.ResidentId })
            .IsUnique()
            .HasDatabaseName("UQ_GroupTherapyResidentObservation_SessionResident");

        builder.HasIndex(x => x.EpisodeId);
        builder.HasIndex(x => x.EpisodeEventId);
        builder.HasIndex(x => x.ObserverUserId);

        builder.HasOne(x => x.Resident)
            .WithMany()
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ResidentCase)
            .WithMany()
            .HasForeignKey(x => x.ResidentCaseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Episode)
            .WithMany()
            .HasForeignKey(x => x.EpisodeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.EpisodeEvent)
            .WithMany()
            .HasForeignKey(x => x.EpisodeEventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ObserverUser)
            .WithMany()
            .HasForeignKey(x => x.ObserverUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
