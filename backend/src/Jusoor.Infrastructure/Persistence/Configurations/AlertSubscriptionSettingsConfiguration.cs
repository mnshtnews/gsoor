using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public sealed class AlertSubscriptionSettingsConfiguration : IEntityTypeConfiguration<AlertSubscriptionSettings>
{
    public void Configure(EntityTypeBuilder<AlertSubscriptionSettings> builder)
    {
        builder.ToTable("AlertSubscriptionSettings");
        builder.HasKey(x => x.Key);
        builder.Property(x => x.Key).HasMaxLength(32);
    }
}
