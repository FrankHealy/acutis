using System.Security.Claims;
using Acutis.Application.DTOs;
using Acutis.Application.Requests;

namespace Acutis.Application.Services;

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
