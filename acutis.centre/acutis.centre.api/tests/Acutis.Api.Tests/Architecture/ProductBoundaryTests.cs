using System.Xml.Linq;
using Xunit;

namespace Acutis.Api.Tests.Architecture;

public sealed class ProductBoundaryTests
{
    [Fact]
    public void Product_apis_do_not_reference_other_product_or_legacy_persistence_projects()
    {
        var root = FindRepositoryRoot();
        var products = new Dictionary<string, string>
        {
            ["Acutis.Practitioner.Api"] = Path.Combine("acutis.practitioner", "acutis.practitioner.api", "src"),
            ["Acutis.Community.Api"] = Path.Combine("acutis.community", "acutis.community.api", "src"),
            ["Acutis.Outreach.Api"] = Path.Combine("acutis.outreach", "acutis.outreach.api", "src"),
        };
        foreach (var (product, productRoot) in products)
        {
            var project = XDocument.Load(Path.Combine(root, productRoot, product, $"{product}.csproj"));
            var references = project.Descendants("ProjectReference").Select(x => x.Attribute("Include")?.Value ?? "").ToArray();
            Assert.DoesNotContain(references, x => x.Contains("Acutis.Infrastructure", StringComparison.OrdinalIgnoreCase));
            Assert.DoesNotContain(references, x => products.Keys.Any(other => other != product && x.Contains(other, StringComparison.OrdinalIgnoreCase)));
        }
    }

    [Fact]
    public void Shared_typescript_packages_do_not_depend_on_product_applications()
    {
        var packageRoot = Path.Combine(FindRepositoryRoot(), "acutis.shared");
        foreach (var manifest in Directory.GetFiles(packageRoot, "package.json", SearchOption.AllDirectories))
        {
            var text = File.ReadAllText(manifest);
            Assert.DoesNotContain("@acutis/centre-web", text, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("@acutis/practitioner-web", text, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("@acutis/community-web", text, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("@acutis/outreach-web", text, StringComparison.OrdinalIgnoreCase);
        }
    }

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "package.json"))) directory = directory.Parent;
        return directory?.FullName ?? throw new DirectoryNotFoundException("Repository root not found.");
    }
}
