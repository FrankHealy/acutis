using Acutis.Api.Services.Screening;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/localization")]
[AllowAnonymous]
public sealed class LocalizationController : ControllerBase
{
    private readonly ITranslationService _translationService;

    public LocalizationController(ITranslationService translationService)
    {
        _translationService = translationService;
    }

    [HttpGet("translations")]
    public async Task<ActionResult<Dictionary<string, string>>> GetTranslations(
        [FromQuery] string locale = "en-IE",
        [FromQuery] List<string>? keys = null,
        CancellationToken cancellationToken = default)
    {
        var requestedKeys = keys ?? new List<string>();
        if (requestedKeys.Count == 0)
        {
            return Ok(new Dictionary<string, string>());
        }

        var translations = await _translationService.ResolveAsync(locale, requestedKeys, cancellationToken);
        return Ok(translations);
    }
}
