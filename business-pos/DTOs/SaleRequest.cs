using GrameenPOS.Models;

namespace GrameenPOS.DTOs;

public class SaleRequest
{
    public List<SaleItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string? CashierId { get; set; }
}

public class SaleItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

