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
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.HasIndex(x => new { x.AppUserId, x.AppRoleId, x.UnitId }).IsUnique();
        builder.HasOne(x => x.Unit)
            .WithMany()
            .HasForeignKey(x => x.UnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
