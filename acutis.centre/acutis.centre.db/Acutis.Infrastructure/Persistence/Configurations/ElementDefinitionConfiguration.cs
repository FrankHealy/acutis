using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ElementDefinitionConfiguration : IEntityTypeConfiguration<ElementDefinition>
{
    public void Configure(EntityTypeBuilder<ElementDefinition> builder)
    {
        builder.ToTable("ElementDefinition");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Label).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.HelpText).HasMaxLength(2000);
        builder.Property(x => x.ElementType).HasMaxLength(50).IsRequired();
        builder.Property(x => x.SourceKind).HasMaxLength(30).IsRequired();
        builder.Property(x => x.CanonicalFieldKey).HasMaxLength(100);
        builder.Property(x => x.OptionSetKey).HasMaxLength(100);
        builder.Property(x => x.SourceDocumentReference).HasMaxLength(200);
        builder.Property(x => x.FieldConfigJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(30).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => x.Key).IsUnique();

        builder.HasOne(x => x.Group)
            .WithMany(x => x.Definitions)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
