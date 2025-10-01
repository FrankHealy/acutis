using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class TherapyTermRatingConfiguration : IEntityTypeConfiguration<TherapyTermRating>
{
    public void Configure(EntityTypeBuilder<TherapyTermRating> builder)
    {
        builder.ToTable("TherapyTermRatings", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Label).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(256);
        builder.Property(x => x.ExternalId).IsRequired();

        builder.HasIndex(x => x.ExternalId).IsUnique();
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
