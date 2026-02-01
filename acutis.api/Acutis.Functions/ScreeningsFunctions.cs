using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;

namespace Acutis.Functions;

// Dummy placeholder for Azure Functions. Replace with Functions Worker when ready.
public sealed class ScreeningsFunctions
{
    private readonly ICallService _callService;

    public ScreeningsFunctions(ICallService callService)
    {
        _callService = callService;
    }

    public Task<IReadOnlyList<Call>> GetCallsAsync(CancellationToken cancellationToken = default)
    {
        return _callService.GetCallsAsync(cancellationToken);
    }
}
