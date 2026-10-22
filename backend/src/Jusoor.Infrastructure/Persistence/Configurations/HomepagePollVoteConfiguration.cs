using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Jusoor.Infrastructure.Persistence.Configurations;

public sealed class HomepagePollVoteConfiguration : IEntityTypeConfiguration<HomepagePollVote>
{
    public void Configure(EntityTypeBuilder<HomepagePollVote> builder)
    {
        builder.ToTable("HomepagePollVotes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.VoterHash).IsRequired().HasMaxLength(64);
        builder.HasIndex(x => new { x.PollId, x.VoterHash }).IsUnique();
        builder.HasIndex(x => new { x.PollId, x.OptionIndex });
        builder.HasOne<HomepagePoll>().WithMany().HasForeignKey(x => x.PollId).OnDelete(DeleteBehavior.Cascade);
    }
}
