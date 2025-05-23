using Microsoft.EntityFrameworkCore; // Dla DbContext, DbSet, ModelBuilder, etc.
using TicketServiceApp.Models;     // Dla modeli Ticket i TicketReply

namespace TicketServiceApp.Data
{
    /// <summary>
    /// Kontekst bazy danych Entity Framework Core dla serwisu zgłoszeń (ticketów).
    /// Odpowiada za konfigurację połączenia z bazą danych i mapowanie modeli na tabele.
    /// </summary>
    public class TicketDbContext : DbContext
    {
        // Konstruktor wstrzykujący opcje konfiguracyjne DbContext.
        public TicketDbContext(DbContextOptions<TicketDbContext> options) : base(options) { }

        // Definicje DbSet reprezentujące tabele w bazie danych.
        public DbSet<Ticket> Tickets { get; set; }             // Tabela dla zgłoszeń (ticketów)
        public DbSet<TicketReply> TicketReplies { get; set; } // Tabela dla odpowiedzi na zgłoszenia

        // Konfiguracja modelu bazy danych przy użyciu Fluent API.
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Wywołanie implementacji bazowej jest dobrą praktyką.

            // Konfiguracja dla encji Ticket:
            // Właściwość Status (która jest typu enum TicketStatus) będzie przechowywana w bazie danych jako string.
            modelBuilder.Entity<Ticket>()
                .Property(t => t.Status)
                .HasConversion<string>(); // Konwersja enuma na string i z powrotem.

            // Konfiguracja dla encji TicketReply:
            // Definicja relacji jeden-do-wielu między Ticket a TicketReply.
            modelBuilder.Entity<TicketReply>()
                .HasOne(tr => tr.Ticket)           // TicketReply ma jeden powiązany Ticket.
                .WithMany(t => t.Replies)         // Ticket może mieć wiele powiązanych TicketReply.
                .HasForeignKey(tr => tr.TicketId) // Klucz obcy w tabeli TicketReplies to TicketId.
                .OnDelete(DeleteBehavior.Cascade);  // Kaskadowe usuwanie: usunięcie Ticket spowoduje usunięcie wszystkich jego TicketReply.
        }
    }
}