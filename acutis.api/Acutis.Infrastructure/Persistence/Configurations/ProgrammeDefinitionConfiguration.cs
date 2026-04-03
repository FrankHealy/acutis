using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ProgrammeDefinitionConfiguration : IEntityTypeConfiguration<ProgrammeDefinition>
{
    public void Configure(EntityTypeBuilder<ProgrammeDefinition> builder)
    {
        builder.ToTable("ProgrammeDefinition");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.TotalDurationValue).IsRequired();
        builder.Property(x => x.TotalDurationUnit).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.DetoxPhaseDurationUnit).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.MainPhaseDurationUnit).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.CentreId, x.Code }).IsUnique();
        builder.HasIndex(x => new { x.CentreId, x.IsActive, x.Name });

        builder.HasOne(x => x.Centre)
            .WithMany()
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
