namespace GrameenPOS.Services.Interfaces;

public interface IBarcodeScannerService
{
    event EventHandler<string>? BarcodeScanned;
    void StartListening();
    void StopListening();
}

