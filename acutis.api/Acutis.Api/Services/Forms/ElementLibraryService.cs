using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Acutis.Api.Services.Forms;

public interface IElementLibraryService
{
    Task<ElementLibraryResponseDto> GetLibraryAsync(CancellationToken cancellationToken = default);
}

public sealed class ElementLibraryService : IElementLibraryService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly AcutisDbContext _dbContext;

    public ElementLibraryService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ElementLibraryResponseDto> GetLibraryAsync(CancellationToken cancellationToken = default)
    {
        var groups = await _dbContext.ElementGroups
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Include(x => x.Definitions.Where(definition => definition.IsActive).OrderBy(definition => definition.DisplayOrder).ThenBy(definition => definition.Label))
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return new ElementLibraryResponseDto
        {
            Groups = groups.Select(group => new ElementGroupDto
            {
                Id = group.Id,
                Key = group.Key,
                Name = group.Name,
                Description = group.Description,
                SourceDocumentReference = group.SourceDocumentReference,
                Version = group.Version,
                Status = group.Status,
                DisplayOrder = group.DisplayOrder,
                Definitions = group.Definitions
                    .OrderBy(definition => definition.DisplayOrder)
                    .ThenBy(definition => definition.Label)
                    .Select(MapDefinition)
                    .ToList()
            }).ToList()
        };
    }

    private static ElementDefinitionDto MapDefinition(Acutis.Domain.Entities.ElementDefinition definition)
    {
        ElementFieldConfigDto? config = null;

        if (!string.IsNullOrWhiteSpace(definition.FieldConfigJson))
        {
            try
            {
                config = JsonSerializer.Deserialize<ElementFieldConfigDto>(definition.FieldConfigJson, JsonOptions);
            }
            catch (JsonException)
            {
                config = null;
            }
        }

        return new ElementDefinitionDto
        {
            Id = definition.Id,
            GroupId = definition.GroupId,
            Key = definition.Key,
            Label = definition.Label,
            Description = definition.Description,
            HelpText = definition.HelpText,
            ElementType = definition.ElementType,
            SourceKind = definition.SourceKind,
            CanonicalFieldKey = definition.CanonicalFieldKey,
            OptionSetKey = definition.OptionSetKey,
            SourceDocumentReference = definition.SourceDocumentReference,
            Version = definition.Version,
            Status = definition.Status,
            DisplayOrder = definition.DisplayOrder,
            FieldConfig = config ?? new ElementFieldConfigDto()
        };
    }
}
