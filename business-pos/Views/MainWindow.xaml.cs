using System.Windows;
using System.Windows.Interop;
using GrameenPOS.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace GrameenPOS.Views;

public partial class MainWindow : Window
{
    private readonly IServiceProvider _serviceProvider;

    public MainWindow(IServiceProvider serviceProvider)
    {
        InitializeComponent();
        _serviceProvider = serviceProvider;
        
        // Set icon programmatically to avoid XAML resource issues
        try
        {
            var iconPath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets", "logo.ico");
            if (System.IO.File.Exists(iconPath))
            {
                this.Icon = new System.Windows.Media.Imaging.BitmapImage(new Uri(iconPath, UriKind.Absolute));
            }
        }
        catch
        {
            // Icon loading failed, continue without icon
        }
        
        // Ensure window is visible and on top
        this.Loaded += MainWindow_Loaded;
        this.IsVisibleChanged += MainWindow_IsVisibleChanged;
        
        // Navigate to login view initially
        NavigateToLogin();
    }

    private void MainWindow_IsVisibleChanged(object sender, DependencyPropertyChangedEventArgs e)
    {
        if (this.IsVisible)
        {
            this.Activate();
            this.Focus();
        }
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        // Ensure window is on primary screen and visible
        var screen = SystemParameters.WorkArea;
        this.Left = screen.Left;
        this.Top = screen.Top;
        
        // Bring window to front and activate
        this.Activate();
        this.Focus();
        this.BringIntoView();
        this.Topmost = true;
        this.Topmost = false;
        this.WindowState = WindowState.Maximized;
        
        // Force window to be visible using Win32 API
        var hwnd = new WindowInteropHelper(this).Handle;
        if (hwnd != IntPtr.Zero)
        {
            NativeMethods.SetForegroundWindow(hwnd);
            NativeMethods.ShowWindow(hwnd, NativeMethods.SW_RESTORE);
            NativeMethods.ShowWindow(hwnd, NativeMethods.SW_MAXIMIZE);
        }
    }

    private static class NativeMethods
    {
        [System.Runtime.InteropServices.DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        public const int SW_RESTORE = 9;
        public const int SW_MAXIMIZE = 3;
    }

    public void NavigateToLogin()
    {
        var loginView = _serviceProvider.GetRequiredService<LoginView>();
        MainFrame.Navigate(loginView);
    }

    public void NavigateToPOS()
    {
        var posView = _serviceProvider.GetRequiredService<POSView>();
        MainFrame.Navigate(posView);
    }

    public void NavigateToSettings()
    {
        var settingsView = _serviceProvider.GetRequiredService<SettingsView>();
        MainFrame.Navigate(settingsView);
    }
}

