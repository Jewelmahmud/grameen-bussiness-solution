using GrameenPOS.Models;
using GrameenPOS.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.Services;

public class PrintService : IPrintService
{
    private readonly ILogger<PrintService> _logger;
    private string? _printerName;

    public PrintService(ILogger<PrintService> logger)
    {
        _logger = logger;
        // TODO: Load printer name from configuration
        _printerName = null;
    }

    public bool IsPrinterConfigured => !string.IsNullOrEmpty(_printerName);

    public async Task<bool> PrintReceiptAsync(Sale sale)
    {
        if (!IsPrinterConfigured)
        {
            _logger.LogWarning("Printer not configured");
            return false;
        }

        try
        {
            // TODO: Implement ESC/POS printing
            // This is a placeholder - actual implementation will use ESC/POS commands
            var receiptText = GenerateReceiptText(sale);
            _logger.LogInformation("Printing receipt: {ReceiptText}", receiptText);
            
            // Open cash drawer after printing
            OpenCashDrawer();
            
            return await Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error printing receipt");
            return false;
        }
    }

    public async Task<bool> TestPrintAsync()
    {
        if (!IsPrinterConfigured)
        {
            return false;
        }

        try
        {
            // TODO: Implement test print
            _logger.LogInformation("Test print executed");
            return await Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during test print");
            return false;
        }
    }

    public void OpenCashDrawer()
    {
        if (!IsPrinterConfigured)
        {
            return;
        }

        try
        {
            // TODO: Implement cash drawer opening via ESC/POS command
            // ESC/POS command: ESC p 0 25 250 (opens drawer)
            _logger.LogInformation("Opening cash drawer");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error opening cash drawer");
        }
    }

    private string GenerateReceiptText(Sale sale)
    {
        var receipt = new System.Text.StringBuilder();
        receipt.AppendLine("=================================");
        receipt.AppendLine("         RECEIPT");
        receipt.AppendLine("=================================");
        receipt.AppendLine($"Date: {sale.Timestamp:yyyy-MM-dd HH:mm:ss}");
        receipt.AppendLine("---------------------------------");
        
        foreach (var item in sale.Items)
        {
            receipt.AppendLine($"{item.Product.Name} x{item.Quantity}");
            receipt.AppendLine($"  {item.Product.Price:C} x {item.Quantity} = {item.TotalPrice:C}");
        }
        
        receipt.AppendLine("---------------------------------");
        receipt.AppendLine($"Total: {sale.TotalAmount:C}");
        receipt.AppendLine($"Payment: {sale.PaymentType}");
        receipt.AppendLine("=================================");
        receipt.AppendLine("Thank you for your purchase!");
        
        return receipt.ToString();
    }
}

