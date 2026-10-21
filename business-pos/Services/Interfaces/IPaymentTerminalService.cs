namespace GrameenPOS.Services.Interfaces;

public interface IPaymentTerminalService
{
    Task<bool> ProcessCardPaymentAsync(decimal amount);
    bool IsTerminalAvailable { get; }
}

