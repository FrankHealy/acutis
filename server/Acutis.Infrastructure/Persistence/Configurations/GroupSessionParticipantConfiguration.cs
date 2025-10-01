using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class GroupSessionParticipantConfiguration : IEntityTypeConfiguration<GroupSessionParticipant>
{
    public void Configure(EntityTypeBuilder<GroupSessionParticipant> builder)
    {
        builder.ToTable("GroupSessionParticipants", schema: "Therapy");

        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Session)
            .WithMany(s => s.Participants)
            .HasForeignKey(x => x.SessionId);

        builder.HasOne(x => x.Resident)
            .WithMany(r => r.Sessions)
            .HasForeignKey(x => x.ResidentId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
