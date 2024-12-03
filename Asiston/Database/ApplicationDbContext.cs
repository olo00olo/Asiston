using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Asiston.Database;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TreeNode> TreeNodes { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>().Property(u => u.Initials).HasMaxLength(5);
        builder.HasDefaultSchema("identity");

        // Konfiguracja TreeNode
        builder.Entity<TreeNode>()
            .HasKey(t => t.Id);

        builder.Entity<TreeNode>()
            .Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Entity<TreeNode>()
            .HasIndex(t => t.ParentId);

        // Seed Data for the root node
        builder.Entity<TreeNode>().HasData(
            new TreeNode
            {
                Id = 1,
                Name = "Root",
                ParentId = null
            }
        );
    }
}
