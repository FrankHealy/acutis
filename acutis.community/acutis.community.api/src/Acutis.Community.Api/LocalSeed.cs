using Microsoft.EntityFrameworkCore;

namespace Acutis.Community.Api;

public static class LocalSeed
{
    public static async Task SeedCommunityDemoAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<CommunityDbContext>();
        var tenant = await db.Tenants.FirstOrDefaultAsync(x => db.Memberships.Any(m => m.TenantId == x.Id && m.IsActive)); if (tenant is null) return;
        var members = await db.Memberships.Where(x => x.TenantId == tenant.Id && x.IsActive).ToListAsync(); if (members.Count == 0) return; var now = DateTime.UtcNow;
        var existingPeople = await db.Participants.Where(x => x.TenantId == tenant.Id).ToListAsync();
        if (existingPeople.Count is > 0 and < 10)
        {
            var serviceUserNames = new[] { "Erin Doyle", "Michael Ryan", "Sofia Ahmed", "Conor Hayes", "Grace Nolan", "Patrick Flynn", "Leah Martin", "Owen Clarke", "Aisha Bello", "Jack Brennan" };
            for (var i = existingPeople.Count; i < 10; i++)
            {
                var name = serviceUserNames[i]; var member = members[i % members.Count];
                var person = new CommunityParticipant { Id = Guid.NewGuid(), TenantId = tenant.Id, DisplayName = name, PreferredName = name.Split(' ')[0], Phone = $"086 556 {2300 + i}", Email = $"serviceuser.{i + 1}@example.test", ReferralSource = i % 3 == 0 ? "Community team" : "Self referral", Status = "active", StaffSubject = member.ExternalSubject, StaffDisplayName = member.ExternalSubject, CreatedAtUtc = now.AddDays(-30 - i), UpdatedAtUtc = now };
                db.Participants.Add(person); existingPeople.Add(person);
            }
            await db.SaveChangesAsync();
        }
        if (existingPeople.Count > 0)
        {
            if (!await db.Appointments.AnyAsync(x => x.TenantId == tenant.Id && (x.Title.Contains("CBT") || x.Title.Contains("DBT"))))
            {
                var templates = new[] { ("CBT Skills: Thoughts, feelings and actions", 1, 11, false), ("DBT Skills: Mindfulness", 2, 14, true), ("Community recovery group", 3, 10, false), ("DBT Skills: Emotion regulation", 4, 14, true), ("CBT Skills: Behavioural activation", 5, 11, false), ("Programme team review", 5, 15, true) };
                db.Appointments.AddRange(templates.Select((e, i) => new CommunityAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ParticipantId = existingPeople[i % existingPeople.Count].Id, StaffSubject = members[i % members.Count].ExternalSubject, StaffDisplayName = $"Facilitator {(char)('A' + i % members.Count)}", AppointmentType = "group-meeting", Title = e.Item1, StartsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3), EndsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3 + 1), DeliveryMode = e.Item4 ? "video" : "in-person", Status = "scheduled", Notes = "Programme event · skills practice, participation and follow-up actions.", CreatedAtUtc = now, UpdatedAtUtc = now }));
                await db.SaveChangesAsync();
            }
            if (!await db.Appointments.AnyAsync(x => x.TenantId == tenant.Id && x.Title.Contains("Gambling")))
            {
                var gambling = new[] { ("Community Gambling Recovery: Engagement and harms", 1, 13, false), ("Community Gambling Recovery: Triggers and urges", 3, 13, true), ("Community Gambling Recovery: Money safeguards and support", 5, 13, false), ("Community Gambling Recovery: Relapse prevention", 7, 13, true) };
                db.Appointments.AddRange(gambling.Select((e, i) => new CommunityAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ParticipantId = existingPeople[i % existingPeople.Count].Id, StaffSubject = members[i % members.Count].ExternalSubject, StaffDisplayName = $"Gambling Programme Facilitator {(char)('A' + i % members.Count)}", AppointmentType = "group-meeting", Title = e.Item1, StartsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3), EndsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3 + 1.5), DeliveryMode = e.Item4 ? "video" : "in-person", Status = "scheduled", Notes = "Community gambling recovery - CBT skills, financial harm support, affected others and relapse prevention.", CreatedAtUtc = now, UpdatedAtUtc = now }));
                await db.SaveChangesAsync();
            }
            return;
        }
        var names = new[] { "Erin Doyle", "Michael Ryan", "Sofia Ahmed", "Conor Hayes", "Grace Nolan", "Patrick Flynn", "Leah Martin", "Owen Clarke", "Aisha Bello", "Jack Brennan" };
        var people = names.Select((name, i) => new CommunityParticipant { Id = Guid.NewGuid(), TenantId = tenant.Id, DisplayName = name, PreferredName = name.Split(' ')[0], Phone = $"086 555 {2200 + i}", Email = $"{name.Split(' ')[0].ToLowerInvariant()}@example.test", ReferralSource = i % 3 == 0 ? "Community team" : "Self referral", Status = "active", StaffSubject = members[i % members.Count].ExternalSubject, StaffDisplayName = $"Community Worker {(char)('A' + i % members.Count)}", CreatedAtUtc = now.AddDays(-50 - i), UpdatedAtUtc = now }); db.Participants.AddRange(people); var list = people.ToList(); await db.SaveChangesAsync();
        db.CarePlans.AddRange(list.Take(7).Select((person, i) => new CommunityCarePlan { Id = Guid.NewGuid(), TenantId = tenant.Id, ParticipantId = person.Id, Status = "active", CaptureJson = "{\"summary\":\"Community goals, supports and agreed actions for " + person.PreferredName + ".\"}", ReviewDate = DateOnly.FromDateTime(now.AddDays(10 + i)), CreatedAtUtc = now.AddDays(-20), UpdatedAtUtc = now.AddDays(-i) }));
        db.Assessments.AddRange(list.Take(8).Select((person, i) => new CommunityAssessment { Id = Guid.NewGuid(), TenantId = tenant.Id, ParticipantId = person.Id, AssessmentType = i % 4 == 0 ? "review" : "initial", CaptureJson = "{\"summary\":\"Community needs, strengths, safety and participation goals recorded.\"}", CompletedAtUtc = now.AddDays(-i * 2), CompletedBySubject = members[i % members.Count].ExternalSubject }));
        var events = new[] { ("CBT Skills: Thoughts, feelings and actions", 1, 11, false), ("DBT Skills: Mindfulness", 2, 14, true), ("Community recovery group", 3, 10, false), ("DBT Skills: Emotion regulation", 4, 14, true), ("CBT Skills: Behavioural activation", 5, 11, false), ("Programme team review", 5, 15, true) };
        db.Appointments.AddRange(events.Select((e, i) => new CommunityAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ParticipantId = i < list.Count ? list[i].Id : null, StaffSubject = members[i % members.Count].ExternalSubject, StaffDisplayName = $"Facilitator {(char)('A' + i % members.Count)}", AppointmentType = e.Item1.Contains("team", StringComparison.OrdinalIgnoreCase) ? "team-meeting" : "group-meeting", Title = e.Item1, StartsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3), EndsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3 + 1), DeliveryMode = e.Item4 ? "video" : "in-person", Status = "scheduled", Notes = "Programme event · skills practice, participation and follow-up actions.", CreatedAtUtc = now, UpdatedAtUtc = now }));
        await db.SaveChangesAsync();
    }
}
