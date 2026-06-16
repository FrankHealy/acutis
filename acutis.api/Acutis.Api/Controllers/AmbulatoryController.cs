using Acutis.Api.Contracts;
using Acutis.Api.Services.Ambulatory;
using Acutis.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/ambulatory/{programme}")]
public sealed class AmbulatoryController : ControllerBase
{
    private readonly IAmbulatoryService _service;

    public AmbulatoryController(IAmbulatoryService service)
    {
        _service = service;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AmbulatoryDashboardDto>> GetDashboard(string programme, CancellationToken cancellationToken)
    {
        return Ok(await _service.GetDashboardAsync(ParseProgramme(programme), User, cancellationToken));
    }

    [HttpPost("participants")]
    public async Task<ActionResult<AmbulatoryParticipantDto>> CreateParticipant(
        string programme,
        CreateAmbulatoryParticipantRequest request,
        CancellationToken cancellationToken)
    {
        var created = await _service.CreateParticipantAsync(ParseProgramme(programme), request, User, cancellationToken);
        return CreatedAtAction(nameof(GetDashboard), new { programme }, created);
    }

    [HttpPost("participants/{participantId:guid}/assessments")]
    public async Task<ActionResult<AmbulatoryAssessmentDto>> AddAssessment(
        string programme,
        Guid participantId,
        UpsertAmbulatoryAssessmentRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.AddAssessmentAsync(ParseProgramme(programme), participantId, request, User, cancellationToken));
    }

    [HttpPut("participants/{participantId:guid}/care-plan")]
    public async Task<ActionResult<AmbulatoryCarePlanDto>> UpsertCarePlan(
        string programme,
        Guid participantId,
        UpsertAmbulatoryCarePlanRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.UpsertCarePlanAsync(ParseProgramme(programme), participantId, request, User, cancellationToken));
    }

    [HttpPost("appointments")]
    public async Task<ActionResult<AmbulatoryAppointmentDto>> CreateAppointment(
        string programme,
        UpsertAmbulatoryAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        return Ok(await _service.CreateAppointmentAsync(ParseProgramme(programme), request, User, cancellationToken));
    }

    [HttpPatch("appointments/{appointmentId:guid}")]
    public async Task<ActionResult<AmbulatoryAppointmentDto>> UpdateAppointment(
        string programme,
        Guid appointmentId,
        UpsertAmbulatoryAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _service.UpdateAppointmentAsync(ParseProgramme(programme), appointmentId, request, User, cancellationToken));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private static AmbulatoryProgrammeType ParseProgramme(string programme)
    {
        return programme.Equals("community", StringComparison.OrdinalIgnoreCase)
            ? AmbulatoryProgrammeType.Community
            : programme.Equals("practitioner", StringComparison.OrdinalIgnoreCase)
                ? AmbulatoryProgrammeType.Practitioner
                : throw new ArgumentOutOfRangeException(nameof(programme), "Unknown ambulatory programme.");
    }
}
