using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public sealed class EditorialArticleTranslationConfiguration : IEntityTypeConfiguration<EditorialArticleTranslation>
{
    public void Configure(EntityTypeBuilder<EditorialArticleTranslation> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Locale).IsRequired().HasMaxLength(2);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(EditorialArticleTranslation.TitleMaxLength);
        builder.Property(x => x.Summary).HasMaxLength(EditorialArticleTranslation.SummaryMaxLength);
        builder.Property(x => x.Body).IsRequired();
        builder.Property(x => x.SourceFingerprint).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Provider).IsRequired().HasMaxLength(80);
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.ReviewedByUserId).HasMaxLength(450);
        builder.HasOne<EditorialArticle>().WithMany().HasForeignKey(x => x.EditorialArticleId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(x => new { x.EditorialArticleId, x.Locale }).IsUnique();
        builder.HasIndex(x => new { x.Locale, x.Status });
    }
}
