using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public sealed class SiteStructureSettingsConfiguration : IEntityTypeConfiguration<SiteStructureSettings>
{
    public void Configure(EntityTypeBuilder<SiteStructureSettings> builder)
    {
        builder.ToTable("SiteStructureSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Key).IsRequired().HasMaxLength(16);
        builder.HasIndex(x => x.Key).IsUnique();
        builder.Property(x => x.NavigationJson).IsRequired().HasMaxLength(30_000);
        builder.Property(x => x.HomepageSectionsJson).IsRequired().HasMaxLength(30_000);
        builder.Property(x => x.LeadershipJson).IsRequired().HasMaxLength(4_000).HasDefaultValue("{}");
        builder.Property(x => x.CreatedByUserId).HasMaxLength(450);
        builder.Property(x => x.LastModifiedByUserId).HasMaxLength(450);
    }
}
