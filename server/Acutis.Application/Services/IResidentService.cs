using Acutis.Application.DTOs;
using Acutis.Application.Common;
using Acutis.Application.Requests;
namespace Acutis.Application.Services;

public interface IResidentService
{
    Task<ResidentDto> CreateResidentAsync(CreateResidentRequest request, string createdBy);
    Task<PagedResult<ResidentDto>> GetResidentsAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<ResidentDto?> GetResidentAsync(Guid id, CancellationToken cancellationToken = default);
}

