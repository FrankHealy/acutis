using Acutis.Domain.Lookups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class LookupTypeConfiguration : IEntityTypeConfiguration<LookupType>
{
    public void Configure(EntityTypeBuilder<LookupType> builder)
    {
        builder.ToTable("LookupType", "dbo");
        builder.HasKey(x => x.LookupTypeId);

        builder.Property(x => x.Key).HasMaxLength(100).IsRequired();
        builder.Property(x => x.DefaultLocale).HasMaxLength(10).IsRequired().HasDefaultValue("en-IE");
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.Version).HasDefaultValue(1);

        builder.HasIndex(x => x.Key).IsUnique().HasDatabaseName("UQ_LookupType_Key");

        builder.HasMany(x => x.Values)
            .WithOne(v => v.LookupType)
            .HasForeignKey(v => v.LookupTypeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
