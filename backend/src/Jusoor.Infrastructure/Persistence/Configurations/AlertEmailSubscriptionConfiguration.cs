using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public sealed class AlertEmailSubscriptionConfiguration : IEntityTypeConfiguration<AlertEmailSubscription>
{
    public void Configure(EntityTypeBuilder<AlertEmailSubscription> builder)
    {
        builder.ToTable("AlertEmailSubscriptions");
        builder.HasKey(x => x.Id);
        // Encrypted envelopes are larger than the original address (especially with Key Vault).
        builder.Property(x => x.Email).IsRequired().HasColumnType("text");
        builder.Property(x => x.EmailHash).IsRequired().HasMaxLength(64);
        builder.HasIndex(x => x.EmailHash).IsUnique();
        builder.HasIndex(x => x.IsActive);
    }
}
