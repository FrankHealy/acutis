using Acutis.Application.Requests;
using Acutis.Application.Responses;

namespace Acutis.Application.Interfaces;

public interface IAdmissionsFunctionClient
{
    Task<Guid> CreateResidentAsync(CreateResidentRequest request);
    Task<ResidentResponse?> GetResidentAsync(Guid id);
    Task<List<ResidentResponse>> GetAllResidentsAsync();
    Task MarkResidentCompletedAsync(Guid residentId, string completedBy);
}
