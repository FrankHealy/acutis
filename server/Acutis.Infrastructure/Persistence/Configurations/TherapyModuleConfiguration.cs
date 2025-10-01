using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class TherapyModuleConfiguration : IEntityTypeConfiguration<TherapyModule>
{
    public void Configure(EntityTypeBuilder<TherapyModule> builder)
    {
        builder.ToTable("TherapyModules", schema: "Therapy");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Body).HasColumnType("nvarchar(max)");
        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
