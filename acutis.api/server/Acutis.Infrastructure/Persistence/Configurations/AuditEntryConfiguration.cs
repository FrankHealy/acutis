using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
{
    public void Configure(EntityTypeBuilder<AuditEntry> builder)
    {
        builder.ToTable("AuditEntries", schema: "Audit");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.EntityName).HasMaxLength(128).IsRequired();
        builder.Property(x => x.Action).HasMaxLength(32).IsRequired();
        builder.Property(x => x.KeyValues).HasColumnType("nvarchar(max)");
        builder.Property(x => x.OriginalValues).HasColumnType("nvarchar(max)");
        builder.Property(x => x.CurrentValues).HasColumnType("nvarchar(max)");
        builder.Property(x => x.ChangedColumns).HasColumnType("nvarchar(max)");
        builder.Property(x => x.CorrelationId).HasMaxLength(64);
        builder.Property(x => x.IpAddress).HasMaxLength(64);

        builder.HasIndex(x => new { x.EntityName, x.EntityId });
    }
}
