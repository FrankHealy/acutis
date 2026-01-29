using System.Linq;
using Acutis.Application.DTOs;
using Acutis.Application.Services;
using Acutis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Services;

public class TherapyCatalogService : ITherapyCatalogService
{
    private readonly AcutisDbContext _context;
    public TherapyCatalogService(AcutisDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyCollection<TherapyTermRatingDto>> GetRatingsAsync(CancellationToken cancellationToken = default)
    {
        var ratings = await _context.TherapyTermRatings
            .Include(r => r.Terms)
            .AsNoTracking()
            .OrderBy(r => r.ExternalId)
            .ToListAsync(cancellationToken);
        return ratings.Select(DtoMapper.ToTherapyTermRatingDto).ToList();
    }

    public async Task<IReadOnlyCollection<TherapyTermDto>> GetTermsByRatingAsync(Guid ratingId, CancellationToken cancellationToken = default)
    {
        var terms = await _context.TherapyTerms
            .Where(t => t.RatingId == ratingId)
            .Include(t => t.Rating)
            .AsNoTracking()
            .OrderBy(t => t.Term)
            .ToListAsync(cancellationToken);
        return terms.Select(DtoMapper.ToTherapyTermDto).ToList();
    }

    public async Task<IReadOnlyCollection<TherapyModuleDto>> GetModulesAsync(CancellationToken cancellationToken = default)
    {
        var modules = await _context.TherapyModules
            .Include(m => m.Questions).ThenInclude(q => q.Parts)
            .AsNoTracking()
            .OrderBy(m => m.Title)
            .ToListAsync(cancellationToken);
        return modules.Select(DtoMapper.ToTherapyModuleDto).ToList();
    }
}



