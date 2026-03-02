using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class TherapyTopicCompletionConfiguration : IEntityTypeConfiguration<TherapyTopicCompletion>
{
    public void Configure(EntityTypeBuilder<TherapyTopicCompletion> builder)
    {
        builder.ToTable("TherapyTopicCompletion");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompletedOn).HasColumnType("date").IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.EpisodeId, x.TherapyTopicId, x.CompletedOn });
    }
}
