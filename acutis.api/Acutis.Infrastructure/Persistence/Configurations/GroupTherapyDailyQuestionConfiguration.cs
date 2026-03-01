using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapyDailyQuestionConfiguration : IEntityTypeConfiguration<GroupTherapyDailyQuestion>
{
    public void Configure(EntityTypeBuilder<GroupTherapyDailyQuestion> builder)
    {
        builder.ToTable("GroupTherapyDailyQuestion");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DayNumber).IsRequired();
        builder.Property(x => x.SortOrder).IsRequired();
        builder.Property(x => x.QuestionText).HasMaxLength(500).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.SubjectTemplateId, x.DayNumber, x.SortOrder })
            .IsUnique()
            .HasDatabaseName("UQ_GroupTherapyDailyQuestion_Subject_Day_Sort");
    }
}
