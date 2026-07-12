using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLog");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.OccurredAt).HasColumnType("datetime2").IsRequired();
        builder.Property(x => x.ActorRole).HasMaxLength(200);
        builder.Property(x => x.EntityType).HasMaxLength(150).IsRequired();
        builder.Property(x => x.EntityId).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Action).HasMaxLength(40).IsRequired();
        builder.Property(x => x.BeforeJson).HasColumnType("nvarchar(max)");
        builder.Property(x => x.AfterJson).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Reason).HasMaxLength(1000);
        builder.Property(x => x.CorrelationId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.RequestPath).HasMaxLength(500).IsRequired();
        builder.Property(x => x.RequestMethod).HasMaxLength(20).IsRequired();
        builder.Property(x => x.ClientIp).HasMaxLength(100);
        builder.Property(x => x.UserAgent).HasMaxLength(512);

        builder.HasIndex(x => x.CorrelationId);
        builder.HasIndex(x => new { x.EntityType, x.EntityId, x.OccurredAt });
    }
}
