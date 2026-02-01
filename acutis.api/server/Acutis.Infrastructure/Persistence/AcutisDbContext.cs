using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Persistence;

public class AcutisDbContext : DbContext
{
    public AcutisDbContext(DbContextOptions<AcutisDbContext> options)
        : base(options)
    {
    }

    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<TherapyTermRating> TherapyTermRatings => Set<TherapyTermRating>();
    public DbSet<TherapyTerm> TherapyTerms => Set<TherapyTerm>();
    public DbSet<TherapyModule> TherapyModules => Set<TherapyModule>();
    public DbSet<ModuleQuestion> ModuleQuestions => Set<ModuleQuestion>();
    public DbSet<ModuleQuestionPart> ModuleQuestionParts => Set<ModuleQuestionPart>();
    public DbSet<GroupSession> GroupSessions => Set<GroupSession>();
    public DbSet<GroupSessionParticipant> GroupSessionParticipants => Set<GroupSessionParticipant>();
    public DbSet<SessionNote> SessionNotes => Set<SessionNote>();
    public DbSet<QuickCommentTemplate> QuickCommentTemplates => Set<QuickCommentTemplate>();
    public DbSet<SessionNoteComment> SessionNoteComments => Set<SessionNoteComment>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AcutisDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
