using System.Collections.Generic;
using System.Linq;
using Acutis.Application.DTOs;
using Acutis.Application.Services;
using Acutis.Domain.Entities;
using Acutis.Domain.Enums;
using Acutis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Services;

public class GroupSessionService : IGroupSessionService
{
    private readonly AcutisDbContext _context;

    public GroupSessionService(AcutisDbContext context)
    {
        _context = context;
    }

    public async Task<GroupSessionDto?> GetSessionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var session = await _context.GroupSessions
            .Include(s => s.Module)
            .Include(s => s.Participants).ThenInclude(p => p.Resident)
            .Include(s => s.Notes).ThenInclude(n => n.Participant).ThenInclude(p => p.Resident)
            .Include(s => s.Notes).ThenInclude(n => n.Comments).ThenInclude(c => c.QuickCommentTemplate)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        return session is null ? null : DtoMapper.ToGroupSessionDto(session);
    }

    public async Task<GroupSessionDto> ScheduleSessionAsync(Guid moduleId, DateTimeOffset scheduledAt, string facilitator, string location, IEnumerable<Guid> residentIds, CancellationToken cancellationToken = default)
    {
        var module = await _context.TherapyModules.FirstOrDefaultAsync(m => m.Id == moduleId, cancellationToken);
        if (module is null)
        {
            throw new InvalidOperationException($"Therapy module {moduleId} was not found");
        }

        var residents = await _context.Residents
            .Where(r => residentIds.Contains(r.Id))
            .ToListAsync(cancellationToken);

        var session = new GroupSession
        {
            ModuleId = moduleId,
            ScheduledAt = scheduledAt,
            Facilitator = facilitator,
            Location = location,
            Participants = residents.Select(r => new GroupSessionParticipant
            {
                ResidentId = r.Id,
                AttendanceStatus = AttendanceStatus.Unknown,
                HasSpoken = false
            }).ToList()
        };

        _context.GroupSessions.Add(session);
        await _context.SaveChangesAsync(cancellationToken);

        session = await _context.GroupSessions
            .Include(s => s.Module)
            .Include(s => s.Participants).ThenInclude(p => p.Resident)
            .Include(s => s.Notes)
            .FirstAsync(s => s.Id == session.Id, cancellationToken);

        return DtoMapper.ToGroupSessionDto(session);
    }

    public async Task CloseSessionAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _context.GroupSessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);
        if (session is null)
        {
            throw new InvalidOperationException($"Session {sessionId} not found");
        }

        session.IsClosed = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<SessionNoteDto> UpsertSessionNoteAsync(Guid participantId, string body, IEnumerable<Guid> quickCommentTemplateIds, CancellationToken cancellationToken = default)
    {
        var participant = await _context.GroupSessionParticipants
            .Include(p => p.Session)
            .Include(p => p.Resident)
            .Include(p => p.Note).ThenInclude(n => n.Comments)
            .FirstOrDefaultAsync(p => p.Id == participantId, cancellationToken);

        if (participant is null)
        {
            throw new InvalidOperationException($"Participant {participantId} not found");
        }

        var templates = await _context.QuickCommentTemplates
            .Where(t => quickCommentTemplateIds.Contains(t.Id))
            .ToListAsync(cancellationToken);

        SessionNote note;
        if (participant.Note is null)
        {
            note = new SessionNote
            {
                SessionId = participant.SessionId,
                ParticipantId = participant.Id,
                Body = body
            };
            participant.Note = note;
            _context.SessionNotes.Add(note);
        }
        else
        {
            note = participant.Note;
            note.Body = body;
            note.ModifiedAt = DateTimeOffset.UtcNow;
            note.Comments.Clear();
        }

        foreach (var template in templates)
        {
            note.Comments.Add(new SessionNoteComment
            {
                QuickCommentTemplateId = template.Id,
                QuickCommentTemplate = template
            });
        }

        participant.HasSpoken = true;
        await _context.SaveChangesAsync(cancellationToken);

        note = await _context.SessionNotes
            .Include(n => n.Participant).ThenInclude(p => p.Resident)
            .Include(n => n.Comments).ThenInclude(c => c.QuickCommentTemplate)
            .FirstAsync(n => n.ParticipantId == participantId, cancellationToken);

        return DtoMapper.ToSessionNoteDto(note);
    }
}





