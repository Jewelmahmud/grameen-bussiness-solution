using System.Windows.Input;
using GrameenPOS.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.Services;

public class BarcodeScannerService : IBarcodeScannerService
{
    private readonly ILogger<BarcodeScannerService> _logger;
    private bool _isListening;

    public event EventHandler<string>? BarcodeScanned;

    public BarcodeScannerService(ILogger<BarcodeScannerService> logger)
    {
        _logger = logger;
    }

    public void StartListening()
    {
        if (_isListening)
            return;

        _isListening = true;
        // TODO: Implement keyboard hook or HID device listening
        // For keyboard wedge scanners, they act as keyboard input
        // We'll need to hook into key events at the application level
        _logger.LogInformation("Barcode scanner service started");
    }

    public void StopListening()
    {
        if (!_isListening)
            return;

        _isListening = false;
        _logger.LogInformation("Barcode scanner service stopped");
    }

    // This method should be called when a barcode is detected
    public void OnBarcodeDetected(string barcode)
    {
        if (_isListening)
        {
            BarcodeScanned?.Invoke(this, barcode);
        }
    }
}

