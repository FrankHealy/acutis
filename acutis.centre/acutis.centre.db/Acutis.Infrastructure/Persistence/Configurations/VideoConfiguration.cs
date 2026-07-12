using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class VideoConfiguration : IEntityTypeConfiguration<Video>
{
    public void Configure(EntityTypeBuilder<Video> builder)
    {
        builder.ToTable("Video");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Url).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.LengthSeconds).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.Source).HasMaxLength(300);
        builder.Property(x => x.Language).HasMaxLength(20).IsRequired();
        builder.Property(x => x.TagsJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.CreatedBy).HasMaxLength(200).IsRequired();
        builder.Property(x => x.ModifiedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.ModifiedBy).HasMaxLength(200).IsRequired();

        builder.HasIndex(x => x.Key).IsUnique();
        builder.HasIndex(x => new { x.IsActive, x.Title });
    }
}
