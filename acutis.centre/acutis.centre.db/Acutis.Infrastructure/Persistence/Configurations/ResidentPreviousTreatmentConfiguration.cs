using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ResidentPreviousTreatmentConfiguration : IEntityTypeConfiguration<ResidentPreviousTreatment>
{
    public void Configure(EntityTypeBuilder<ResidentPreviousTreatment> builder)
    {
        builder.ToTable("ResidentPreviousTreatment");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CentreName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.TreatmentType).HasMaxLength(100);
        builder.Property(x => x.DurationUnit).HasMaxLength(30);
        builder.Property(x => x.SobrietyAfterwardsUnit).HasMaxLength(30);
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.ResidentId, x.StartYear });

        builder.HasOne(x => x.Resident)
            .WithMany(x => x.PreviousTreatments)
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
