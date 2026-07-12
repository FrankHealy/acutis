using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ElementGroupConfiguration : IEntityTypeConfiguration<ElementGroup>
{
    public void Configure(EntityTypeBuilder<ElementGroup> builder)
    {
        builder.ToTable("ElementGroup");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.SourceDocumentReference).HasMaxLength(200);
        builder.Property(x => x.Status).HasMaxLength(30).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => x.Key).IsUnique();
    }
}
