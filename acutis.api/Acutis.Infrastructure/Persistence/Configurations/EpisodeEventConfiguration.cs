using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class EpisodeEventConfiguration : IEntityTypeConfiguration<EpisodeEvent>
{
    public void Configure(EntityTypeBuilder<EpisodeEvent> builder)
    {
        builder.ToTable("EpisodeEvent");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EventType).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(x => x.EventDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.PayloadJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.EpisodeId, x.EventDate, x.CreatedAt });
    }
}
