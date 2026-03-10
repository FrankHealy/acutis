using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class UnitQuoteCurationConfiguration : IEntityTypeConfiguration<UnitQuoteCuration>
{
    public void Configure(EntityTypeBuilder<UnitQuoteCuration> builder)
    {
        builder.ToTable("UnitQuoteCuration");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitId).IsRequired();
        builder.Property(x => x.QuoteId).IsRequired();
        builder.Property(x => x.Weight);
        builder.Property(x => x.DisplayOrder);
        builder.Property(x => x.PinnedFrom).HasColumnType("date");
        builder.Property(x => x.PinnedTo).HasColumnType("date");
        builder.Property(x => x.IsExcluded).IsRequired();

        builder.HasIndex(x => new { x.UnitId, x.QuoteId }).IsUnique();
        builder.HasOne<Quote>()
            .WithMany()
            .HasForeignKey(x => x.QuoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
