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
        builder.Property(x => x.CentreEpisodeCode).HasMaxLength(32);
        builder.Property(x => x.EntryYear).IsRequired();
        builder.Property(x => x.EntryWeek).IsRequired();
        builder.Property(x => x.EntrySequence).IsRequired();
        builder.Property(x => x.RoomNumber).HasMaxLength(20);
        builder.Property(x => x.BedCode).HasMaxLength(50);
        builder.Property(x => x.ExpectedCompletionDate).HasColumnType("datetime2");
        builder.Property(x => x.PrimaryAddiction).HasMaxLength(100);
        builder.Property(x => x.CurrentWeekNumber).IsRequired();
        builder.Property(x => x.ProgrammeType).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(x => x.ParticipationMode).HasConversion<string>().HasMaxLength(40).IsRequired();

        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.ProgrammeType });
        builder.HasIndex(x => new { x.ResidentId, x.StartDate });
        builder.HasIndex(x => x.CentreEpisodeCode).IsUnique().HasFilter("[CentreEpisodeCode] IS NOT NULL");
        builder.HasIndex(x => new { x.CentreId, x.EntryYear, x.EntryWeek, x.EntrySequence }).IsUnique();
        builder.HasIndex(x => x.ResidentCaseId);
        builder.HasIndex(x => new { x.UnitId, x.BedCode }).HasFilter("[BedCode] IS NOT NULL AND [EndDate] IS NULL");

        builder.HasOne(x => x.ResidentCase)
            .WithMany(x => x.Episodes)
            .HasForeignKey(x => x.ResidentCaseId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
