using Acutis.Application.DTOs;

namespace Acutis.Application.Services;

public interface ITherapyCatalogService
{
    Task<IReadOnlyCollection<TherapyTermRatingDto>> GetRatingsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TherapyTermDto>> GetTermsByRatingAsync(Guid ratingId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TherapyModuleDto>> GetModulesAsync(CancellationToken cancellationToken = default);
}
