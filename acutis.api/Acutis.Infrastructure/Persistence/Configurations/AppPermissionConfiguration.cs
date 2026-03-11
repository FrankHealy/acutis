using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class AppPermissionConfiguration : IEntityTypeConfiguration<AppPermission>
{
    public void Configure(EntityTypeBuilder<AppPermission> builder)
    {
        builder.ToTable("AppPermission");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Key).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(100).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.HasIndex(x => x.Key).IsUnique();
        builder.HasMany(x => x.RolePermissions)
            .WithOne(x => x.AppPermission)
            .HasForeignKey(x => x.AppPermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
