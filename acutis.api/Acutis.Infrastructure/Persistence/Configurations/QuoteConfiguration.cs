using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class QuoteConfiguration : IEntityTypeConfiguration<Quote>
{
    public void Configure(EntityTypeBuilder<Quote> builder)
    {
        builder.ToTable("Quote");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Text).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Attribution).HasMaxLength(300).IsRequired();
        builder.Property(x => x.SourceWork).HasMaxLength(300);
        builder.Property(x => x.SourceNotes).HasMaxLength(1000);
        builder.Property(x => x.Language).HasMaxLength(20).IsRequired();
        builder.Property(x => x.PronunciationGuide).HasMaxLength(500);
        builder.Property(x => x.TagsJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.CreatedBy).HasMaxLength(200).IsRequired();
        builder.Property(x => x.ModifiedAt).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.ModifiedBy).HasMaxLength(200).IsRequired();

        builder.HasIndex(x => new { x.Language, x.IsActive });
        builder.HasIndex(x => x.Attribution);
    }
}
