using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapyFacilitationConfigConfiguration : IEntityTypeConfiguration<GroupTherapyFacilitationConfig>
{
    public void Configure(EntityTypeBuilder<GroupTherapyFacilitationConfig> builder)
    {
        builder.ToTable("GroupTherapyFacilitationConfig");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCode).HasMaxLength(100);
        builder.Property(x => x.ProgramCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CounsellorStyle).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ResidentTimeMultiplier).HasColumnType("decimal(5,2)").IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.CounsellorStyle })
            .IsUnique()
            .HasDatabaseName("UQ_GroupTherapyFacilitationConfig_Scope_Style");
        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.IsActive, x.SortOrder });
    }
}
