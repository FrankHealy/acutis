using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class TherapyTopicConfiguration : IEntityTypeConfiguration<TherapyTopic>
{
    public void Configure(EntityTypeBuilder<TherapyTopic> builder)
    {
        builder.ToTable("TherapyTopic");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(120).IsRequired();
        builder.Property(x => x.DefaultName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}
