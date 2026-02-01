using Acutis.Application.DTOs;
using Acutis.Application.Interfaces;
using Acutis.Application.Requests;
using Acutis.Domain.Entities;
using Acutis.Domain.Enums;
using Acutis.Domain.Lookups;
using Acutis.Infrastructure.Mapping;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Admissions
{
    public class ResidentService : IResidentService
    {
        private readonly AppDbContext _db;
        public ResidentService(AppDbContext db) { _db = db; }

        public async Task<ResidentDto> CreateResidentAsync(CreateResidentRequest req, string userName)
        {
            var country = await _db.Countries.FindAsync(req.CountryId) ?? throw new Exception("Invalid CountryId");
            var address = await _db.Addresses.FindAsync(req.AddressId) ?? throw new Exception("Invalid AddressId");
            var primary = await _db.Addictions.FindAsync(req.PrimaryAddictionId) ?? throw new Exception("Invalid PrimaryAddictionId");

            ProbationRequirement? probation = null;
            if (req.ProbationRequirementId.HasValue)
                probation = await _db.ProbationRequirements.FindAsync(req.ProbationRequirementId.Value);

            var resident = new Resident(
                req.SocialSecurityNumber, req.DateOfBirth, req.DateOfAdmission,
                req.FirstName, req.MiddleName, req.Surname, req.IsPreviousResident,
                primary.Id, country.Id);

            resident.UpdateAddress(address.Id);
            resident.UpdateAlias(req.Alias);
            resident.UpdateContact(req.PhoneNumber, req.EmailAddress);
            resident.UpdateNextOfKin(req.NextOfKinFirstName, req.NextOfKinSecondName, req.NextOfKinPhoneNumber);
            if (probation != null) resident.AssignProbationRequirement(probation.Id);

            // Secondary addictions: service loads entities and passes them to domain
            if (req.SecondaryAddictionIds != null)
            {
                if (req.SecondaryAddictionIds.Count == 0)
                {
                    resident.ClearSecondaryAddictions();
                }
                else
                {
                    var secondary = await _db.Addictions
                        .Where(a => req.SecondaryAddictionIds.Contains(a.Id))
                        .ToListAsync();
                    resident.UpdateSecondaryAddictions(secondary);
                }
            }

            resident.UpdateMedicalInfo(
                req.HasMedicalCard, req.MedicalCardNumber,
                req.HasPrivateInsurance, req.PrivateMedicalInsuranceProviderId,
                req.PrivateMedicalInsuranceNumber, req.HasMobilityIssue
            );

            if (req.PhotoDeclined) resident.DeclinePhoto(req.PhotoDeclinedReason);
            else resident.SetArrivalPhoto(req.PhotoUrl);

            if (!string.IsNullOrWhiteSpace(req.QuestionnairesJson)) resident.AttachQuestionnaire(req.QuestionnairesJson);

            if (!string.IsNullOrWhiteSpace(req.PreferredStepDownHouse) &&
                Enum.TryParse<StepDownHouse>(req.PreferredStepDownHouse, true, out var house))
                resident.SetPreferredStepDownHouse(house);

            if (!string.IsNullOrWhiteSpace(req.RoomNumber)) resident.AssignRoom(req.RoomNumber);
            if (req.DepositAmount.HasValue) resident.RecordDeposit(req.DepositAmount.Value, Guid.Empty);
            if (req.IsAdmissionFormComplete) resident.MarkAdmissionFormComplete("system");

            _db.Residents.Add(resident);
            await _db.SaveChangesAsync();

            return await MapResidentToDto(resident.Id);
        }

        public async Task<ResidentDto?> GetResidentByIdAsync(Guid id)
        {
            var r = await _db.Residents
                .Include(x => x.Country)
                .Include(x => x.Address).ThenInclude(a => a.Country)
                .Include(x => x.Address).ThenInclude(a => a.County)
                .Include(x => x.ReligiousAffiliation)
                .Include(x => x.ProbationRequirement)
                .Include(x => x.PrivateMedicalInsuranceProvider)
                .Include(x => x.PrimaryAddiction)
                .Include(x => x.SecondaryAddictions)
                .FirstOrDefaultAsync(x => x.Id == id);

            return r is null ? null : DtoMapper.ToResidentDto(r);
        }

        public async Task<IEnumerable<ResidentDto>> GetAllResidentsAsync()
        {
            var list = await _db.Residents
                .Include(x => x.Country)
                .Include(x => x.Address).ThenInclude(a => a.Country)
                .Include(x => x.Address).ThenInclude(a => a.County)
                .Include(x => x.PrimaryAddiction)
                .ToListAsync();

            return list.Select(DtoMapper.ToResidentDto);
        }

        public async Task<ResidentDto> UpdateResidentAsync(Guid id, UpdateResidentRequest req, string userName)
        {
            var r = await _db.Residents
                .Include(x => x.SecondaryAddictions) // include mutable collection
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new Exception("Resident not found");

            // Secondary addictions: null = no change; empty = clear; list = replace
            if (req.SecondaryAddictionIds != null)
            {
                if (req.SecondaryAddictionIds.Count == 0)
                {
                    r.ClearSecondaryAddictions();
                }
                else
                {
                    var secondaries = await _db.Addictions
                        .Where(a => req.SecondaryAddictionIds.Contains(a.Id))
                        .ToListAsync();

                    r.UpdateSecondaryAddictions(secondaries);
                }
            }

            // All other updates (no EF work here)
            DtoMapper.ApplyUpdate(r, req);

            await _db.SaveChangesAsync();
            return await MapResidentToDto(id);
        }

        public async Task<ResidentDto> MarkAdmissionFormCompleteAsync(Guid id, string userName)
        {
            var r = await _db.Residents.FindAsync(id) ?? throw new Exception("Resident not found");
            r.MarkAdmissionFormComplete(userName);
            await _db.SaveChangesAsync();
            return await MapResidentToDto(id);
        }

        public async Task<bool> DeleteResidentAsync(Guid id, string userName)
        {
            var r = await _db.Residents.FindAsync(id);
            if (r == null) return false;
            _db.Remove(r);
            await _db.SaveChangesAsync();
            return true;
        }

        private async Task<ResidentDto> MapResidentToDto(Guid id)
        {
            var r = await _db.Residents
                .Include(x => x.Country)
                .Include(x => x.Address).ThenInclude(a => a.Country)
                .Include(x => x.Address).ThenInclude(a => a.County)
                .Include(x => x.ReligiousAffiliation)
                .Include(x => x.ProbationRequirement)
                .Include(x => x.PrivateMedicalInsuranceProvider)
                .Include(x => x.PrimaryAddiction)
                .Include(x => x.SecondaryAddictions)
                .FirstAsync(x => x.Id == id);

            return DtoMapper.ToResidentDto(r);
        }
    }
}
