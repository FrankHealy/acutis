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

        builder.Property(x => x.ClientEventId);
        builder.Property(x => x.EventTypeId).IsRequired();
        builder.Property(x => x.EventDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.PayloadJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Reason).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();

        builder.HasOne(x => x.EventTypeLookup)
            .WithMany(x => x.EpisodeEvents)
            .HasForeignKey(x => x.EventTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Episode)
            .WithMany(x => x.EpisodeEvents)
            .HasForeignKey(x => x.EpisodeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EpisodeId, x.EventDate, x.CreatedAt });
        builder.HasIndex(x => x.EventTypeId);
        builder.HasIndex(x => x.ClientEventId).IsUnique().HasFilter("[ClientEventId] IS NOT NULL");
    }
}
