using System.IO;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using GrameenPOS.DTOs;
using GrameenPOS.Models;
using GrameenPOS.Services;
using GrameenPOS.Services.Interfaces;
using GrameenPOS.ViewModels.Base;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.ViewModels;

public class LoginViewModel : ViewModelBase
{
    private readonly IApiService _apiService;
    private readonly ILogger<LoginViewModel> _logger;
    private readonly LocalSettingsService _settingsService;
    private string _email = string.Empty;
    private string _password = string.Empty;
    private bool _rememberMe;
    private string _errorMessage = string.Empty;
    private bool _isLoading;
    private ImageSource? _backgroundImageSource;
    private Color _overlayColorStart;
    private Color _overlayColorEnd;
    private double _overlayOpacity;

    public LoginViewModel(IApiService apiService, ILogger<LoginViewModel> logger, LocalSettingsService settingsService)
    {
        _apiService = apiService;
        _logger = logger;
        _settingsService = settingsService;
        LoginCommand = new RelayCommand(async _ => await LoginAsync(), _ => !IsLoading && !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password));
        
        // Development defaults
        // Email = "jewel@grameenbazaar.com";
        // Password = "#JsRB20csID";
        
        LoadSettings();
    }

    public string Email
    {
        get => _email;
        set
        {
            SetProperty(ref _email, value);
            LoginCommand.CanExecute(null);
        }
    }

    public string Password
    {
        get => _password;
        set
        {
            SetProperty(ref _password, value);
            LoginCommand.CanExecute(null);
        }
    }

    public bool RememberMe
    {
        get => _rememberMe;
        set => SetProperty(ref _rememberMe, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        set
        {
            SetProperty(ref _isLoading, value);
            LoginCommand.CanExecute(null);
        }
    }

    public RelayCommand LoginCommand { get; }

    public event EventHandler<LoginResponse>? LoginSuccessful;

    public ImageSource? BackgroundImageSource
    {
        get => _backgroundImageSource;
        set => SetProperty(ref _backgroundImageSource, value);
    }

    public Color OverlayColorStart
    {
        get => _overlayColorStart;
        set => SetProperty(ref _overlayColorStart, value);
    }

    public Color OverlayColorEnd
    {
        get => _overlayColorEnd;
        set => SetProperty(ref _overlayColorEnd, value);
    }

    public double OverlayOpacity
    {
        get => _overlayOpacity;
        set => SetProperty(ref _overlayOpacity, value);
    }

    private void LoadSettings()
    {
        var settings = _settingsService.GetSettings();
        
        if (!string.IsNullOrEmpty(settings.LoginBackgroundImage) && File.Exists(settings.LoginBackgroundImage))
        {
            try
            {
                var bitmap = new BitmapImage();
                bitmap.BeginInit();
                bitmap.UriSource = new Uri(settings.LoginBackgroundImage, UriKind.Absolute);
                bitmap.CacheOption = BitmapCacheOption.OnLoad;
                bitmap.EndInit();
                BackgroundImageSource = bitmap;
            }
            catch
            {
                BackgroundImageSource = null;
            }
        }
        
        try
        {
            OverlayColorStart = (Color)ColorConverter.ConvertFromString(settings.OverlayColorStart);
        }
        catch
        {
            OverlayColorStart = Color.FromArgb(128, 0, 0, 0);
        }
        
        try
        {
            OverlayColorEnd = (Color)ColorConverter.ConvertFromString(settings.OverlayColorEnd);
        }
        catch
        {
            OverlayColorEnd = Color.FromArgb(128, 0, 0, 0);
        }
        
        OverlayOpacity = settings.OverlayOpacity;
    }

    public void RefreshSettings()
    {
        LoadSettings();
    }

    private async Task LoginAsync()
    {
        IsLoading = true;
        ErrorMessage = string.Empty;

        try
        {
            _logger.LogInformation("LoginAsync called. Email: {Email}, Password length: {PasswordLength}, Password empty: {IsEmpty}", 
                Email, Password?.Length ?? 0, string.IsNullOrEmpty(Password));
            
            // Validate inputs
            if (string.IsNullOrWhiteSpace(Email))
            {
                ErrorMessage = "ইমেইল প্রয়োজন";
                _logger.LogWarning("Login failed: Email is empty");
                return;
            }
            
            if (string.IsNullOrWhiteSpace(Password))
            {
                ErrorMessage = "পাসওয়ার্ড প্রয়োজন";
                _logger.LogWarning("Login failed: Password is empty");
                return;
            }
            
            var request = new LoginRequest
            {
                Email = Email.Trim(),
                Password = Password
            };

            _logger.LogInformation("Sending login request to API. Email: {Email}", request.Email);
            var response = await _apiService.LoginAsync(request);
            
            _logger.LogInformation("Login response received. Response is null: {IsNull}, Success: {Success}, HasTokens: {HasTokens}, Message: {Message}", 
                response == null, 
                response?.Success ?? false, 
                response?.Tokens != null,
                response?.Message ?? "N/A");
            
            if (response != null && response.Success && response.Tokens != null)
            {
                _logger.LogInformation("Login successful, invoking LoginSuccessful event");
                LoginSuccessful?.Invoke(this, response);
            }
            else
            {
                var errorMsg = response?.Message ?? "ইমেইল বা পাসওয়ার্ড ভুল";
                _logger.LogWarning("Login failed: {ErrorMessage}", errorMsg);
                ErrorMessage = errorMsg;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login. Exception type: {ExceptionType}, Message: {Message}, StackTrace: {StackTrace}", 
                ex.GetType().Name, ex.Message, ex.StackTrace);
            ErrorMessage = $"লগইন করার সময় একটি ত্রুটি ঘটেছে: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }
}

