namespace Acutis.Domain.Lookups;

public static class ScreeningLifecycleLookups
{
    public static class LookupTypes
    {
        public static readonly Guid CaseStatus = Guid.Parse("1b9fe05a-8664-4d7f-af4c-096e703d9922");
        public static readonly Guid CasePhase = Guid.Parse("94e91511-c0c9-4514-b332-f253f17d71fb");
        public static readonly Guid AdmissionDecisionStatus = Guid.Parse("48ba830e-fb52-435c-8235-62c9265324a8");
        public static readonly Guid ScheduledIntakeStatus = Guid.Parse("4e2a6d0e-dd7e-45dd-9a59-6f81609c80fa");
    }

    public static class CaseStatuses
    {
        public static readonly Guid Referred = Guid.Parse("3b4536d3-5da6-47e2-bd3f-7266d1ff4f48");
        public static readonly Guid ReferralReceived = Guid.Parse("508ceebd-752e-43cc-b237-b9cd45722a29");
        public static readonly Guid ScreeningInProgress = Guid.Parse("25394e01-00da-4550-b175-7732bf9b05ce");
        public static readonly Guid ScreeningCompleted = Guid.Parse("33da7572-d932-4dc6-a73a-bb5d14de10bb");
        public static readonly Guid Waitlisted = Guid.Parse("fbd5b871-557a-4672-ad2c-1722d19244e0");
        public static readonly Guid Deferred = Guid.Parse("56fa535a-1146-4586-8136-a04f2ecfcc28");
        public static readonly Guid Admitted = Guid.Parse("db73f893-2f2e-4d08-9567-bfce123f76b3");
        public static readonly Guid Declined = Guid.Parse("3295573d-bf71-468f-bbda-21210ae9d939");
        public static readonly Guid ClosedWithoutAdmission = Guid.Parse("3124cff7-ca2e-4f65-8859-41004144ed96");
    }

    public static class CasePhases
    {
        public static readonly Guid Intake = Guid.Parse("ab177e88-2252-4852-b313-a6451717bf56");
        public static readonly Guid Referral = Guid.Parse("7ce7f82e-9479-42fd-a529-bfd46a01fc1b");
        public static readonly Guid Screening = Guid.Parse("19581218-a828-45c2-b55f-cd77877aa850");
        public static readonly Guid AdmissionDecision = Guid.Parse("30604255-7c76-4863-ad1b-ddd50cf1ce00");
        public static readonly Guid Admission = Guid.Parse("26a24065-7e1d-49d0-825c-b8a748e00a6f");
    }

    public static class AdmissionDecisionStatuses
    {
        public static readonly Guid Approved = Guid.Parse("0e30aa95-f453-4478-a1f6-2dd5486ca49f");
        public static readonly Guid Rejected = Guid.Parse("96ed1cc5-e91b-4bdb-a8b1-f663b16e40b8");
        public static readonly Guid Waitlisted = Guid.Parse("6e85b1a2-f242-47bf-ab58-f53c35d5147f");
        public static readonly Guid Deferred = Guid.Parse("6712a77b-64ef-4909-b524-d22c18c546c3");
        public static readonly Guid Admitted = Guid.Parse("174c677e-bdfd-44ac-9baf-f055339d096d");
    }

    public static class ScheduledIntakeStatuses
    {
        public static readonly Guid Scheduled = Guid.Parse("052cc32d-3db6-48f0-a36e-aa6a21cac522");
        public static readonly Guid Cancelled = Guid.Parse("11c771a2-d9a1-4c6a-b5ec-b341248b7d90");
    }

    private static readonly IReadOnlyDictionary<string, Guid> CaseStatusCodeMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
    {
        ["referred"] = CaseStatuses.Referred,
        ["referral_received"] = CaseStatuses.ReferralReceived,
        ["screening_in_progress"] = CaseStatuses.ScreeningInProgress,
        ["screening_completed"] = CaseStatuses.ScreeningCompleted,
        ["waitlisted"] = CaseStatuses.Waitlisted,
        ["deferred"] = CaseStatuses.Deferred,
        ["admitted"] = CaseStatuses.Admitted,
        ["declined"] = CaseStatuses.Declined,
        ["closed_without_admission"] = CaseStatuses.ClosedWithoutAdmission
    };

    private static readonly IReadOnlyDictionary<string, Guid> CasePhaseCodeMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
    {
        ["intake"] = CasePhases.Intake,
        ["referral"] = CasePhases.Referral,
        ["screening"] = CasePhases.Screening,
        ["admission_decision"] = CasePhases.AdmissionDecision,
        ["admission"] = CasePhases.Admission
    };

    private static readonly IReadOnlyDictionary<string, Guid> AdmissionDecisionStatusCodeMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
    {
        ["approved"] = AdmissionDecisionStatuses.Approved,
        ["rejected"] = AdmissionDecisionStatuses.Rejected,
        ["waitlisted"] = AdmissionDecisionStatuses.Waitlisted,
        ["deferred"] = AdmissionDecisionStatuses.Deferred,
        ["admitted"] = AdmissionDecisionStatuses.Admitted
    };

    private static readonly IReadOnlyDictionary<string, Guid> ScheduledIntakeStatusCodeMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
    {
        ["scheduled"] = ScheduledIntakeStatuses.Scheduled,
        ["cancelled"] = ScheduledIntakeStatuses.Cancelled
    };

    public static Guid ResolveCaseStatusLookupValueId(string code) => CaseStatusCodeMap[NormalizeCode(code)];

    public static Guid ResolveCasePhaseLookupValueId(string code) => CasePhaseCodeMap[NormalizeCode(code)];

    public static Guid? ResolveAdmissionDecisionStatusLookupValueId(string? code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return null;
        }

        return AdmissionDecisionStatusCodeMap[NormalizeCode(code)];
    }

    public static Guid ResolveScheduledIntakeStatusLookupValueId(string code) => ScheduledIntakeStatusCodeMap[NormalizeCode(code)];

    public static bool MatchesCaseStatus(Guid? lookupValueId, string? legacyCode, params Guid[] expectedIds) =>
        Matches(lookupValueId, legacyCode, expectedIds, CaseStatusCodeMap);

    public static bool MatchesCasePhase(Guid? lookupValueId, string? legacyCode, params Guid[] expectedIds) =>
        Matches(lookupValueId, legacyCode, expectedIds, CasePhaseCodeMap);

    public static bool MatchesAdmissionDecisionStatus(Guid? lookupValueId, string? legacyCode, params Guid[] expectedIds) =>
        Matches(lookupValueId, legacyCode, expectedIds, AdmissionDecisionStatusCodeMap);

    public static bool MatchesScheduledIntakeStatus(Guid? lookupValueId, string? legacyCode, params Guid[] expectedIds) =>
        Matches(lookupValueId, legacyCode, expectedIds, ScheduledIntakeStatusCodeMap);

    private static bool Matches(
        Guid? lookupValueId,
        string? legacyCode,
        IReadOnlyCollection<Guid> expectedIds,
        IReadOnlyDictionary<string, Guid> codeMap)
    {
        if (lookupValueId.HasValue)
        {
            return expectedIds.Contains(lookupValueId.Value);
        }

        if (string.IsNullOrWhiteSpace(legacyCode))
        {
            return false;
        }

        return codeMap.TryGetValue(NormalizeCode(legacyCode), out var resolvedId) && expectedIds.Contains(resolvedId);
    }

    private static string NormalizeCode(string code) => code.Trim();
}
