namespace Acutis.Platform.Contracts;

public enum AcutisProduct { Centre, Practitioner, Community, Outreach }
public sealed record TenantContext(Guid TenantId, AcutisProduct Product, string OrganisationName, bool IsDemo);
public sealed record ProductMembership(Guid Id, string ExternalSubject, Guid TenantId, IReadOnlyCollection<string> Roles, bool IsActive);
public sealed record ProductLink(AcutisProduct Product, string DisplayName, Uri FrontendUrl, bool Available);
public sealed record ProductLauncherResponse(string ExternalSubject, bool PlatformDemo, IReadOnlyCollection<ProductLink> Products, IReadOnlyCollection<TenantContext> Tenants);
public sealed record TenantBrandingContract(Guid TenantId, string OrganisationName, string? ProductNameOverride, string? LogoUrl, string? FaviconUrl, string? AppIconUrl, string? FontFamily, string? Domain, bool PoweredByAcutis, bool IsDemo, IReadOnlyDictionary<string, string> ThemeTokens, IReadOnlyDictionary<string, string> Terminology, IReadOnlyDictionary<string, bool> FeatureFlags);
