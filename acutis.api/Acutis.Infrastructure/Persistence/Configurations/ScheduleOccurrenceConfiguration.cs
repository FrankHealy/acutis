using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ScheduleOccurrenceConfiguration : IEntityTypeConfiguration<ScheduleOccurrence>
{
    public void Configure(EntityTypeBuilder<ScheduleOccurrence> builder)
    {
        builder.ToTable("ScheduleOccurrence");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.ScheduledDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.StartTime).HasColumnType("time");
        builder.Property(x => x.EndTime).HasColumnType("time");
        builder.Property(x => x.AudienceType).HasConversion<string>().HasMaxLength(24).IsRequired();
        builder.Property(x => x.FacilitatorType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.FacilitatorRole).HasMaxLength(120);
        builder.Property(x => x.ExternalResourceName).HasMaxLength(200);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.ScheduledDate, x.StartTime });
        builder.HasIndex(x => new { x.UnitId, x.ProgrammeDefinitionId, x.ScheduledDate });
        builder.HasIndex(x => new { x.EpisodeId, x.ScheduledDate });
        builder.HasIndex(x => x.ResidentId);
        builder.HasIndex(x => x.TemplateId);
        builder.HasIndex(x => x.AssignedFacilitatorUserId);

        builder.HasOne(x => x.Centre)
            .WithMany()
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProgrammeDefinition)
            .WithMany(x => x.ScheduleOccurrences)
            .HasForeignKey(x => x.ProgrammeDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Template)
            .WithMany(x => x.Occurrences)
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Episode)
            .WithMany()
            .HasForeignKey(x => x.EpisodeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Resident)
            .WithMany()
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.AssignedFacilitatorUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedFacilitatorUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
