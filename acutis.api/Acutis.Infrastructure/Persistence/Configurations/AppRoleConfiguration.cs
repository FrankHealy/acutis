using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class AppRoleConfiguration : IEntityTypeConfiguration<AppRole>
{
    public void Configure(EntityTypeBuilder<AppRole> builder)
    {
        builder.ToTable("AppRole");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Key).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.ExternalRoleName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.IsSystemRole).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.HasIndex(x => x.Key).IsUnique();
        builder.HasIndex(x => x.ExternalRoleName);
        builder.HasMany(x => x.RolePermissions)
            .WithOne(x => x.AppRole)
            .HasForeignKey(x => x.AppRoleId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.UserAssignments)
            .WithOne(x => x.AppRole)
            .HasForeignKey(x => x.AppRoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
