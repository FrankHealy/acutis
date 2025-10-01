using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class SessionNoteConfiguration : IEntityTypeConfiguration<SessionNote>
{
    public void Configure(EntityTypeBuilder<SessionNote> builder)
    {
        builder.ToTable("SessionNotes", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Body).HasColumnType("nvarchar(max)");

        builder.HasOne(x => x.Participant)
            .WithOne(p => p.Note)
            .HasForeignKey<SessionNote>(x => x.ParticipantId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
