using System.Windows;
using System.Windows.Media;
using GrameenPOS.Models;
using GrameenPOS.Services;
using GrameenPOS.Services.Interfaces;
using GrameenPOS.ViewModels.Base;
using Microsoft.Win32;

namespace GrameenPOS.ViewModels;

public class SettingsViewModel : ViewModelBase
{
    private readonly LocalSettingsService _settingsService;
    private readonly ILocalizationService _localizationService;
    private AppSettings _settings;
    private string _selectedBackgroundImage = string.Empty;
    private string _overlayColorStart = "#80000000";
    private string _overlayColorEnd = "#80000000";
    private double _overlayOpacity = 0.6;
    private bool _taxEnabled = true;
    private decimal _taxRate = 0.10m;

    public SettingsViewModel(LocalSettingsService settingsService, ILocalizationService localizationService)
    {
        _settingsService = settingsService;
        _localizationService = localizationService;
        _settings = _settingsService.GetSettings();
        
        SelectedBackgroundImage = _settings.LoginBackgroundImage;
        OverlayColorStart = _settings.OverlayColorStart;
        OverlayColorEnd = _settings.OverlayColorEnd;
        OverlayOpacity = _settings.OverlayOpacity;
        TaxEnabled = _settings.TaxEnabled;
        TaxRate = _settings.TaxRate * 100; // Convert to percentage for display

        // Subscribe to language changes
        _localizationService.LanguageChanged += (s, e) => OnLanguageChanged();

        SelectBackgroundImageCommand = new RelayCommand(_ => SelectBackgroundImage());
        SaveSettingsCommand = new RelayCommand(_ => SaveSettings());
        ResetSettingsCommand = new RelayCommand(_ => ResetSettings());
        NavigateBackCommand = new RelayCommand(_ => NavigateBackRequested?.Invoke(this, EventArgs.Empty));
    }

    public string SelectedBackgroundImage
    {
        get => _selectedBackgroundImage;
        set => SetProperty(ref _selectedBackgroundImage, value);
    }

    public string OverlayColorStart
    {
        get => _overlayColorStart;
        set => SetProperty(ref _overlayColorStart, value);
    }

    public string OverlayColorEnd
    {
        get => _overlayColorEnd;
        set => SetProperty(ref _overlayColorEnd, value);
    }

    public double OverlayOpacity
    {
        get => _overlayOpacity;
        set => SetProperty(ref _overlayOpacity, value);
    }

    public bool TaxEnabled
    {
        get => _taxEnabled;
        set => SetProperty(ref _taxEnabled, value);
    }

    public decimal TaxRate
    {
        get => _taxRate;
        set => SetProperty(ref _taxRate, value);
    }

    public RelayCommand SelectBackgroundImageCommand { get; }
    public RelayCommand SaveSettingsCommand { get; }
    public RelayCommand ResetSettingsCommand { get; }
    public RelayCommand NavigateBackCommand { get; }

    public event EventHandler? NavigateBackRequested;

    private void SelectBackgroundImage()
    {
        var dialog = new OpenFileDialog
        {
            Filter = "Image files (*.jpg;*.jpeg;*.png;*.bmp)|*.jpg;*.jpeg;*.png;*.bmp|All files (*.*)|*.*",
            Title = "Select Login Background Image"
        };

        if (dialog.ShowDialog() == true)
        {
            SelectedBackgroundImage = dialog.FileName;
        }
    }

    private void SaveSettings()
    {
        _settings.LoginBackgroundImage = SelectedBackgroundImage;
        _settings.OverlayColorStart = OverlayColorStart;
        _settings.OverlayColorEnd = OverlayColorEnd;
        _settings.OverlayOpacity = OverlayOpacity;
        _settings.TaxEnabled = TaxEnabled;
        _settings.TaxRate = TaxRate / 100m; // Convert from percentage to decimal
        
        _settingsService.SaveSettings(_settings);
        
        // Notify that settings have changed
        SettingsChanged?.Invoke(this, EventArgs.Empty);
        
        // Refresh login view if it exists
        if (Application.Current.MainWindow is Views.MainWindow mainWindow)
        {
            // Force reload of login view settings
            var loginView = mainWindow.FindName("MainFrame") as System.Windows.Controls.Frame;
            if (loginView?.Content is Views.LoginView login)
            {
                if (login.DataContext is LoginViewModel loginVm)
                {
                    loginVm.RefreshSettings();
                }
            }
        }
    }

    private void ResetSettings()
    {
        SelectedBackgroundImage = string.Empty;
        OverlayColorStart = "#80000000";
        OverlayColorEnd = "#80000000";
        OverlayOpacity = 0.6;
        TaxEnabled = true;
        TaxRate = 10; // 10%
        
        SaveSettings();
    }

    public event EventHandler? SettingsChanged;

    // Localized string properties for binding
    public string Language => _localizationService.CurrentLanguage == "bn" ? "English" : "বাংলা";
    
    private void OnLanguageChanged()
    {
        // Ensure we're on the UI thread
        if (Application.Current?.Dispatcher != null)
        {
            if (Application.Current.Dispatcher.CheckAccess())
            {
                NotifyLanguageProperties();
            }
            else
            {
                Application.Current.Dispatcher.Invoke(() => NotifyLanguageProperties());
            }
        }
        else
        {
            NotifyLanguageProperties();
        }
    }

    private void NotifyLanguageProperties()
    {
        // Notify all properties that use localized strings
        OnPropertyChanged(nameof(Language));
    }
}

