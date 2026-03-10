using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class MediaAssetConfiguration : IEntityTypeConfiguration<MediaAsset>
{
    public void Configure(EntityTypeBuilder<MediaAsset> builder)
    {
        builder.ToTable("MediaAsset");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.AssetType).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(x => x.ShortName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.FileName).HasMaxLength(500).IsRequired();
        builder.Property(x => x.RelativePath).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.LengthSeconds).IsRequired();
        builder.Property(x => x.LastPlayedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.UnitCode, x.AssetType, x.FileName }).IsUnique();
        builder.HasIndex(x => new { x.UnitCode, x.AssetType, x.IsActive });
    }
}
