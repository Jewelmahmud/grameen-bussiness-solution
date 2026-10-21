using System.Windows;
using System.Windows.Controls;
using MaterialDesignThemes.Wpf;
using GrameenPOS.DTOs;
using GrameenPOS.Models;
using GrameenPOS.Services.Interfaces;
using GrameenPOS.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace GrameenPOS.Views;

public partial class LoginView : UserControl
{
    private readonly LoginViewModel _viewModel;
    private readonly IServiceProvider _serviceProvider;
    private readonly IAuthService _authService;
    private bool _isSyncingPasswordFields;

    public LoginView(LoginViewModel viewModel, IServiceProvider serviceProvider, IAuthService authService)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _serviceProvider = serviceProvider;
        _authService = authService;
        DataContext = _viewModel;
        
        _viewModel.LoginSuccessful += OnLoginSuccessful;
        
        // Set default password for development - do this after InitializeComponent
        // Temporarily unsubscribe from PasswordChanged to avoid double-setting
        PasswordBox.PasswordChanged -= PasswordBox_PasswordChanged;
        if (!string.IsNullOrEmpty(_viewModel.Password))
        {
            PasswordBox.Password = _viewModel.Password;
            PasswordTextBox.Text = _viewModel.Password;
            // Explicitly sync the password to ViewModel after setting it
            _viewModel.Password = PasswordBox.Password;
        }
        // Re-subscribe after setting the password
        PasswordBox.PasswordChanged += PasswordBox_PasswordChanged;
        PasswordTextBox.TextChanged += PasswordTextBox_TextChanged;
    }

    private void PasswordBox_PasswordChanged(object sender, RoutedEventArgs e)
    {
        if (_isSyncingPasswordFields)
        {
            return;
        }

        if (sender is PasswordBox passwordBox)
        {
            _isSyncingPasswordFields = true;
            PasswordTextBox.Text = passwordBox.Password;
            _viewModel.Password = passwordBox.Password;
            _isSyncingPasswordFields = false;
        }
    }

    private void PasswordTextBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        if (_isSyncingPasswordFields)
        {
            return;
        }

        if (sender is TextBox textBox)
        {
            _isSyncingPasswordFields = true;
            PasswordBox.Password = textBox.Text;
            _viewModel.Password = textBox.Text;
            _isSyncingPasswordFields = false;
        }
    }

    private void ShowPasswordToggle_Checked(object sender, RoutedEventArgs e)
    {
        PasswordTextBox.Text = PasswordBox.Password;
        PasswordBox.Visibility = Visibility.Collapsed;
        PasswordTextBox.Visibility = Visibility.Visible;
        SetPasswordVisibilityIcon(showingPlainText: true);
    }

    private void ShowPasswordToggle_Unchecked(object sender, RoutedEventArgs e)
    {
        PasswordBox.Password = PasswordTextBox.Text;
        PasswordTextBox.Visibility = Visibility.Collapsed;
        PasswordBox.Visibility = Visibility.Visible;
        SetPasswordVisibilityIcon(showingPlainText: false);
    }

    private void SetPasswordVisibilityIcon(bool showingPlainText)
    {
        PasswordVisibilityIcon.Kind = showingPlainText ? PackIconKind.EyeOff : PackIconKind.Eye;
    }

    private void OnLoginSuccessful(object? sender, LoginResponse response)
    {
        if (response?.User != null && response.Tokens != null)
        {
            // Store user in auth service
            var user = new User
            {
                Id = response.User.Id,
                Email = response.User.Email,
                FirstName = response.User.FirstName,
                LastName = response.User.LastName,
                Phone = response.User.Phone,
                AccessToken = response.Tokens.AccessToken,
                RefreshToken = response.Tokens.RefreshToken,
                Roles = response.User.Roles.Select(r => r.Name).ToList()
            };
            
            _authService.SetUser(user);
            
            // Navigate to POS view
            var mainWindow = Application.Current.MainWindow as MainWindow;
            mainWindow?.NavigateToPOS();
        }
    }
}

