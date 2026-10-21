using System.Windows;
using System.Windows.Controls;
using GrameenPOS.ViewModels;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace GrameenPOS.Views;

public partial class POSView : UserControl
{
    private readonly POSViewModel _viewModel;
    private readonly IServiceProvider _serviceProvider;
    private TextBox? _currentKeyboardTarget;

    public POSView(POSViewModel viewModel, IServiceProvider serviceProvider)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _serviceProvider = serviceProvider;
        DataContext = _viewModel;
        
        _viewModel.NavigateToSettingsRequested += OnNavigateToSettings;
        _viewModel.LogoutRequested += OnLogout;
    }

    private void OnNavigateToSettings(object? sender, EventArgs e)
    {
        var mainWindow = Application.Current.MainWindow as MainWindow;
        mainWindow?.NavigateToSettings();
    }

    private void OnLogout(object? sender, EventArgs e)
    {
        // Clear user from auth service
        var authService = _serviceProvider.GetRequiredService<Services.Interfaces.IAuthService>();
        authService.ClearUser();
        
        // Navigate back to login
        var mainWindow = Application.Current.MainWindow as MainWindow;
        mainWindow?.NavigateToLogin();
    }

    private void SearchTextBox_GotFocus(object sender, RoutedEventArgs e)
    {
        // Set the keyboard target to search box
        VirtualKeyboardControl.TargetTextBox = SearchTextBox;
        _currentKeyboardTarget = SearchTextBox;
    }

    private void DiscountTextBox_GotFocus(object sender, RoutedEventArgs e)
    {
        // Set the keyboard target to discount box
        VirtualKeyboardControl.TargetTextBox = DiscountTextBox;
        _currentKeyboardTarget = DiscountTextBox;
    }

    private void ProductButton_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            if (sender is Button button)
            {
                var product = button.DataContext as Models.Product;
                if (product != null)
                {
                    // Log to both debug output and file
                    System.Diagnostics.Debug.WriteLine($"ProductButton_Click: Product {product.Name} (ID: {product.Id}) clicked");
                    Serilog.Log.Information("ProductButton_Click: Product {ProductName} (ID: {ProductId}) clicked", product.Name, product.Id);
                    
                    // Directly call the ViewModel method instead of using command
                    // This bypasses any command binding issues
                    _viewModel.AddToCartSync(product);
                    System.Diagnostics.Debug.WriteLine("AddToCartSync called directly");
                    Serilog.Log.Information("AddToCartSync called directly");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine($"ProductButton_Click: DataContext is not a Product. Type: {button.DataContext?.GetType().Name ?? "null"}");
                    Serilog.Log.Warning("ProductButton_Click: DataContext is not a Product. Type: {Type}", button.DataContext?.GetType().Name ?? "null");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"ProductButton_Click: Sender is not a Button. Type: {sender?.GetType().Name ?? "null"}");
                Serilog.Log.Warning("ProductButton_Click: Sender is not a Button. Type: {Type}", sender?.GetType().Name ?? "null");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ProductButton_Click exception: {ex}");
            Serilog.Log.Error(ex, "ProductButton_Click exception");
            MessageBox.Show($"Error: {ex.Message}\n\nStack Trace: {ex.StackTrace}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}

