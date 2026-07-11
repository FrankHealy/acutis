using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Data;

public sealed class AcutisAmbulatoryDbContext : DbContext
{
    public AcutisAmbulatoryDbContext(DbContextOptions<AcutisAmbulatoryDbContext> options) : base(options)
    {
    }

    public DbSet<AmbulatoryParticipant> Participants => Set<AmbulatoryParticipant>();
    public DbSet<AmbulatoryAssessment> Assessments => Set<AmbulatoryAssessment>();
    public DbSet<AmbulatoryCarePlan> CarePlans => Set<AmbulatoryCarePlan>();
    public DbSet<AmbulatoryAppointment> Appointments => Set<AmbulatoryAppointment>();
    public DbSet<VideoConsultation> VideoConsultations => Set<VideoConsultation>();
    public DbSet<VideoConsultationInvitation> VideoConsultationInvitations => Set<VideoConsultationInvitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AmbulatoryParticipant>(entity =>
        {
            entity.ToTable("AmbulatoryParticipant");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ProgrammeType).HasConversion<string>().HasMaxLength(32);
            entity.Property(x => x.DisplayName).HasMaxLength(160);
            entity.Property(x => x.PreferredName).HasMaxLength(160);
            entity.Property(x => x.Phone).HasMaxLength(80);
            entity.Property(x => x.Email).HasMaxLength(254);
            entity.Property(x => x.ReferralSource).HasMaxLength(160);
            entity.Property(x => x.Status).HasMaxLength(40);
            entity.Property(x => x.CounsellorUserId).HasMaxLength(160);
            entity.Property(x => x.CounsellorDisplayName).HasMaxLength(160);
            entity.HasIndex(x => new { x.ProgrammeType, x.CounsellorUserId, x.Status });
        });

        modelBuilder.Entity<AmbulatoryAssessment>(entity =>
        {
            entity.ToTable("AmbulatoryAssessment");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.AssessmentType).HasMaxLength(40);
            entity.Property(x => x.CompletedByUserId).HasMaxLength(160);
            entity.HasOne(x => x.Participant)
                .WithMany(x => x.Assessments)
                .HasForeignKey(x => x.ParticipantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AmbulatoryCarePlan>(entity =>
        {
            entity.ToTable("AmbulatoryCarePlan");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Status).HasMaxLength(40);
            entity.Property(x => x.CreatedByUserId).HasMaxLength(160);
            entity.Property(x => x.UpdatedByUserId).HasMaxLength(160);
            entity.HasOne(x => x.Participant)
                .WithMany(x => x.CarePlans)
                .HasForeignKey(x => x.ParticipantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AmbulatoryAppointment>(entity =>
        {
            entity.ToTable("AmbulatoryAppointment");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ProgrammeType).HasConversion<string>().HasMaxLength(32);
            entity.Property(x => x.CounsellorUserId).HasMaxLength(160);
            entity.Property(x => x.CounsellorDisplayName).HasMaxLength(160);
            entity.Property(x => x.AppointmentType).HasMaxLength(60);
            entity.Property(x => x.Title).HasMaxLength(200);
            entity.Property(x => x.DeliveryMode).HasMaxLength(40);
            entity.Property(x => x.Status).HasMaxLength(40);
            entity.Property(x => x.AvProvider).HasMaxLength(80);
            entity.Property(x => x.AvRoomName).HasMaxLength(160);
            entity.Property(x => x.AvJoinUrl).HasMaxLength(600);
            entity.HasIndex(x => new { x.ProgrammeType, x.CounsellorUserId, x.StartsAtUtc });
            entity.HasOne(x => x.Participant)
                .WithMany(x => x.Appointments)
                .HasForeignKey(x => x.ParticipantId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<VideoConsultation>(entity =>
        {
            entity.ToTable("VideoConsultation");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.RoomName).HasMaxLength(96);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
            entity.HasIndex(x => x.AppointmentId).IsUnique();
            entity.HasIndex(x => x.RoomName).IsUnique();
            entity.HasOne(x => x.Appointment)
                .WithOne(x => x.VideoConsultation)
                .HasForeignKey<VideoConsultation>(x => x.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VideoConsultationInvitation>(entity =>
        {
            entity.ToTable("VideoConsultationInvitation");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.TokenHash).HasMaxLength(32).IsRequired();
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => new { x.VideoConsultationId, x.ExpiresAtUtc });
            entity.HasOne(x => x.VideoConsultation)
                .WithMany(x => x.Invitations)
                .HasForeignKey(x => x.VideoConsultationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}