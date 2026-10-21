namespace GrameenPOS.Services.Interfaces;

public interface ILocalizationService
{
    string GetString(string key);
    string CurrentLanguage { get; }
    void SetLanguage(string languageCode);
    event EventHandler? LanguageChanged;
}

