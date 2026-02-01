using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Acutis.Infrastructure.Persistence.Configurations;

public class CallLogConfiguration : IEntityTypeConfiguration<CallLog>
{
    public void Configure(EntityTypeBuilder<CallLog> builder)
    {
        builder.ToTable("CallLog");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Surname).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CallerType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.ConcernType).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Unit).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Location).HasMaxLength(128).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(64).IsRequired();
        builder.Property(x => x.TimestampUtc).IsRequired();
        builder.Property(x => x.Notes).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(x => x.Status).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Urgency).HasMaxLength(64).IsRequired();

        builder.Property(x => x.CreatedBy).HasMaxLength(128);
        builder.Property(x => x.ModifiedBy).HasMaxLength(128);
    }
}
