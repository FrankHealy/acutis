using System.Text.Json.Serialization;

namespace Acutis.Api.Contracts;

public sealed class PractitionerVideoConsultationContextDto
{
    public Guid AppointmentId { get; init; }
    public string ClientName { get; init; } = string.Empty;
    public string PractitionerName { get; init; } = string.Empty;
    public DateTime StartsAtUtc { get; init; }
    public DateTime EndsAtUtc { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool CanJoin { get; init; }
    public string? JoinBlockedReason { get; init; }
}

public sealed class ExternalVideoConsultationContextDto
{
    public string ClientName { get; init; } = string.Empty;
    public string PractitionerName { get; init; } = string.Empty;
    public DateTime StartsAtUtc { get; init; }
    public DateTime EndsAtUtc { get; init; }
    public string Status { get; init; } = string.Empty;
}

public sealed class LiveKitJoinCredentialDto
{
    [JsonPropertyName("server_url")]
    public string ServerUrl { get; init; } = string.Empty;

    [JsonPropertyName("participant_token")]
    public string ParticipantToken { get; init; } = string.Empty;
}

public sealed class CreateVideoConsultationInvitationResponse
{
    [JsonPropertyName("invitation_token")]
    public string InvitationToken { get; init; } = string.Empty;

    [JsonPropertyName("expires_at_utc")]
    public DateTime ExpiresAtUtc { get; init; }
}

public sealed class ExternalInvitationRequest
{
    [JsonPropertyName("invitation_token")]
    public string InvitationToken { get; init; } = string.Empty;
}

public sealed class ExternalJoinCredentialRequest
{
    [JsonPropertyName("invitation_token")]
    public string InvitationToken { get; init; } = string.Empty;

    [JsonPropertyName("display_name")]
    public string DisplayName { get; init; } = string.Empty;
}
