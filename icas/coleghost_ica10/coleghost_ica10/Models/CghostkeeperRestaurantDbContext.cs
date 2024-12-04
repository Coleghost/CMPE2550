using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace coleghost_ica10.Models;

public partial class CghostkeeperRestaurantDbContext : DbContext
{
    public CghostkeeperRestaurantDbContext()
    {
    }

    public CghostkeeperRestaurantDbContext(DbContextOptions<CghostkeeperRestaurantDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<ItemsOffered> ItemsOffereds { get; set; }

    public virtual DbSet<Location> Locations { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=data.cnt.sast.ca,24680; Database=cghostkeeper_RestaurantDB; User Id=cghostkeeper2; Password=cnt_123;Encrypt=False;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Cid).HasName("PK_CustomerID");

            entity.Property(e => e.Cid).ValueGeneratedNever();
            entity.Property(e => e.Email)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Fname)
                .HasMaxLength(85)
                .IsUnicode(false)
                .HasColumnName("FName");
            entity.Property(e => e.Lname)
                .HasMaxLength(85)
                .IsUnicode(false)
                .HasColumnName("LName");
            entity.Property(e => e.Phone)
                .HasMaxLength(14)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Itemid).HasName("PK_ItemID");

            entity.Property(e => e.Itemid).ValueGeneratedNever();
            entity.Property(e => e.ItemName)
                .HasMaxLength(85)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ItemsOffered>(entity =>
        {
            entity.HasKey(e => new { e.Locationid, e.Itemid }).HasName("PK_ItemsOffered_LocId_ItemId");

            entity.ToTable("ItemsOffered");

            entity.Property(e => e.OfferedStatus).HasDefaultValue(true);

            entity.HasOne(d => d.Item).WithMany(p => p.ItemsOffereds)
                .HasForeignKey(d => d.Itemid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ItemsOffered_Items");

            entity.HasOne(d => d.Location).WithMany(p => p.ItemsOffereds)
                .HasForeignKey(d => d.Locationid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ItemsOffered_Locations");
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(e => e.Locationid).HasName("PK_LocationID");

            entity.Property(e => e.Locationid).ValueGeneratedNever();
            entity.Property(e => e.LocationName)
                .HasMaxLength(85)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => new { e.Locationid, e.OrderId }).HasName("PK_Orders_Location_Order");

            entity.Property(e => e.OrderId).ValueGeneratedOnAdd();
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.CidNavigation).WithMany(p => p.Orders)
                .HasForeignKey(d => d.Cid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Customers");

            entity.HasOne(d => d.Item).WithMany(p => p.Orders)
                .HasForeignKey(d => d.Itemid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Items");

            entity.HasOne(d => d.Location).WithMany(p => p.Orders)
                .HasForeignKey(d => d.Locationid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Orders_Locations");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
