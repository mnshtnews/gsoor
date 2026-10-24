using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public class UserPermissionGrantConfiguration : IEntityTypeConfiguration<UserPermissionGrant>
{
    public void Configure(EntityTypeBuilder<UserPermissionGrant> builder)
    {
        builder.ToTable("UserPermissionGrants");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.Permission).IsRequired().HasMaxLength(100);
        builder.Property(x => x.GrantedByUserId).IsRequired().HasMaxLength(450);
        builder.HasIndex(x => new { x.UserId, x.Permission }).IsUnique();
        builder.HasIndex(x => x.GrantedAtUtc);
    }
}
