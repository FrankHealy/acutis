using System.Linq;
using Acutis.Application.Common;
using Acutis.Application.DTOs;
using Acutis.Application.Services;
using Acutis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Services;

public class ResidentService : IResidentService
{
    private readonly AcutisDbContext _context;
    public ResidentService(AcutisDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ResidentDto>> GetResidentsAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Residents
            .Include(r => r.Sessions)
            .AsNoTracking();

        var total = await query.CountAsync(cancellationToken);
        var residents = await query
            .OrderBy(r => r.Surname)
            .ThenBy(r => r.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = residents.Select(DtoMapper.ToResidentDto).ToList();

        return new PagedResult<ResidentDto>(items, page, pageSize, total);
    }

    public async Task<ResidentDto?> GetResidentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var resident = await _context.Residents
            .Include(r => r.Sessions)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        return resident is null ? null : DtoMapper.ToResidentDto(resident);
    }
}



