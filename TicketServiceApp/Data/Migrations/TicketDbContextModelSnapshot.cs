
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TicketServiceApp.Data;

#nullable disable

namespace TicketServiceApp.Data.Migrations
{
    [DbContext(typeof(TicketDbContext))]
    partial class TicketDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.16");

            modelBuilder.Entity("TicketServiceApp.Models.Ticket", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("LastUpdatedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Subject")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("TEXT");

                    b.Property<string>("UserEmail")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<Guid>("UserId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Tickets");
                });

            modelBuilder.Entity("TicketServiceApp.Models.TicketReply", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("RepliedAt")
                        .HasColumnType("TEXT");

                    b.Property<string>("ReplierUserEmail")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("ReplierUserId")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("TicketId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("TicketId");

                    b.ToTable("TicketReplies");
                });

            modelBuilder.Entity("TicketServiceApp.Models.TicketReply", b =>
                {
                    b.HasOne("TicketServiceApp.Models.Ticket", "Ticket")
                        .WithMany("Replies")
                        .HasForeignKey("TicketId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Ticket");
                });

            modelBuilder.Entity("TicketServiceApp.Models.Ticket", b =>
                {
                    b.Navigation("Replies");
                });
#pragma warning restore 612, 618
        }
    }
}
