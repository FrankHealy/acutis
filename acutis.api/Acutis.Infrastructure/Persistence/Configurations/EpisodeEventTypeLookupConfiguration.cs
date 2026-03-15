using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class EpisodeEventTypeLookupConfiguration : IEntityTypeConfiguration<EpisodeEventTypeLookup>
{
    public void Configure(EntityTypeBuilder<EpisodeEventTypeLookup> builder)
    {
        builder.ToTable("EpisodeEventType");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.Code).HasMaxLength(120).IsRequired();
        builder.Property(x => x.DefaultName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}
