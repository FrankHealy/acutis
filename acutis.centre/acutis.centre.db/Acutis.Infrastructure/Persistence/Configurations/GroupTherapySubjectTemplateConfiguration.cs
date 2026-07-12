using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapySubjectTemplateConfiguration : IEntityTypeConfiguration<GroupTherapySubjectTemplate>
{
    public void Configure(EntityTypeBuilder<GroupTherapySubjectTemplate> builder)
    {
        builder.ToTable("GroupTherapySubjectTemplate");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ProgramCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.WeekNumber).IsRequired();
        builder.Property(x => x.Topic).HasMaxLength(200).IsRequired();
        builder.Property(x => x.IntroText).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.WeekNumber })
            .IsUnique()
            .HasDatabaseName("UQ_GroupTherapySubjectTemplate_Unit_Program_Week");

        builder.HasMany(x => x.DailyQuestions)
            .WithOne(x => x.SubjectTemplate)
            .HasForeignKey(x => x.SubjectTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
