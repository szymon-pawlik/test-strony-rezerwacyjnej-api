
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using UserServiceApp.Data;

#nullable disable

namespace UserServiceApp.Migrations
{
    [DbContext(typeof(UserDbContext))]
    [Migration("20250522175000_InitialUserSchema")]
    partial class InitialUserSchema
    {

        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.5");

            modelBuilder.Entity("UserServiceApp.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("TEXT");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("Email")
                        .IsUnique();

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            Id = new Guid("deb7a6b0-09a3-464e-8f5a-4d8543e6a0c4"),
                            Email = "admin@example.com",
                            Name = "Default Admin",
                            PasswordHash = "$2a$11$XTJItk/.FRV4F9ECIFSXne16zGuSvZUQxCw3O8B9DILW7XCBV/skO",
                            Role = "Admin"
                        });
                });
#pragma warning restore 612, 618
        }
    }
}
