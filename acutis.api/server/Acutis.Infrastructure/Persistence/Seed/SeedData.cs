using System.Text.Json;
using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Acutis.Infrastructure.Persistence.Seed;

public static class SeedData
{
    private const string TermsFileName = "groupTherapyTerms.json";
    private const string RatingsFileName = "groupTherapyTermsRatings.json";
    private static readonly string[] DefaultQuickComments =
    {
        "Excellent insight",
        "Good participation",
        "Needs encouragement",
        "Struggling with concept",
        "Very emotional response",
        "Defensive attitude",
        "Making progress",
        "Requires follow-up"
    };

    public static async Task EnsureSeedDataAsync(AcutisDbContext context, ILogger logger, CancellationToken cancellationToken = default)
    {
        await context.Database.EnsureCreatedAsync(cancellationToken);

        if (!context.TherapyTermRatings.Any())
        {
            var ratings = await LoadFromJsonAsync<TherapyTermRatingSeed>(RatingsFileName, cancellationToken);
            foreach (var ratingSeed in ratings)
            {
                context.TherapyTermRatings.Add(new TherapyTermRating
                {
                    ExternalId = ratingSeed.Id,
                    Label = ratingSeed.Label,
                    Description = ratingSeed.Description
                });
            }
        }

        if (!context.TherapyTerms.Any())
        {
            var ratingMap = await context.TherapyTermRatings.ToDictionaryAsync(x => x.ExternalId, cancellationToken);
            var terms = await LoadFromJsonAsync<TherapyTermSeed>(TermsFileName, cancellationToken);
            foreach (var termSeed in terms)
            {
                if (!ratingMap.TryGetValue(termSeed.RatingId, out var rating))
                {
                    logger.LogWarning("Skipping term {Term} because rating id {RatingId} was not found in seed data", termSeed.Term, termSeed.RatingId);
                    continue;
                }

                context.TherapyTerms.Add(new TherapyTerm
                {
                    ExternalId = termSeed.Id,
                    Term = termSeed.Term,
                    Description = termSeed.Description,
                    OwnerId = termSeed.OwnerId,
                    RatingId = rating.Id
                });
            }
        }

        if (!context.QuickCommentTemplates.Any())
        {
            foreach (var comment in DefaultQuickComments)
            {
                context.QuickCommentTemplates.Add(new QuickCommentTemplate
                {
                    Text = comment
                });
            }
        }

        if (!context.TherapyModules.Any())
        {
            var module = BuildStepOneModule();
            context.TherapyModules.Add(module);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static TherapyModule BuildStepOneModule()
    {
        var module = new TherapyModule
        {
            Title = "Step 1: Powerlessness",
            Body = "We admitted we were powerless over alcohol - that our lives had become unmanageable. This step is about accepting that we cannot control our drinking and that our attempts to do so have failed. It requires honesty about the extent of our problem and the impact it has had on our lives and relationships.\n\nPowerlessness is one of the most difficult concepts for many people entering recovery to accept. Our society teaches us that we should be in control of our lives, that willpower and determination can overcome any obstacle. For those struggling with addiction, this belief often becomes a source of shame and frustration as repeated attempts to control drinking through willpower alone continue to fail.\n\nThe admission of powerlessness is not an admission of weakness or failure as a person. Rather, it is the recognition of a fundamental truth about the nature of addiction. Alcohol dependency creates changes in brain chemistry and neural pathways that make it extremely difficult, if not impossible, to control drinking through willpower alone. Understanding this can actually be liberating - it removes the burden of self-blame and opens the door to seeking help.\n\nWhen we speak of our lives becoming 'unmanageable,' we're acknowledging the chaos that alcohol has created in various areas of our existence. This might manifest in damaged relationships, where trust has been broken repeatedly through broken promises and alcohol-fueled incidents. Family members may have distanced themselves, friends may have been alienated, and romantic relationships may have deteriorated or ended entirely.\n\nProfessional consequences are often part of this unmanageability. Many people find their work performance declining due to hangovers, missed days, or drinking during work hours. Some lose jobs entirely, while others live in constant fear of being discovered. Financial problems frequently accompany drinking problems, as money that should go toward necessities gets diverted to alcohol, or poor decision-making while intoxicated leads to costly mistakes.\n\nHealth consequences add another layer to the unmanageability. Physical health may deteriorate through poor nutrition, injuries sustained while intoxicated, or the direct effects of alcohol on organs like the liver, heart, and brain. Mental health often suffers as well, with increased anxiety, depression, or other psychological symptoms that may have started the drinking pattern or been exacerbated by it.\n\nLegal troubles can result from drinking and driving, public intoxication, or other alcohol-related offenses. These consequences create additional stress and complications that make life feel even more out of control. The shame and secrecy that often accompany drinking problems can lead to isolation and a sense of living a double life.\n\nPerhaps most significantly, many people find that their values and their actions become increasingly misaligned. They may do things while drinking that go against their fundamental beliefs about how they want to treat others or how they want to live their lives. This internal conflict creates deep psychological distress and contributes to the sense that life has become unmanageable.\n\nThe process of admitting powerlessness often involves grieving. There's a loss involved - the loss of the belief that we can handle this on our own, the loss of alcohol as a coping mechanism, and sometimes the loss of an identity built around being strong and self-reliant. This grief is natural and necessary, and it's important to allow space for these feelings while also recognizing that this admission opens the door to real change and recovery.\n\nAccepting powerlessness over alcohol doesn't mean accepting powerlessness over everything in life. In fact, it often leads to discovering areas where we do have power and choice - in seeking treatment, in building supportive relationships, in developing healthy coping strategies, and in making daily decisions that support our recovery. The paradox of the first step is that by admitting our powerlessness in one specific area, we often find ourselves more empowered in other areas of life than we have been in years."
        };

        module.Questions = new List<ModuleQuestion>
        {
            new()
            {
                DisplayOrder = 1,
                Prompt = "How did you first realize you were powerless over alcohol?"
            },
            new()
            {
                DisplayOrder = 2,
                Prompt = "What does 'unmanageable' mean to you?"
            },
            new()
            {
                DisplayOrder = 3,
                Prompt = "Can you share an example of when you tried to control your drinking?",
                IsComposite = true,
                Parts = new List<ModuleQuestionPart>
                {
                    new() { DisplayOrder = 1, Prompt = "What specific strategies or rules did you try to implement?" },
                    new() { DisplayOrder = 2, Prompt = "How long were you able to maintain these strategies?" },
                    new() { DisplayOrder = 3, Prompt = "What ultimately led to these attempts failing?" }
                }
            },
            new()
            {
                DisplayOrder = 4,
                Prompt = "How has admitting powerlessness changed your perspective?"
            },
            new()
            {
                DisplayOrder = 5,
                Prompt = "What resistance did you have to accepting this step?"
            }
        };

        return module;
    }

    private static async Task<IReadOnlyCollection<T>> LoadFromJsonAsync<T>(string fileName, CancellationToken cancellationToken)
    {
        var path = ResolveDataPath(fileName);
        await using var stream = File.OpenRead(path);
        var payload = await JsonSerializer.DeserializeAsync<IReadOnlyCollection<T>>(stream, cancellationToken: cancellationToken);
        return payload ?? Array.Empty<T>();
    }

    private static string ResolveDataPath(string fileName)
    {
        var basePath = AppContext.BaseDirectory;
        var candidate = Path.Combine(basePath, fileName);
        if (File.Exists(candidate))
        {
            return candidate;
        }

        var probe = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", "..", fileName));
        if (File.Exists(probe))
        {
            return probe;
        }

        var repoDataPath = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", "..", "src", "data", fileName));
        if (File.Exists(repoDataPath))
        {
            return repoDataPath;
        }

        throw new FileNotFoundException($"Unable to locate seed file '{fileName}'. Checked '{candidate}', '{probe}', and '{repoDataPath}'.");
    }

    private sealed record TherapyTermSeed(int Id, string Term, string Description, string OwnerId, int RatingId);
    private sealed record TherapyTermRatingSeed(int Id, string Label, string Description);
}
