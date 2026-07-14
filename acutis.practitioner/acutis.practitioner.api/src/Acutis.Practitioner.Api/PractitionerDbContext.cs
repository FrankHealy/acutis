using Microsoft.EntityFrameworkCore;
namespace Acutis.Practitioner.Api;
public sealed class PractitionerDbContext(DbContextOptions<PractitionerDbContext> options) : DbContext(options)
{
    public DbSet<PractitionerTenant> Tenants => Set<PractitionerTenant>();
    public DbSet<TenantBranding> Branding => Set<TenantBranding>();
    public DbSet<PractitionerMembership> Memberships => Set<PractitionerMembership>();
    public DbSet<PractitionerClient> Clients => Set<PractitionerClient>();
    public DbSet<PractitionerAssessment> Assessments => Set<PractitionerAssessment>();
    public DbSet<PractitionerCarePlan> CarePlans => Set<PractitionerCarePlan>();
    public DbSet<PractitionerAppointment> Appointments => Set<PractitionerAppointment>();
    public DbSet<PractitionerVideoConsultation> VideoConsultations => Set<PractitionerVideoConsultation>();
    public DbSet<PractitionerVideoInvitation> VideoInvitations => Set<PractitionerVideoInvitation>();
    public DbSet<PractitionerFormDefinition> FormDefinitions => Set<PractitionerFormDefinition>();
    public DbSet<PractitionerFormAssignment> FormAssignments => Set<PractitionerFormAssignment>();
    public DbSet<PractitionerFormResponse> FormResponses => Set<PractitionerFormResponse>();
    public DbSet<PractitionerAuditEvent> AuditEvents => Set<PractitionerAuditEvent>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<TenantBranding>().HasKey(x => x.TenantId);
        b.Entity<PractitionerTenant>().HasOne(x => x.Branding).WithOne(x => x.Tenant).HasForeignKey<TenantBranding>(x => x.TenantId);
        b.Entity<PractitionerMembership>().HasIndex(x => new { x.TenantId, x.ExternalSubject }).IsUnique();
        b.Entity<PractitionerMembership>().HasOne(x => x.Tenant).WithMany().HasForeignKey(x => x.TenantId);
        b.Entity<PractitionerClient>().HasIndex(x => new { x.TenantId, x.PractitionerSubject });
        b.Entity<PractitionerAssessment>().HasOne<PractitionerClient>().WithMany().HasForeignKey(x => x.ClientId);
        b.Entity<PractitionerCarePlan>().HasOne<PractitionerClient>().WithMany().HasForeignKey(x => x.ClientId);
        b.Entity<PractitionerAppointment>().HasOne(x => x.Client).WithMany().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.SetNull);
        b.Entity<PractitionerVideoConsultation>().Property(x => x.Status).HasConversion<string>();
        b.Entity<PractitionerVideoConsultation>().HasIndex(x => x.AppointmentId).IsUnique();
        b.Entity<PractitionerVideoConsultation>().HasOne(x => x.Appointment).WithOne().HasForeignKey<PractitionerVideoConsultation>(x => x.AppointmentId);
        b.Entity<PractitionerVideoInvitation>().Property(x => x.TokenHash).HasMaxLength(32).IsFixedLength();
        b.Entity<PractitionerVideoInvitation>().Property(x => x.VerificationTokenHash).HasMaxLength(32).IsFixedLength();
        b.Entity<PractitionerVideoInvitation>().Property(x => x.RowVersion).IsRowVersion();
        b.Entity<PractitionerVideoInvitation>().HasIndex(x => x.TokenHash).IsUnique();
        b.Entity<PractitionerVideoInvitation>().HasIndex(x => new { x.OrganisationId, x.AppointmentId });
        b.Entity<PractitionerVideoInvitation>().HasOne<PractitionerVideoConsultation>().WithMany().HasForeignKey(x => x.VideoConsultationId);
        b.Entity<PractitionerVideoInvitation>().HasOne(x => x.Appointment).WithMany().HasForeignKey(x => x.AppointmentId).OnDelete(DeleteBehavior.NoAction);
        b.Entity<PractitionerVideoInvitation>().HasOne(x => x.Client).WithMany().HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.NoAction);
        b.Entity<PractitionerFormDefinition>().HasIndex(x => new { x.TenantId, x.Code, x.Version }).IsUnique();
        b.Entity<PractitionerFormAssignment>().HasOne<PractitionerFormDefinition>().WithMany().HasForeignKey(x => x.FormDefinitionId);
        b.Entity<PractitionerFormAssignment>().HasOne<PractitionerClient>().WithMany().HasForeignKey(x => x.ClientId);
        b.Entity<PractitionerFormResponse>().HasOne<PractitionerFormAssignment>().WithMany().HasForeignKey(x => x.AssignmentId);
    }
}
