using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class UnitVideoCurationConfiguration : IEntityTypeConfiguration<UnitVideoCuration>
{
    public void Configure(EntityTypeBuilder<UnitVideoCuration> builder)
    {
        builder.ToTable("UnitVideoCuration");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitId).IsRequired();
        builder.Property(x => x.VideoId).IsRequired();
        builder.Property(x => x.DisplayOrder);
        builder.Property(x => x.IsExcluded).IsRequired();

        builder.HasIndex(x => new { x.UnitId, x.VideoId }).IsUnique();
        builder.HasOne<Video>()
            .WithMany()
            .HasForeignKey(x => x.VideoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
