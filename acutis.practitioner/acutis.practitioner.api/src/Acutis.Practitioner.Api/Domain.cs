using System.ComponentModel.DataAnnotations;

namespace Acutis.Practitioner.Api;

public sealed class PractitionerTenant { public Guid Id { get; set; } [MaxLength(160)] public string OrganisationName { get; set; } = ""; public bool IsDemo { get; set; } public TenantBranding? Branding { get; set; } }
public sealed class TenantBranding { public Guid TenantId { get; set; } public string ThemeJson { get; set; } = "{}"; public string TerminologyJson { get; set; } = "{}"; public string FeatureFlagsJson { get; set; } = "{}"; public bool PoweredByAcutis { get; set; } = true; public PractitionerTenant Tenant { get; set; } = null!; }
public sealed class PractitionerMembership { public Guid Id { get; set; } public Guid TenantId { get; set; } [MaxLength(200)] public string ExternalSubject { get; set; } = ""; public string RolesJson { get; set; } = "[]"; public bool IsActive { get; set; } = true; public PractitionerTenant Tenant { get; set; } = null!; }
public sealed class PractitionerClient { public Guid Id { get; set; } public Guid TenantId { get; set; } [MaxLength(160)] public string DisplayName { get; set; } = ""; [MaxLength(160)] public string Surname { get; set; } = ""; public DateOnly? DateOfBirth { get; set; } [MaxLength(160)] public string? PreferredName { get; set; } [MaxLength(80)] public string? Phone { get; set; } [MaxLength(254)] public string? Email { get; set; } [MaxLength(160)] public string? ReferralSource { get; set; } [MaxLength(40)] public string Status { get; set; }="active"; [MaxLength(160)] public string PractitionerSubject { get; set; } = ""; [MaxLength(160)] public string PractitionerDisplayName { get; set; }=""; public DateTime CreatedAtUtc { get; set; } public DateTime UpdatedAtUtc { get; set; } }
public sealed class PractitionerAssessment { public Guid Id { get; set; } public Guid TenantId { get; set; } public Guid ClientId { get; set; } [MaxLength(40)] public string AssessmentType { get; set; }="initial"; public string CaptureJson { get; set; }="{}"; public DateTime CompletedAtUtc { get; set; } [MaxLength(160)] public string CompletedBySubject { get; set; }=""; }
public sealed class PractitionerCarePlan { public Guid Id { get; set; } public Guid TenantId { get; set; } public Guid ClientId { get; set; } [MaxLength(40)] public string Status { get; set; }="draft"; public string CaptureJson { get; set; }="{}"; public DateOnly? ReviewDate { get; set; } public DateTime CreatedAtUtc { get; set; } public DateTime UpdatedAtUtc { get; set; } }
public sealed class PractitionerAppointment { public Guid Id { get; set; } public Guid TenantId { get; set; } public Guid? ClientId { get; set; } [MaxLength(160)] public string PractitionerSubject { get; set; } = ""; [MaxLength(160)] public string PractitionerDisplayName { get; set; }=""; [MaxLength(60)] public string AppointmentType { get; set; }="individual-therapy"; [MaxLength(200)] public string Title { get; set; }=""; public DateTime StartsAtUtc { get; set; } public DateTime EndsAtUtc { get; set; } [MaxLength(40)] public string DeliveryMode { get; set; }="in-person"; [MaxLength(40)] public string Status { get; set; } = "scheduled"; public string? Notes { get; set; } public DateTime CreatedAtUtc { get; set; } public DateTime UpdatedAtUtc { get; set; } public PractitionerClient? Client { get; set; } }
public enum VideoConsultationStatus { Scheduled, Open, Ended, Cancelled }
public sealed class PractitionerVideoConsultation { public Guid Id { get; set; } public Guid TenantId { get; set; } public Guid AppointmentId { get; set; } [MaxLength(64)] public string RoomName { get; set; }=""; public VideoConsultationStatus Status { get; set; } public DateTime CreatedAtUtc { get; set; } public DateTime? StartedAtUtc { get; set; } public DateTime? EndedAtUtc { get; set; } public PractitionerAppointment Appointment { get; set; }=null!; }
public sealed class PractitionerVideoInvitation
{
    public Guid Id { get; set; }
    public Guid OrganisationId { get; set; }
    public Guid AppointmentId { get; set; }
    public Guid VideoConsultationId { get; set; }
    public Guid ClientId { get; set; }
    [MaxLength(254)] public string RecipientEmail { get; set; } = "";
    public byte[] TokenHash { get; set; } = [];
    public DateTime CreatedAtUtc { get; set; }
    [MaxLength(200)] public string CreatedByUserId { get; set; } = "";
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    [MaxLength(200)] public string? RevokedByUserId { get; set; }
    public Guid? ReplacedByInvitationId { get; set; }
    public DateTime? FirstOpenedAtUtc { get; set; }
    public DateTime? LastOpenedAtUtc { get; set; }
    public DateTime? IdentityVerifiedAtUtc { get; set; }
    public DateTime? LastSentAtUtc { get; set; }
    public int SendAttemptCount { get; set; }
    [MaxLength(30)] public string SendStatus { get; set; } = "Pending";
    [MaxLength(40)] public string? SendFailureCategory { get; set; }
    [MaxLength(240)] public string? SanitisedSendFailureReason { get; set; }
    [MaxLength(200)] public string? ProviderMessageId { get; set; }
    public int FailedIdentityAttemptCount { get; set; }
    public DateTime? IdentityLockedUntilUtc { get; set; }
    public byte[]? VerificationTokenHash { get; set; }
    public DateTime? VerificationExpiresAtUtc { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    public PractitionerAppointment Appointment { get; set; } = null!;
    public PractitionerClient Client { get; set; } = null!;
}
public sealed class PractitionerFormDefinition { public Guid Id { get; set; } public Guid TenantId { get; set; } [MaxLength(100)] public string Code { get; set; } = ""; public int Version { get; set; } public string SchemaJson { get; set; } = "{}"; [MaxLength(30)] public string Status { get; set; } = "draft"; }
public sealed class PractitionerFormAssignment { public Guid Id { get; set; } public Guid TenantId { get; set; } public Guid FormDefinitionId { get; set; } public Guid ClientId { get; set; } public DateTime AssignedAtUtc { get; set; } public DateTime? DueAtUtc { get; set; } [MaxLength(30)] public string Status { get; set; } = "assigned"; }
public sealed class PractitionerFormResponse { public Guid Id { get; set; } public Guid TenantId { get; set; } public Guid AssignmentId { get; set; } public string AnswersJson { get; set; } = "{}"; [MaxLength(30)] public string Status { get; set; } = "draft"; public DateTime UpdatedAtUtc { get; set; } }
public sealed class PractitionerAuditEvent { public Guid Id { get; set; } public Guid TenantId { get; set; } [MaxLength(200)] public string ExternalSubject { get; set; } = ""; [MaxLength(80)] public string Action { get; set; } = ""; [MaxLength(120)] public string EntityType { get; set; } = ""; [MaxLength(200)] public string EntityId { get; set; } = ""; public DateTime OccurredAtUtc { get; set; } public string MetadataJson { get; set; } = "{}"; }
