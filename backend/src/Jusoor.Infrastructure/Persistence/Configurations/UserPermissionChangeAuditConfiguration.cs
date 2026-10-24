using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public class UserPermissionChangeAuditConfiguration : IEntityTypeConfiguration<UserPermissionChangeAudit>
{
    public void Configure(EntityTypeBuilder<UserPermissionChangeAudit> builder)
    {
        builder.ToTable("UserPermissionChangeAudits");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ActorUserId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.TargetUserId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.Permission).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Action).IsRequired().HasMaxLength(16);
        builder.HasIndex(x => new { x.TargetUserId, x.OccurredAtUtc });
        builder.HasIndex(x => new { x.ActorUserId, x.OccurredAtUtc });
    }
}
