// Stub signatures for a .NET 8 REST API with Azure AD JWT auth for call logging.
// Intended as a contract outline; implementations are left to the backend.
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.CallLogging;

public static class AuthSchemes
{
  // Matches the typical JWT Bearer scheme name for Azure AD.
  public const string AzureAdJwt = "AzureAdJwtBearer";
}

public static class AuthPolicies
{
  public const string CallLoggingRead = "CallLogging.Read";
  public const string CallLoggingWrite = "CallLogging.Write";
}

[ApiController]
[Route("api/call-logs")]
[Authorize(AuthenticationSchemes = AuthSchemes.AzureAdJwt)]
public sealed class CallLoggingController : ControllerBase
{
  private readonly ICallLoggingService _callLoggingService;

  public CallLoggingController(ICallLoggingService callLoggingService)
  {
    _callLoggingService = callLoggingService;
  }

  // POST /api/call-logs
  [HttpPost]
  [Authorize(Policy = AuthPolicies.CallLoggingWrite)]
  public Task<ActionResult<CallLogDto>> CreateAsync(
    [FromBody] CreateCallLogRequest request,
    CancellationToken cancellationToken)
  {
    throw new NotImplementedException();
  }

  // GET /api/call-logs/{id}
  [HttpGet("{id:guid}")]
  [Authorize(Policy = AuthPolicies.CallLoggingRead)]
  public Task<ActionResult<CallLogDto>> GetByIdAsync(
    [FromRoute] Guid id,
    CancellationToken cancellationToken)
  {
    throw new NotImplementedException();
  }

  // GET /api/call-logs?from=...&to=...&unit=...&callerType=...&concernType=...&status=...&urgency=...&page=...&pageSize=...
  [HttpGet]
  [Authorize(Policy = AuthPolicies.CallLoggingRead)]
  public Task<ActionResult<PagedResult<CallLogDto>>> QueryAsync(
    [FromQuery] CallLogQuery query,
    CancellationToken cancellationToken)
  {
    throw new NotImplementedException();
  }

  // PUT /api/call-logs/{id}
  [HttpPut("{id:guid}")]
  [Authorize(Policy = AuthPolicies.CallLoggingWrite)]
  public Task<ActionResult<CallLogDto>> UpdateAsync(
    [FromRoute] Guid id,
    [FromBody] UpdateCallLogRequest request,
    CancellationToken cancellationToken)
  {
    throw new NotImplementedException();
  }
}

public interface ICallLoggingService
{
  Task<CallLogDto> CreateAsync(
    CreateCallLogRequest request,
    ClaimsPrincipal user,
    CancellationToken cancellationToken);

  Task<CallLogDto?> GetByIdAsync(
    Guid id,
    CancellationToken cancellationToken);

  Task<PagedResult<CallLogDto>> QueryAsync(
    CallLogQuery query,
    CancellationToken cancellationToken);

  Task<CallLogDto> UpdateAsync(
    Guid id,
    UpdateCallLogRequest request,
    ClaimsPrincipal user,
    CancellationToken cancellationToken);
}

public sealed record CreateCallLogRequest(
  string FirstName,
  string Surname,
  string CallerType,
  string ConcernType,
  string Unit,
  string Location,
  string PhoneNumber,
  DateTimeOffset TimestampUtc,
  string Notes,
  string Status,
  string Urgency);

public sealed record UpdateCallLogRequest(
  string FirstName,
  string Surname,
  string CallerType,
  string ConcernType,
  string Unit,
  string Location,
  string PhoneNumber,
  DateTimeOffset TimestampUtc,
  string Notes,
  string Status,
  string Urgency);

public sealed record CallLogDto(
  Guid Id,
  string FirstName,
  string Surname,
  string CallerType,
  string ConcernType,
  string Unit,
  string Location,
  string PhoneNumber,
  DateTimeOffset TimestampUtc,
  string Notes,
  string Status,
  string Urgency,
  string CreatedBy,
  DateTimeOffset CreatedAtUtc,
  string? UpdatedBy,
  DateTimeOffset? UpdatedAtUtc);

public sealed record CallLogQuery(
  DateTimeOffset? From,
  DateTimeOffset? To,
  string? Unit,
  string? CallerType,
  string? ConcernType,
  string? Status,
  string? Urgency,
  int Page = 1,
  int PageSize = 50);

public sealed record PagedResult<T>(
  IReadOnlyList<T> Items,
  int Page,
  int PageSize,
  int TotalCount);
