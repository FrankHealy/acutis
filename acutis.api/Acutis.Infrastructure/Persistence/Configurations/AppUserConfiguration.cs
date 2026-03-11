using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("AppUser");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ExternalSubject).HasMaxLength(200).IsRequired();
        builder.Property(x => x.UserName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(320).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.LastSeenAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.HasIndex(x => x.ExternalSubject).IsUnique();
        builder.HasIndex(x => x.UserName);
        builder.HasMany(x => x.RoleAssignments)
            .WithOne(x => x.AppUser)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
