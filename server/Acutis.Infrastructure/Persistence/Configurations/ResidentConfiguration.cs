using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Acutis.Domain.Entities;

namespace Acutis.Infrastructure.Persistence.Configurations
{
    public class ResidentConfiguration : IEntityTypeConfiguration<Resident>
    {
        public void Configure(EntityTypeBuilder<Resident> builder)
        {
            builder.ToTable("Residents");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.FirstName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(r => r.Surname)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(r => r.SocialSecurityNumber)
                   .HasMaxLength(50);

            builder.Property(r => r.EmailAddress)
                   .HasMaxLength(200);

            builder.Property(r => r.PhoneNumber)
                   .HasMaxLength(50);

            builder.Property(r => r.RoomNumber)
                   .HasMaxLength(20);

            // Relationships
            builder.HasOne(r => r.Address)
                   .WithMany()
                   .HasForeignKey(r => r.AddressId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.Country)
                   .WithMany()
                   .HasForeignKey(r => r.CountryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.ProbationRequirement)
                   .WithMany()
                   .HasForeignKey(r => r.ProbationRequirementId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.PrimaryAddiction)
                   .WithMany()
                   .HasForeignKey(r => r.PrimaryAddictionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(r => r.DataQuality)
                   .HasConversion<string>()
                   .HasMaxLength(20);

            builder.Property(r => r.AdmissionPhase)
                   .HasConversion<string>()
                   .HasMaxLength(30);

            builder.Property(r => r.PreferredStepDownHouse)
                   .HasConversion<string>()
                   .HasMaxLength(50);

            builder.Property(r => r.QuestionnairesJson)
                   .HasColumnType("nvarchar(max)");
        }
    }
}
