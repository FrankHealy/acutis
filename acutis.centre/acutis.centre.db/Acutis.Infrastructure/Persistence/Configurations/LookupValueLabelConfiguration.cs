using Acutis.Domain.Lookups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class LookupValueLabelConfiguration : IEntityTypeConfiguration<LookupValueLabel>
{
    public void Configure(EntityTypeBuilder<LookupValueLabel> builder)
    {
        builder.ToTable("LookupValueLabel", "dbo");
        builder.HasKey(x => new { x.LookupValueId, x.Locale });

        builder.Property(x => x.Locale).HasMaxLength(10).IsRequired();
        builder.Property(x => x.Label).HasMaxLength(200).IsRequired();

        builder.HasIndex(x => x.Locale).HasDatabaseName("IX_LookupValueLabel_Locale");
    }
}
