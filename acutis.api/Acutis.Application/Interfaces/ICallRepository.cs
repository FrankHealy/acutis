using Acutis.Domain.Entities;

namespace Acutis.Application.Interfaces;

public interface ICallRepository
{
    Task<IReadOnlyList<Call>> GetCallsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Call>> GetLastNDaysCallsAsync(int numDays, CancellationToken cancellationToken = default);
    Task<Call> LogCallAsync(Call call, CancellationToken cancellationToken = default);
}
