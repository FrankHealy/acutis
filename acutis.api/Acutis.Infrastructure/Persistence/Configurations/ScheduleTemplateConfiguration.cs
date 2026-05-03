using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ScheduleTemplateConfiguration : IEntityTypeConfiguration<ScheduleTemplate>
{
    public void Configure(EntityTypeBuilder<ScheduleTemplate> builder)
    {
        builder.ToTable("ScheduleTemplate");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.RecurrenceType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.RecurrenceStartDate).HasColumnType("date");
        builder.Property(x => x.StartTime).HasColumnType("time");
        builder.Property(x => x.EndTime).HasColumnType("time");
        builder.Property(x => x.AudienceType).HasConversion<string>().HasMaxLength(24).IsRequired();
        builder.Property(x => x.FacilitatorType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.FacilitatorRole).HasMaxLength(120);
        builder.Property(x => x.ExternalResourceName).HasMaxLength(200);
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.IsActive, x.Name });
        builder.HasIndex(x => new { x.UnitId, x.ProgrammeDefinitionId, x.WeeklyDayOfWeek });
        builder.HasIndex(x => new { x.UnitId, x.ProgrammeDefinitionId, x.MonthlyDayOfMonth, x.RecurrenceStartDate });
        builder.HasIndex(x => x.ResidentId);

        builder.HasOne(x => x.Centre)
            .WithMany()
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProgrammeDefinition)
            .WithMany(x => x.ScheduleTemplates)
            .HasForeignKey(x => x.ProgrammeDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Resident)
            .WithMany()
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
