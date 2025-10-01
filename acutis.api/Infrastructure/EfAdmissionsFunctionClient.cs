using Acutis.Application.Admissions;
using Acutis.Application.Admissions.Requests;
using Acutis.Application.Admissions.Responses;
using Acutis.Domain.Admissions;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Admissions;

public class EfAdmissionsFunctionClient : IAdmissionsFunctionClient
{
    private readonly AppDbContext _db;

    public EfAdmissionsFunctionClient(AppDbContext db) => _db = db;

    public async Task<Guid> CreateResidentAsync(CreateResidentRequest request)
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
            request.NationalityId
        );

        _db.Residents.Add(resident);

        if (request.SecondaryAddictionIds != null)
        {
            foreach (var secId in request.SecondaryAddictionIds)
            {
                _db.ResidentSecondaryAddictions.Add(new ResidentSecondaryAddiction(resident.Id, secId));
            }
        }

        await _db.SaveChangesAsync();
        return resident.Id;
    }

    public async Task<ResidentResponse?> GetResidentAsync(Guid id)
    {
        var r = await _db.Residents
            .Include(x => x.PrimaryAddiction)
            .Include(x => x.Nationality)
            .Include(x => x.SecondaryAddictions).ThenInclude(sa => sa.AddictionType)
            .Include(x => x.Photos)
            .Include(x => x.Documents).ThenInclude(d => d.DocumentType)
            .FirstOrDefaultAsync(x => x.Id == id);

        return r is null ? null :
            new ResidentResponse(
                r.Id,
                r.SocialSecurityNumber,
                r.DateOfBirth,
                r.Age,
                r.DateOfAdmission,
                r.FirstName,
                r.MiddleName,
                r.Surname,
                r.IsPreviousResident,
                r.PrimaryAddictionId,
                r.PrimaryAddiction.Name,
                r.SecondaryAddictions.Select(sa => sa.AddictionType.Name).ToList(),
                r.Nationality.Name,
                r.IsCompleted,
                r.CompletedBy,
                r.CompletedAt,
                r.Photos.FirstOrDefault(p => p.IsPrimary)?.Url,
                r.Documents.Select(d => $"{d.DocumentType.Name}:{d.Url}").ToList()
            );
    }

    public async Task<List<ResidentResponse>> GetAllResidentsAsync()
    {
        var residents = await _db.Residents
            .Include(x => x.PrimaryAddiction)
            .Include(x => x.Nationality)
            .ToListAsync();

        return residents.Select(r => new ResidentResponse(
            r.Id,
            r.SocialSecurityNumber,
            r.DateOfBirth,
            r.Age,
            r.DateOfAdmission,
            r.FirstName,
            r.MiddleName,
            r.Surname,
            r.IsPreviousResident,
            r.PrimaryAddictionId,
            r.PrimaryAddiction.Name,
            new List<string>(), // skip heavy secondary/documents here
            r.Nationality.Name,
            r.IsCompleted,
            r.CompletedBy,
            r.CompletedAt,
            null,
            new List<string>()
        )).ToList();
    }

    public async Task MarkResidentCompletedAsync(Guid residentId, string completedBy)
    {
        var resident = await _db.Residents.FindAsync(residentId);
        if (resident is null) throw new KeyNotFoundException("Resident not found");

        resident.MarkAsCompleted(completedBy);
        await _db.SaveChangesAsync();
    }
}
