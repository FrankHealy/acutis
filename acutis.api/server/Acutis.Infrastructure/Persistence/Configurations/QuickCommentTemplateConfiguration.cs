using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class QuickCommentTemplateConfiguration : IEntityTypeConfiguration<QuickCommentTemplate>
{
    public void Configure(EntityTypeBuilder<QuickCommentTemplate> builder)
    {
        builder.ToTable("QuickCommentTemplates", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Text).HasMaxLength(128).IsRequired();
        builder.HasQueryFilter(x => !x.IsDeleted && x.IsActive);
    }
}
