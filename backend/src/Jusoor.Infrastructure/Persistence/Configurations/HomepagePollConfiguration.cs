using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public sealed class HomepagePollConfiguration : IEntityTypeConfiguration<HomepagePoll>
{
    public void Configure(EntityTypeBuilder<HomepagePoll> builder)
    {
        builder.ToTable("HomepagePolls");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Question).IsRequired().HasMaxLength(240);
        builder.Property(x => x.Options).HasColumnType("text[]").IsRequired();
        builder.HasIndex(x => x.IsActive).IsUnique().HasFilter("\"IsActive\" = TRUE");
        builder.Property(x => x.CreatedByUserId).HasMaxLength(450);
        builder.Property(x => x.LastModifiedByUserId).HasMaxLength(450);
    }
}
