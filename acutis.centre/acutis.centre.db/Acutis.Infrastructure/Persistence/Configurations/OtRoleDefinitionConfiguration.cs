using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class OtRoleDefinitionConfiguration : IEntityTypeConfiguration<OtRoleDefinition>
{
    public void Configure(EntityTypeBuilder<OtRoleDefinition> builder)
    {
        builder.ToTable("OtRoleDefinition");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(160).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.RoleType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.Capacity);
        builder.Property(x => x.RequiresTraining).IsRequired();
        builder.Property(x => x.IsOneOff).IsRequired();
        builder.Property(x => x.ScheduledDate).HasColumnType("date");
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.DisplayOrder).IsRequired();

        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.IsActive });
        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.Name });
        builder.HasIndex(x => new { x.CentreId, x.UnitId, x.IsOneOff, x.ScheduledDate });
    }
}
