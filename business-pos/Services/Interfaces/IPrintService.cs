using GrameenPOS.Models;

namespace GrameenPOS.Services.Interfaces;

public interface IPrintService
{
    Task<bool> PrintReceiptAsync(Sale sale);
    Task<bool> TestPrintAsync();
    void OpenCashDrawer();
    bool IsPrinterConfigured { get; }
}

