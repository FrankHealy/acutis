using Acutis.Domain.Lookups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class LookupValueConfiguration : IEntityTypeConfiguration<LookupValue>
{
    public void Configure(EntityTypeBuilder<LookupValue> builder)
    {
        builder.ToTable("LookupValue", "dbo");
        builder.HasKey(x => x.LookupValueId);

        builder.Property(x => x.Code).HasMaxLength(100).IsRequired();
        builder.Property(x => x.SortOrder).HasDefaultValue(0);
        builder.Property(x => x.IsActive).HasDefaultValue(true);

        builder.HasIndex(x => new { x.LookupTypeId, x.UnitId, x.Code })
            .IsUnique()
            .HasFilter(null)
            .HasDatabaseName("UQ_LookupValue_Type_Unit_Code");

        builder.HasIndex(x => x.LookupTypeId)
            .HasDatabaseName("IX_LookupValue_LookupTypeId");

        builder.HasIndex(x => new { x.LookupTypeId, x.UnitId, x.SortOrder, x.IsActive })
            .HasDatabaseName("IX_LookupValue_Type_Unit_Sort_IsActive");

        builder.HasMany(x => x.Labels)
            .WithOne(l => l.LookupValue)
            .HasForeignKey(l => l.LookupValueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
