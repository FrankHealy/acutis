using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;

namespace Acutis.Application.Services;

public sealed class CallService : ICallService
{
    private readonly ICallRepository _repository;

    public CallService(ICallRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<Call>> GetCallsAsync(CancellationToken cancellationToken = default)
    {
        return _repository.GetCallsAsync(cancellationToken);
    }

    public Task<IReadOnlyList<Call>> GetLastNDaysCallsAsync(int numDays, CancellationToken cancellationToken = default)
    {
        if (numDays <= 0)
        {
            return Task.FromResult<IReadOnlyList<Call>>(Array.Empty<Call>());
        }

        return _repository.GetLastNDaysCallsAsync(numDays, cancellationToken);
    }

    public Task<Call> LogCallAsync(Call call, CancellationToken cancellationToken = default)
    {
        call.Id = Guid.NewGuid();
        call.CallTimeUtc = DateTimeOffset.UtcNow;

        return _repository.LogCallAsync(call, cancellationToken);
    }
}
