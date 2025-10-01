using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class ResidentConfiguration : IEntityTypeConfiguration<Resident>
{
    public void Configure(EntityTypeBuilder<Resident> builder)
    {
        builder.ToTable("Residents", schema: "Admissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Psn)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.FirstName)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.Surname)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.Nationality)
            .HasMaxLength(64);

        builder.Property(x => x.RoomNumber)
            .HasMaxLength(16)
            .HasDefaultValue("-");

        builder.Property(x => x.PhotoUrl)
            .HasMaxLength(512);

        builder.Property(x => x.PrimaryAddiction)
            .HasMaxLength(64);

        builder.HasIndex(x => x.Psn).IsUnique();
        builder.HasIndex(x => new { x.Surname, x.FirstName });

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
