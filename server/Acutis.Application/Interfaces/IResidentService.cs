using Acutis.Application.Common;
using Acutis.Application.DTOs;
using Acutis.Application.Requests;
using Acutis.Application.Validators;
namespace Acutis.Application.Interfaces;

public interface IResidentService
{
    Task<ResidentDto> CreateResidentAsync(CreateResidentRequest request, string createdBy);
    Task<ResidentDto?> GetResidentByIdAsync(Guid id);
    Task<IEnumerable<ResidentDto>> GetAllResidentsAsync();
    Task<ResidentDto> UpdateResidentAsync(Guid id, UpdateResidentRequest request, string modifiedBy);
    Task<bool> DeleteResidentAsync(Guid id, string deletedBy);
    Task<ResidentDto> MarkResidentCompletedAsync(Guid id, string completedBy);
}

