using Acutis.Api.Contracts;

namespace Acutis.Api.Services.Units;

public interface IUnitIdentityService
{
    IReadOnlyList<UnitIdentityDto> GetAll();
    bool TryGetByCode(string unitCode, out UnitIdentityDto unit);
    bool TryGetById(Guid unitId, out UnitIdentityDto unit);
}

public sealed class UnitIdentityService : IUnitIdentityService
{
    private static readonly IReadOnlyList<UnitIdentityDto> Units =
    [
        new() { UnitId = Guid.Parse("11111111-1111-1111-1111-111111111111"), UnitCode = "alcohol", DisplayName = "Alcohol" },
        new() { UnitId = Guid.Parse("22222222-2222-2222-2222-222222222222"), UnitCode = "detox", DisplayName = "Detox" },
        new() { UnitId = Guid.Parse("33333333-3333-3333-3333-333333333333"), UnitCode = "drugs", DisplayName = "Drugs" },
        new() { UnitId = Guid.Parse("44444444-4444-4444-4444-444444444444"), UnitCode = "ladies", DisplayName = "Ladies" }
    ];

    public IReadOnlyList<UnitIdentityDto> GetAll() => Units;

    public bool TryGetByCode(string unitCode, out UnitIdentityDto unit)
    {
        unit = Units.FirstOrDefault(x => x.UnitCode.Equals(unitCode.Trim(), StringComparison.OrdinalIgnoreCase)) ?? new UnitIdentityDto();
        return unit.UnitId != Guid.Empty;
    }

    public bool TryGetById(Guid unitId, out UnitIdentityDto unit)
    {
        unit = Units.FirstOrDefault(x => x.UnitId == unitId) ?? new UnitIdentityDto();
        return unit.UnitId != Guid.Empty;
    }
}
