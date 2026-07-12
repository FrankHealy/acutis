using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ResidentOtRoleAssignmentConfiguration : IEntityTypeConfiguration<ResidentOtRoleAssignment>
{
    public void Configure(EntityTypeBuilder<ResidentOtRoleAssignment> builder)
    {
        builder.ToTable("ResidentOtRoleAssignment");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.AssignedAtUtc).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.ReleasedAtUtc).HasColumnType("datetime2");

        builder.HasIndex(x => new { x.OtRoleDefinitionId, x.ReleasedAtUtc });
        builder.HasIndex(x => new { x.EpisodeId, x.ReleasedAtUtc })
            .IsUnique()
            .HasFilter("[ReleasedAtUtc] IS NULL");

        builder.HasOne<OtRoleDefinition>()
            .WithMany()
            .HasForeignKey(x => x.OtRoleDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ResidentProgrammeEpisode>()
            .WithMany()
            .HasForeignKey(x => x.EpisodeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Resident>()
            .WithMany()
            .HasForeignKey(x => x.ResidentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
