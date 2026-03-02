using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class ResidentWeeklyTherapyAssignmentConfiguration : IEntityTypeConfiguration<ResidentWeeklyTherapyAssignment>
{
    public void Configure(EntityTypeBuilder<ResidentWeeklyTherapyAssignment> builder)
    {
        builder.ToTable("ResidentWeeklyTherapyAssignment");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.WeekStartDate).HasColumnType("date").IsRequired();
        builder.Property(x => x.AssignmentSource).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(x => x.OverrideReason).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasColumnType("datetime2").IsRequired();

        builder.HasIndex(x => new { x.ResidentId, x.EpisodeId, x.WeekStartDate, x.CreatedAt });
        builder.HasOne<ResidentWeeklyTherapyAssignment>()
            .WithMany()
            .HasForeignKey(x => x.SupersedesAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
