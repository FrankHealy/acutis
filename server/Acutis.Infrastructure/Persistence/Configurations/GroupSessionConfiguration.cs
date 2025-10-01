using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class GroupSessionConfiguration : IEntityTypeConfiguration<GroupSession>
{
    public void Configure(EntityTypeBuilder<GroupSession> builder)
    {
        builder.ToTable("GroupSessions", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Facilitator).HasMaxLength(128);
        builder.Property(x => x.Location).HasMaxLength(128);

        builder.HasOne(x => x.Module)
            .WithMany(m => m.Sessions)
            .HasForeignKey(x => x.ModuleId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
