using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class TherapyTermConfiguration : IEntityTypeConfiguration<TherapyTerm>
{
    public void Configure(EntityTypeBuilder<TherapyTerm> builder)
    {
        builder.ToTable("TherapyTerms", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Term).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1024);
        builder.Property(x => x.OwnerId).HasMaxLength(64);
        builder.Property(x => x.ExternalId).IsRequired();

        builder.HasIndex(x => x.ExternalId).IsUnique();
        builder.HasOne(x => x.Rating)
            .WithMany(r => r.Terms)
            .HasForeignKey(x => x.RatingId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
