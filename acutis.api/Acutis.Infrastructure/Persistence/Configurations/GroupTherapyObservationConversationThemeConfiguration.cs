using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapyObservationConversationThemeConfiguration : IEntityTypeConfiguration<GroupTherapyObservationConversationTheme>
{
    public void Configure(EntityTypeBuilder<GroupTherapyObservationConversationTheme> builder)
    {
        builder.ToTable("GroupTherapyObservationConversationTheme");
        builder.HasKey(x => new { x.ObservationId, x.ConversationThemeId });

        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.HasIndex(x => x.ConversationThemeId);

        builder.HasOne(x => x.Observation)
            .WithMany(x => x.ConversationThemes)
            .HasForeignKey(x => x.ObservationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.ConversationTheme)
            .WithMany(x => x.ObservationThemes)
            .HasForeignKey(x => x.ConversationThemeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
