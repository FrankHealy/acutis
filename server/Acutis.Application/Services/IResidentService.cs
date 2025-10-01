using Acutis.Application.DTOs;
using Acutis.Application.Common;

namespace Acutis.Application.Services;

public interface IResidentService
{
    Task<PagedResult<ResidentDto>> GetResidentsAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<ResidentDto?> GetResidentAsync(Guid id, CancellationToken cancellationToken = default);
}
