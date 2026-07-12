using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapyConversationThemeConfiguration : IEntityTypeConfiguration<GroupTherapyConversationTheme>
{
    public void Configure(EntityTypeBuilder<GroupTherapyConversationTheme> builder)
    {
        builder.ToTable("GroupTherapyConversationTheme");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCode).HasMaxLength(100);
        builder.Property(x => x.ProgramCode).HasMaxLength(100);
        builder.Property(x => x.Code).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Label).HasMaxLength(160).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.Code })
            .IsUnique()
            .HasDatabaseName("UQ_GroupTherapyConversationTheme_Scope_Code");
        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.IsActive, x.SortOrder });
    }
}
