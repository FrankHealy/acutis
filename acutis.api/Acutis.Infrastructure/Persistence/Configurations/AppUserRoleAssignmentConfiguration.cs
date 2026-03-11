using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class AppUserRoleAssignmentConfiguration : IEntityTypeConfiguration<AppUserRoleAssignment>
{
    public void Configure(EntityTypeBuilder<AppUserRoleAssignment> builder)
    {
        builder.ToTable("AppUserRoleAssignment");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ScopeType).HasMaxLength(20).IsRequired();
        builder.Property(x => x.CentreId).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.HasIndex(x => new { x.AppUserId, x.AppRoleId, x.ScopeType, x.CentreId })
            .IsUnique()
            .HasFilter("[UnitId] IS NULL");
        builder.HasIndex(x => new { x.AppUserId, x.AppRoleId, x.ScopeType, x.CentreId, x.UnitId })
            .IsUnique()
            .HasFilter("[UnitId] IS NOT NULL");
        builder.HasOne(x => x.Centre)
            .WithMany(x => x.UserAssignments)
            .HasForeignKey(x => x.CentreId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
