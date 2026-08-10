using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext (DbContextOptions<AppDbContext> options) : base(options)
        {

        }
    

  
        public DbSet<User> Users { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasOne(u => u.Class)
                .WithMany(c => c.Students)
                .HasForeignKey(u => u.ClassId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Subject>()
                .HasOne(s => s.Class)
                .WithMany(c => c.Subjects)
                .HasForeignKey(s => s.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Subject>()
                .HasOne(s => s.Teacher)
                .WithMany()
                .HasForeignKey(s => s.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Class)
                .WithMany()
                .HasForeignKey(a => a.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Subject)
                .WithMany(s => s.Assignments)
                .HasForeignKey(a => a.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Teacher)
                .WithMany()
                .HasForeignKey(a => a.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Submission>()
                .HasOne(sub => sub.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(sub => sub.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Submission>()
                .HasOne(sub => sub.Student)
                .WithMany()
                .HasForeignKey(sub => sub.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Submission>()
                .HasIndex(sub => new { sub.AssignmentId, sub.StudentId })
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.LoginId)
                .IsUnique();
        }


    }

}