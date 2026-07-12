using Acutis.Domain.Entities;

namespace Acutis.Application.Interfaces;

public interface ICallService
{
    Task<IReadOnlyList<Call>> GetCallsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Call>> GetLastNDaysCallsAsync(int numDays, CancellationToken cancellationToken = default);
    Task<Call> LogCallAsync(Call call, CancellationToken cancellationToken = default);
}
