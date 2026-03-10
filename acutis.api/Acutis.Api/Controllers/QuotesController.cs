using Acutis.Api.Contracts;
using Acutis.Api.Services.Quotes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api")]
[AllowAnonymous]
public sealed class QuotesController : ControllerBase
{
    private readonly IQuoteService _quoteService;

    public QuotesController(IQuoteService quoteService)
    {
        _quoteService = quoteService;
    }

    [HttpGet("units/{unitId:guid}/quote-of-the-day")]
    public async Task<ActionResult<QuoteOfTheDayResponse>> GetQuoteOfTheDay(
        Guid unitId,
        [FromQuery] DateOnly? localDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _quoteService.GetQuoteOfTheDayAsync(unitId, localDate, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("quotes")]
    public async Task<ActionResult<IReadOnlyList<QuoteDto>>> GetQuotes(
        [FromQuery] string? attribution,
        [FromQuery] string? language,
        [FromQuery] string? tag,
        [FromQuery] bool? active,
        CancellationToken cancellationToken = default)
    {
        var quotes = await _quoteService.GetQuotesAsync(attribution, language, tag, active, cancellationToken);
        return Ok(quotes);
    }

    [HttpPost("quotes")]
    public async Task<ActionResult<QuoteDto>> CreateQuote([FromBody] CreateQuoteRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var created = await _quoteService.CreateQuoteAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetQuotes), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("quotes/{id:guid}")]
    public async Task<ActionResult<QuoteDto>> UpdateQuote(Guid id, [FromBody] UpdateQuoteRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _quoteService.UpdateQuoteAsync(id, request, cancellationToken);
            if (updated is null)
            {
                return NotFound();
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("quotes/{id:guid}")]
    public async Task<ActionResult> DeleteQuote(Guid id, CancellationToken cancellationToken = default)
    {
        var deleted = await _quoteService.DeleteQuoteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("units/{unitId:guid}/quote-curation")]
    public async Task<ActionResult<IReadOnlyList<UnitQuoteCurationDto>>> GetUnitCuration(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var rows = await _quoteService.GetUnitCurationAsync(unitId, cancellationToken);
        return Ok(rows);
    }

    [HttpPost("units/{unitId:guid}/quote-curation")]
    public async Task<ActionResult<UnitQuoteCurationDto>> UpsertUnitCuration(
        Guid unitId,
        [FromBody] UpsertUnitQuoteCurationRequest request,
        CancellationToken cancellationToken = default)
    {
        var row = await _quoteService.UpsertUnitCurationAsync(unitId, request, cancellationToken);
        return Ok(row);
    }

    [HttpDelete("units/{unitId:guid}/quote-curation/{curationId:guid}")]
    public async Task<ActionResult> DeleteUnitCuration(
        Guid unitId,
        Guid curationId,
        CancellationToken cancellationToken = default)
    {
        var deleted = await _quoteService.DeleteUnitCurationAsync(unitId, curationId, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
