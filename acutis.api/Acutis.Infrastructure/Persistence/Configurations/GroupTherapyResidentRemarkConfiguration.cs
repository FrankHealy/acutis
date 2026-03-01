using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class GroupTherapyResidentRemarkConfiguration : IEntityTypeConfiguration<GroupTherapyResidentRemark>
{
    public void Configure(EntityTypeBuilder<GroupTherapyResidentRemark> builder)
    {
        builder.ToTable("GroupTherapyResidentRemark");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ProgramCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ModuleKey).HasMaxLength(100).IsRequired();
        builder.Property(x => x.NoteLinesJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.FreeText).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.UnitCode, x.ProgramCode, x.ModuleKey, x.ResidentId })
            .IsUnique()
            .HasDatabaseName("UQ_GroupTherapyResidentRemark_Unit_Program_Module_Resident");
    }
}
