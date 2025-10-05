using Acutis.Application.DTOs;
using Acutis.Application.Interfaces;
using Acutis.Application.Requests;
using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Infrastructure.Admissions;

public class ResidentService : IResidentService
{
    private readonly AppDbContext _db;

    public ResidentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ResidentDto> CreateResidentAsync(CreateResidentRequest request, string createdBy)
    {
        var resident = new Resident(
            request.SocialSecurityNumber,
            request.DateOfBirth,
            request.DateOfAdmission,
            request.FirstName,
            request.MiddleName,
            request.Surname,
            request.IsPreviousResident,
            request.PrimaryAddictionId,
            request.CountryId
        );

        resident.UpdateAddress(request.AddressId);
        if (request.ProbationRequirementId.HasValue)
            resident.AssignProbationRequirement(request.ProbationRequirementId.Value);

        resident.AddSecondaryAddictions(request.SecondaryAddictionIds);

        _db.Residents.Add(resident);
        await _db.SaveChangesAsync();

        return await MapResidentToDto(resident.Id);
    }

    public async Task<ResidentDto?> GetResidentByIdAsync(Guid id)
    {
        var resident = await _db.Residents
            .Include(r => r.Country)
            .Include(r => r.Address).ThenInclude(a => a.Country)
            .Include(r => r.ProbationRequirement)
            .Include(r => r.PrimaryAddiction)
            .Include(r => r.SecondaryAddictions)
            .FirstOrDefaultAsync(r => r.Id == id);

        return resident is null ? null : MapResident(resident);
    }

    public async Task<IEnumerable<ResidentDto>> GetAllResidentsAsync()
    {
        var residents = await _db.Residents
            .Include(r => r.Country)
            .Include(r => r.Address).ThenInclude(a => a.Country)
            .Include(r => r.ProbationRequirement)
            .Include(r => r.PrimaryAddiction)
            .Include(r => r.SecondaryAddictions)
            .ToListAsync();

        return residents.Select(MapResident);
    }

    public async Task<ResidentDto> UpdateResidentAsync(Guid id, UpdateResidentRequest request, string modifiedBy)
    {
        var resident = await _db.Residents.FindAsync(id);
        if (resident == null) throw new Exception("Resident not found");

        resident.UpdateContact(request.PhoneNumber, request.EmailAddress);

        if (request.AddressId.HasValue) resident.UpdateAddress(request.AddressId.Value);
        if (request.ProbationRequirementId.HasValue) resident.AssignProbationRequirement(request.ProbationRequirementId.Value);

        if (request.SecondaryAddictionIds != null)
            resident.UpdateSecondaryAddictions(request.SecondaryAddictionIds);

        await _db.SaveChangesAsync();
        return await MapResidentToDto(id);
    }

    public async Task<bool> DeleteResidentAsync(Guid id, string deletedBy)
    {
        var resident = await _db.Residents.FindAsync(id);
        if (resident == null) return false;

        _db.Residents.Remove(resident);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ResidentDto> MarkResidentCompletedAsync(Guid id, string completedBy)
    {
        var resident = await _db.Residents.FindAsync(id);
        if (resident == null) throw new Exception("Resident not found");

        resident.MarkCompleted(completedBy);
        await _db.SaveChangesAsync();

        return await MapResidentToDto(id);
    }

    private async Task<ResidentDto> MapResidentToDto(Guid id)
    {
        var resident = await _db.Residents
            .Include(r => r.Country)
            .Include(r => r.Address).ThenInclude(a =>
            {
                return a.Country;
            })
            .Include(r => r.ProbationRequirement)
            .Include(r => r.PrimaryAddiction)
            .Include(r => r.SecondaryAddictions)
            .FirstAsync(r => r.Id == id);

        return MapResident(resident);
    }

    private ResidentDto MapResident(Resident r) =>
        new ResidentDto
        {
            Id = r.Id,
            SocialSecurityNumber = r.SocialSecurityNumber,
            DateOfBirth = r.DateOfBirth,
            DateOfAdmission = r.DateOfAdmission,
            FirstName = r.FirstName,
            MiddleName = r.MiddleName,
            Surname = r.Surname,
            IsPreviousResident = r.IsPreviousResident,

            Country = r.Country.CountryName,
            Address = $"{r.Address.Line1}, {r.Address.City}, {r.Address.County}, {r.Address.PostCode}, {r.Address.Country.CountryName}",
            PrimaryAddiction = r.PrimaryAddiction.Name,
            SecondaryAddictions = r.SecondaryAddictions.Select(sa => sa.Name).ToList(),
            ProbationRequirement = r.ProbationRequirement?.Requirement,

            NextOfKinFirstName = r.NextOfKinFirstName,
            NextOfKinSecondName = r.NextOfKinSecondName,
            NextOfKinPhoneNumber = r.NextOfKinPhoneNumber,

            HasMedicalCard = r.HasMedicalCard,
            MedicalCardNumber = r.MedicalCardNumber,
            HasPrivateInsurance = r.HasPrivateInsurance,
            PrivateMedicalInsuranceNumber = r.PrivateMedicalInsuranceNumber,
            HasMobilityIssue = r.HasMobilityIssue,

            IsCompleted = r.IsCompleted,
            CompletedAt = r.CompletedAt,
            CompletedBy = r.CompletedBy,

            Age = r.CalculateAge(),
            Photos = r.Photos.Select(p => p.Url).ToList(),
            Documents = r.Documents.Select(d => d.Url).ToList()
        };
}
