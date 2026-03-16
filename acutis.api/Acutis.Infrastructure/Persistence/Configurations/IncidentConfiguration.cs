using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class IncidentConfiguration : IEntityTypeConfiguration<Incident>
{
    public void Configure(EntityTypeBuilder<Incident> builder)
    {
        builder.ToTable("Incident");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.OccurredAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.Summary).HasMaxLength(500).IsRequired();
        builder.Property(x => x.DetailsJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(4000);
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasOne(x => x.IncidentType)
            .WithMany(x => x.Incidents)
            .HasForeignKey(x => x.IncidentTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Resident)
            .WithMany()
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.ResidentCase)
            .WithMany()
            .HasForeignKey(x => x.ResidentCaseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Episode)
            .WithMany()
            .HasForeignKey(x => x.EpisodeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Centre)
            .WithMany()
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.CreatedByUser)
            .WithMany()
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.EpisodeId, x.OccurredAtUtc });
        builder.HasIndex(x => new { x.ResidentId, x.OccurredAtUtc });
        builder.HasIndex(x => new { x.UnitId, x.OccurredAtUtc });
        builder.HasIndex(x => new { x.CentreId, x.OccurredAtUtc });
        builder.HasIndex(x => new { x.IncidentTypeId, x.OccurredAtUtc });
    }
}
