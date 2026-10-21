namespace GrameenPOS.Models;

public class AppSettings
{
    public string LoginBackgroundImage { get; set; } = string.Empty;
    public string OverlayColorStart { get; set; } = "#80000000"; // Default: semi-transparent black
    public string OverlayColorEnd { get; set; } = "#80000000"; // Default: semi-transparent black
    public double OverlayOpacity { get; set; } = 0.6;
    public bool TaxEnabled { get; set; } = true;
    public decimal TaxRate { get; set; } = 0.10m; // 10%
}

