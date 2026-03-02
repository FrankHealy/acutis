using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ResidentProgrammeEpisodeConfiguration : IEntityTypeConfiguration<ResidentProgrammeEpisode>
{
    public void Configure(EntityTypeBuilder<ResidentProgrammeEpisode> builder)
    {
        builder.ToTable("ResidentProgrammeEpisode");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.StartDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.EndDate).HasColumnType("date");
        builder.Property(x => x.CurrentWeekNumber).IsRequired();
        builder.Property(x => x.ProgrammeType).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(x => x.ParticipationMode).HasConversion<string>().HasMaxLength(40).IsRequired();

        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.ProgrammeType });
        builder.HasIndex(x => new { x.ResidentId, x.StartDate });
    }
}
