using System.IO;
using System.Text.Json;
using GrameenPOS.Models;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.Services;

public class LocalSettingsService
{
    private readonly ILogger<LocalSettingsService> _logger;
    private readonly string _settingsPath;
    private AppSettings? _settings;

    public LocalSettingsService(ILogger<LocalSettingsService> logger)
    {
        _logger = logger;
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "GrameenPOS");
        
        if (!Directory.Exists(appDataPath))
        {
            Directory.CreateDirectory(appDataPath);
        }
        
        _settingsPath = Path.Combine(appDataPath, "settings.json");
        LoadSettings();
    }

    public AppSettings GetSettings()
    {
        return _settings ?? new AppSettings();
    }

    public void SaveSettings(AppSettings settings)
    {
        try
        {
            _settings = settings;
            var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_settingsPath, json);
            _logger.LogInformation("Settings saved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving settings");
        }
    }

    private void LoadSettings()
    {
        try
        {
            if (File.Exists(_settingsPath))
            {
                var json = File.ReadAllText(_settingsPath);
                _settings = JsonSerializer.Deserialize<AppSettings>(json) ?? new AppSettings();
            }
            else
            {
                _settings = new AppSettings();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading settings, using defaults");
            _settings = new AppSettings();
        }
    }
}

