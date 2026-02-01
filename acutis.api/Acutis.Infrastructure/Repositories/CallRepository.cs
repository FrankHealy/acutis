using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Repositories;

public sealed class CallRepository : ICallRepository
{
    private readonly AcutisDbContext _dbContext;

    public CallRepository(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Call>> GetCallsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Calls
            .AsNoTracking()
            .OrderByDescending(call => call.CallTimeUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Call>> GetLastNDaysCallsAsync(int numDays, CancellationToken cancellationToken = default)
    {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-numDays);

        return await _dbContext.Calls
            .AsNoTracking()
            .Where(call => call.CallTimeUtc >= cutoff)
            .OrderByDescending(call => call.CallTimeUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Call> LogCallAsync(Call call, CancellationToken cancellationToken = default)
    {
        _dbContext.Calls.Add(call);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return call;
    }
}
