using Microsoft.EntityFrameworkCore;

namespace Acutis.Practitioner.Api;

public static class LocalSeed
{
    public static async Task SeedPractitionerDemoAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<PractitionerDbContext>();
        var demoClients = await db.Clients.Where(x => db.Tenants.Any(t => t.Id == x.TenantId && t.IsDemo)).OrderBy(x => x.Id).ToListAsync();
        for (var i = 0; i < demoClients.Count; i++)
        {
            var visibleName = demoClients[i].DisplayName.Split('(')[0].Trim();
            demoClients[i].Surname = string.IsNullOrWhiteSpace(demoClients[i].Surname) ? visibleName.Split(' ', StringSplitOptions.RemoveEmptyEntries).LastOrDefault() ?? "Client" : demoClients[i].Surname;
            demoClients[i].DateOfBirth ??= new DateOnly(1980 + i % 20, i % 12 + 1, i % 27 + 1);
        }
        await db.SaveChangesAsync();
        var tenant = await db.Tenants.FirstOrDefaultAsync(x => db.Memberships.Any(m => m.TenantId == x.Id && m.IsActive));
        if (tenant is null) return;
        var members = await db.Memberships.Where(x => x.TenantId == tenant.Id && x.IsActive).ToListAsync();
        if (members.Count == 0) return;
        var now = DateTime.UtcNow;
        var existingClients = await db.Clients.Where(x => x.TenantId == tenant.Id).ToListAsync();
        for (var i = 0; i < existingClients.Count; i++)
        {
            var visibleName = existingClients[i].DisplayName.Split('(')[0].Trim();
            existingClients[i].Surname = string.IsNullOrWhiteSpace(existingClients[i].Surname) ? visibleName.Split(' ', StringSplitOptions.RemoveEmptyEntries).LastOrDefault() ?? "Client" : existingClients[i].Surname;
            existingClients[i].DateOfBirth ??= new DateOnly(1980 + i % 20, i % 12 + 1, i % 27 + 1);
        }
        await db.SaveChangesAsync();
        // Every web member who can enter the Practitioner product needs a visible
        // caseload. Restricting this to two tablet usernames produced empty web lists.
        var tabletClinicians = members.Where(x => x.RolesJson.Contains("Practitioner")).ToList();
        var caseloadNames = new[] { "Aoife Byrne", "Daniel O'Connor", "Maya Patel", "Liam Murphy", "Niamh Kelly", "Samir Khan", "Rachel Evans", "Tom Walsh" };
        foreach (var clinician in tabletClinicians)
        {
            var owned = existingClients.Where(x => x.PractitionerSubject == clinician.ExternalSubject).ToList();
            for (var i = owned.Count; i < 3; i++)
            {
                var baseName = caseloadNames[(existingClients.Count + i) % caseloadNames.Length];
                var person = new PractitionerClient
                {
                    Id = Guid.NewGuid(), TenantId = tenant.Id, DisplayName = $"{baseName} ({clinician.ExternalSubject})", Surname = baseName.Split(' ').Last(), DateOfBirth = new DateOnly(1985 + i, i + 1, 10 + i), PreferredName = baseName.Split(' ')[0],
                    Phone = $"087 556 {1300 + existingClients.Count + i}", Email = $"{clinician.ExternalSubject}.{i + 1}@example.test", ReferralSource = i % 2 == 0 ? "GP referral" : "Self referral", Status = "active",
                    PractitionerSubject = clinician.ExternalSubject, PractitionerDisplayName = clinician.ExternalSubject == "councillor" ? "Counsellor" : "Practitioner", CreatedAtUtc = now.AddDays(-21 - i), UpdatedAtUtc = now
                };
                db.Clients.Add(person); existingClients.Add(person); owned.Add(person);
            }
            await db.SaveChangesAsync();
            var tabletEvents = await db.Appointments.Where(x => x.TenantId == tenant.Id && x.PractitionerSubject == clinician.ExternalSubject && x.Notes == "Tablet demo seed").OrderBy(x => x.StartsAtUtc).ToListAsync();
            if (tabletEvents.Count == 0)
            {
                var first = owned[0]; var second = owned[1];
                db.Appointments.AddRange(
                    new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = first.Id, PractitionerSubject = clinician.ExternalSubject, PractitionerDisplayName = first.PractitionerDisplayName, AppointmentType = "individual-therapy", Title = "Individual therapy", StartsAtUtc = now.Date.AddHours(10), EndsAtUtc = now.Date.AddHours(11), DeliveryMode = "in-person", Status = "scheduled", Notes = "Tablet demo seed", CreatedAtUtc = now, UpdatedAtUtc = now },
                    new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = second.Id, PractitionerSubject = clinician.ExternalSubject, PractitionerDisplayName = second.PractitionerDisplayName, AppointmentType = "individual-therapy", Title = "Video consultation", StartsAtUtc = now.Date.AddHours(14), EndsAtUtc = now.Date.AddHours(15), DeliveryMode = "video", Status = "scheduled", Notes = "Tablet demo seed", CreatedAtUtc = now, UpdatedAtUtc = now },
                    new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = owned[2].Id, PractitionerSubject = clinician.ExternalSubject, PractitionerDisplayName = owned[2].PractitionerDisplayName, AppointmentType = "group-meeting", Title = "Gambling Recovery: Triggers and urges", StartsAtUtc = now.Date.AddDays(1).AddHours(13), EndsAtUtc = now.Date.AddDays(1).AddHours(14.5), DeliveryMode = "video", Status = "scheduled", Notes = "Tablet demo seed", CreatedAtUtc = now, UpdatedAtUtc = now });
            }
            else if (tabletEvents.All(x => x.StartsAtUtc < now.Date))
            {
                for (var i = 0; i < tabletEvents.Count; i++) { tabletEvents[i].StartsAtUtc = now.Date.AddDays(i / 2).AddHours(i % 2 == 0 ? 10 : 14); tabletEvents[i].EndsAtUtc = tabletEvents[i].StartsAtUtc.AddHours(i == 2 ? 1.5 : 1); tabletEvents[i].UpdatedAtUtc = now; }
            }
            await db.SaveChangesAsync();
        }
        if (existingClients.Count > 0)
        {
            if (!await db.Appointments.AnyAsync(x => x.TenantId == tenant.Id && (x.Title.Contains("CBT") || x.Title.Contains("DBT"))))
            {
                var templates = new[] { ("CBT: Understanding the thought–feeling–behaviour cycle", 1, 10, false), ("DBT Skills: Mindfulness", 2, 14, true), ("CBT: Identifying unhelpful thinking", 3, 10, false), ("DBT Skills: Distress tolerance", 4, 14, true), ("DBT consultation team", 5, 9, true) };
                db.Appointments.AddRange(templates.Select((e, i) => new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = existingClients[i % existingClients.Count].Id, PractitionerSubject = members[i % members.Count].ExternalSubject, PractitionerDisplayName = $"Facilitator {(char)('A' + i % members.Count)}", AppointmentType = "group-meeting", Title = e.Item1, StartsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3), EndsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3 + 1), DeliveryMode = e.Item4 ? "video" : "in-person", Status = "scheduled", Notes = "Programme event · structured skills practice and between-session activity.", CreatedAtUtc = now, UpdatedAtUtc = now }));
                await db.SaveChangesAsync();
            }
            if (!await db.Appointments.AnyAsync(x => x.TenantId == tenant.Id && x.Title.Contains("Gambling")))
            {
                var gambling = new[] { ("Gambling Recovery: Assessment and motivation", 1, 16, false), ("Gambling Recovery: Triggers, urges and thinking patterns", 3, 16, true), ("Gambling Recovery: Financial safeguards and affected others", 5, 16, false), ("Gambling Recovery: Relapse prevention plan", 7, 16, true) };
                db.Appointments.AddRange(gambling.Select((e, i) => new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = existingClients[i % existingClients.Count].Id, PractitionerSubject = members[i % members.Count].ExternalSubject, PractitionerDisplayName = $"Gambling Programme Facilitator {(char)('A' + i % members.Count)}", AppointmentType = "group-meeting", Title = e.Item1, StartsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3), EndsAtUtc = now.Date.AddDays(e.Item2).AddHours(e.Item3 + 1.5), DeliveryMode = e.Item4 ? "video" : "in-person", Status = "scheduled", Notes = "Gambling recovery programme - CBT skills, harm safeguards, affected others and relapse prevention.", CreatedAtUtc = now, UpdatedAtUtc = now }));
                await db.SaveChangesAsync();
            }
            return;
        }
        var names = new[] { "Aoife Byrne", "Daniel O'Connor", "Maya Patel", "Liam Murphy", "Niamh Kelly", "Samir Khan", "Rachel Evans", "Tom Walsh" };
        var clients = names.Select((name, i) => new PractitionerClient { Id = Guid.NewGuid(), TenantId = tenant.Id, DisplayName = name, Surname = name.Split(' ').Last(), DateOfBirth = new DateOnly(1980 + i, i % 12 + 1, 10 + i), PreferredName = name.Split(' ')[0], Phone = $"087 555 {1200 + i}", Email = $"{name.Split(' ')[0].ToLowerInvariant()}@example.test", ReferralSource = i % 2 == 0 ? "GP referral" : "Self referral", Status = "active", PractitionerSubject = members[i % members.Count].ExternalSubject, PractitionerDisplayName = $"Counsellor {(char)('A' + i % members.Count)}", CreatedAtUtc = now.AddDays(-30 - i), UpdatedAtUtc = now });
        db.Clients.AddRange(clients);
        var list = clients.ToList();
        await db.SaveChangesAsync();
        db.CarePlans.AddRange(list.Take(5).Select((client, i) => new PractitionerCarePlan { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = client.Id, Status = "active", CaptureJson = "{\"summary\":\"Collaborative recovery goals and weekly actions for " + client.PreferredName + ".\"}", ReviewDate = DateOnly.FromDateTime(now.AddDays(14 + i)), CreatedAtUtc = now.AddDays(-14), UpdatedAtUtc = now.AddDays(-i) }));
        db.Assessments.AddRange(list.Take(6).Select((client, i) => new PractitionerAssessment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = client.Id, AssessmentType = i % 3 == 0 ? "review" : "initial", CaptureJson = "{\"summary\":\"Strengths, presenting needs, risks and agreed goals recorded.\"}", CompletedAtUtc = now.AddDays(-i * 3), CompletedBySubject = client.PractitionerSubject }));
        var events = new[] { ("CBT: Understanding the thought–feeling–behaviour cycle", "group-meeting", 1, 10, false), ("DBT Skills: Mindfulness", "group-meeting", 2, 14, true), ("CBT: Identifying unhelpful thinking", "group-meeting", 3, 10, false), ("DBT Skills: Distress tolerance", "group-meeting", 4, 14, true), ("DBT consultation team", "team-meeting", 5, 9, true) };
        db.Appointments.AddRange(events.Select((e, i) => new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = i < list.Count ? list[i].Id : null, PractitionerSubject = members[i % members.Count].ExternalSubject, PractitionerDisplayName = $"Facilitator {(char)('A' + i % members.Count)}", AppointmentType = e.Item2, Title = e.Item1, StartsAtUtc = now.Date.AddDays(e.Item3).AddHours(e.Item4), EndsAtUtc = now.Date.AddDays(e.Item3).AddHours(e.Item4 + 1), DeliveryMode = e.Item5 ? "video" : "in-person", Status = "scheduled", Notes = "Programme event · structured skills practice and between-session activity.", CreatedAtUtc = now, UpdatedAtUtc = now }));
        db.Appointments.AddRange(list.Take(4).Select((client, i) => new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenant.Id, ClientId = client.Id, PractitionerSubject = client.PractitionerSubject, PractitionerDisplayName = client.PractitionerDisplayName, AppointmentType = "individual-therapy", Title = i == 0 ? "Video consultation" : "Individual therapy", StartsAtUtc = now.Date.AddDays(i).AddHours(9 + i), EndsAtUtc = now.Date.AddDays(i).AddHours(10 + i), DeliveryMode = i == 0 ? "video" : "in-person", Status = "scheduled", Notes = "Session record ready for completion.", CreatedAtUtc = now, UpdatedAtUtc = now }));
        await db.SaveChangesAsync();
    }
}
