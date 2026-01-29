using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class ModuleQuestionConfiguration : IEntityTypeConfiguration<ModuleQuestion>
{
    public void Configure(EntityTypeBuilder<ModuleQuestion> builder)
    {
        builder.ToTable("ModuleQuestions", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Prompt).HasMaxLength(512).IsRequired();
        builder.Property(x => x.DisplayOrder).HasDefaultValue(0);

        builder.HasOne(x => x.Module)
            .WithMany(m => m.Questions)
            .HasForeignKey(x => x.ModuleId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
