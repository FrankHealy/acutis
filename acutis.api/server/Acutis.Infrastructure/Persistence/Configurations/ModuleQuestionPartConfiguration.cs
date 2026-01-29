using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class ModuleQuestionPartConfiguration : IEntityTypeConfiguration<ModuleQuestionPart>
{
    public void Configure(EntityTypeBuilder<ModuleQuestionPart> builder)
    {
        builder.ToTable("ModuleQuestionParts", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Prompt).HasMaxLength(512).IsRequired();
        builder.Property(x => x.DisplayOrder).HasDefaultValue(0);

        builder.HasOne(x => x.Question)
            .WithMany(q => q.Parts)
            .HasForeignKey(x => x.QuestionId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
