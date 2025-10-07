using Acutis.Application.DTOs;
using Acutis.Application.Requests;

namespace Acutis.Application.Interfaces;


public interface IResidentService
{
    Task<ResidentDto> CreateResidentAsync(CreateResidentRequest request, string userName);
    Task<ResidentDto?> GetResidentByIdAsync(Guid id);
    Task<IEnumerable<ResidentDto>> GetAllResidentsAsync();
    Task<ResidentDto> UpdateResidentAsync(Guid id, UpdateResidentRequest request, string userName);
    Task<ResidentDto> MarkAdmissionFormCompleteAsync(Guid id, string userName);
    Task<bool> DeleteResidentAsync(Guid id, string userName);
}
