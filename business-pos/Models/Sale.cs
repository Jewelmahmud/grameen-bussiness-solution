using GrameenPOS.Models;

namespace GrameenPOS.Models;

public class Sale
{
    public string Id { get; set; } = string.Empty;
    public List<CartItem> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string PaymentType { get; set; } = string.Empty; // Cash / Card
    public DateTime Timestamp { get; set; }
    public string? CashierId { get; set; }
    public bool IsSynced { get; set; } = false;
}

