using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class SessionNoteCommentConfiguration : IEntityTypeConfiguration<SessionNoteComment>
{
    public void Configure(EntityTypeBuilder<SessionNoteComment> builder)
    {
        builder.ToTable("SessionNoteComments", schema: "Therapy");

        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.SessionNote)
            .WithMany(n => n.Comments)
            .HasForeignKey(x => x.SessionNoteId);

        builder.HasOne(x => x.QuickCommentTemplate)
            .WithMany(t => t.SessionNoteComments)
            .HasForeignKey(x => x.QuickCommentTemplateId);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
