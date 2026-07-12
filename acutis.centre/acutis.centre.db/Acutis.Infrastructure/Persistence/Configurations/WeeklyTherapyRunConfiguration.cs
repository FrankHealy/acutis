using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class WeeklyTherapyRunConfiguration : IEntityTypeConfiguration<WeeklyTherapyRun>
{
    public void Configure(EntityTypeBuilder<WeeklyTherapyRun> builder)
    {
        builder.ToTable("WeeklyTherapyRun");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.WeekStartDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.WeekEndDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.TopicsRunningJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.GeneratedAt).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.PublishedAt).HasColumnType("datetime2");

        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.WeekStartDate }).IsUnique();
    }
}
