using Acutis.Application.Interfaces;
using Acutis.Application.Services;
using Acutis.Domain.Entities;
using Xunit;

namespace Acutis.Api.Tests.Services.Calls;

public sealed class CallServiceTests
{
    [Fact]
    public async Task LogCallAsync_AlwaysUsesServerGeneratedIdAndTimestamp()
    {
        var repository = new FakeCallRepository();
        var service = new CallService(repository);
        var clientSuppliedId = Guid.NewGuid();
        var clientSuppliedTime = new DateTimeOffset(2020, 1, 2, 3, 4, 5, TimeSpan.Zero);
        var before = DateTimeOffset.UtcNow.AddSeconds(-5);

        var result = await service.LogCallAsync(new Call
        {
            Id = clientSuppliedId,
            CallTimeUtc = clientSuppliedTime,
            Caller = "Test Caller",
            PhoneNumber = "0871234567",
            Source = "alcohol"
        });

        var after = DateTimeOffset.UtcNow.AddSeconds(5);

        Assert.NotEqual(clientSuppliedId, result.Id);
        Assert.NotEqual(clientSuppliedTime, result.CallTimeUtc);
        Assert.InRange(result.CallTimeUtc, before, after);
        Assert.Same(result, repository.SavedCall);
    }

    private sealed class FakeCallRepository : ICallRepository
    {
        public Call? SavedCall { get; private set; }

        public Task<IReadOnlyList<Call>> GetCallsAsync(CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Call>>(Array.Empty<Call>());

        public Task<IReadOnlyList<Call>> GetLastNDaysCallsAsync(int numDays, CancellationToken cancellationToken = default)
            => Task.FromResult<IReadOnlyList<Call>>(Array.Empty<Call>());

        public Task<Call> LogCallAsync(Call call, CancellationToken cancellationToken = default)
        {
            SavedCall = call;
            return Task.FromResult(call);
        }
    }
}
