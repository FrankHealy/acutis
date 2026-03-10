using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class TherapySchedulingConfigConfiguration : IEntityTypeConfiguration<TherapySchedulingConfig>
{
    public void Configure(EntityTypeBuilder<TherapySchedulingConfig> builder)
    {
        builder.ToTable("TherapySchedulingConfig");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.IntakeDayPreference).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.WeekDefinition).HasMaxLength(40).IsRequired();
        builder.Property(x => x.HolidayCalendarCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.DetoxWeeks).IsRequired();
        builder.Property(x => x.TotalWeeks).IsRequired();
        builder.Property(x => x.MainProgrammeWeeks).IsRequired();
        builder.Property(x => x.TopicsRequired).IsRequired();
        builder.Property(x => x.TopicsRunningPerWeek).IsRequired();
        builder.Property(x => x.ShiftIntakeIfPublicHoliday).IsRequired();
        builder.Property(x => x.AllowDuplicateCompletionsInEpisode).IsRequired();

        builder.HasIndex(x => x.CentreId)
            .HasFilter("[UnitId] IS NULL")
            .IsUnique();

        builder.HasIndex(x => new { x.CentreId, x.UnitId })
            .HasFilter("[UnitId] IS NOT NULL")
            .IsUnique();
    }
}
