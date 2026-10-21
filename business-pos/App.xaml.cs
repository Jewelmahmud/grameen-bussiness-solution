using System.IO;
using System.Windows;
using System.Windows.Media;
using GrameenPOS.Data;
using GrameenPOS.Services;
using GrameenPOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace GrameenPOS;

public partial class App : Application
{
    private IHost? _host;
    
    public IServiceProvider? GetServiceProvider() => _host?.Services;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // Configure Serilog
        Log.Logger = new LoggerConfiguration()
            .WriteTo.File("logs/grameen-pos-.log", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        // Add global exception handlers to catch unhandled exceptions
        AppDomain.CurrentDomain.UnhandledException += (sender, args) =>
        {
            Log.Fatal(args.ExceptionObject as Exception, "Unhandled exception in AppDomain");
        };

        DispatcherUnhandledException += (sender, args) =>
        {
            Log.Error(args.Exception, "Unhandled exception in Dispatcher");
            args.Handled = true; // Prevent app crash, but log the error
        };

        // Build configuration
        var appBasePath = AppContext.BaseDirectory;
        var configuration = new ConfigurationBuilder()
            .SetBasePath(appBasePath)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .Build();

        // Create host
        _host = Host.CreateDefaultBuilder()
            .UseContentRoot(appBasePath)
            .UseSerilog()
            .ConfigureAppConfiguration((context, config) =>
            {
                config.AddConfiguration(configuration);
            })
            .ConfigureServices((context, services) =>
            {
                services.AddSingleton<IConfiguration>(configuration);
                // Database
                var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GrameenPOS", "pos.db");
                var dbDirectory = Path.GetDirectoryName(dbPath);
                if (!string.IsNullOrEmpty(dbDirectory) && !Directory.Exists(dbDirectory))
                {
                    Directory.CreateDirectory(dbDirectory);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlite($"Data Source={dbPath}"));

                // HTTP Client
                services.AddHttpClient<IApiService, ApiService>();

                // Services
                services.AddSingleton<LocalSettingsService>();
                services.AddSingleton<ILocalizationService, LocalizationService>();
                services.AddSingleton<IAuthService, AuthService>();
                services.AddScoped<IApiService, ApiService>();
                services.AddScoped<ILocalDbService, LocalDbService>();
                services.AddScoped<IPrintService, PrintService>();
                services.AddSingleton<IBarcodeScannerService, BarcodeScannerService>();
                services.AddScoped<IPaymentTerminalService, PaymentTerminalService>();

                       // ViewModels - SettingsViewModel needs LocalSettingsService and ILocalizationService
                       services.AddSingleton<ViewModels.SettingsViewModel>(sp => 
                           new ViewModels.SettingsViewModel(
                               sp.GetRequiredService<LocalSettingsService>(),
                               sp.GetRequiredService<ILocalizationService>()));
                services.AddTransient<ViewModels.LoginViewModel>();
                services.AddTransient<ViewModels.POSViewModel>();

                // Register IServiceProvider so MainWindow can use it
                services.AddSingleton<IServiceProvider>(sp => sp);
                
                // Views
                services.AddTransient<Views.MainWindow>();
                services.AddTransient<Views.LoginView>();
                services.AddTransient<Views.POSView>();
                services.AddTransient<Views.SettingsView>();
            })
            .Build();

        // Start the host synchronously (it doesn't need to be async)
        _host.Start();

        // Load custom Bangla fonts from Fonts folder
        LoadCustomFonts();

        // Set service provider for dependency resolution
        var mainWindow = _host.Services.GetRequiredService<Views.MainWindow>();
        MainWindow = mainWindow;
        mainWindow.Show();
        mainWindow.Activate();
        mainWindow.WindowState = WindowState.Normal;
        mainWindow.WindowState = WindowState.Maximized;
        mainWindow.Focus();

        // Initialize database and seed data asynchronously in background
        _ = InitializeDatabaseAsync();
    }

    private async Task InitializeDatabaseAsync()
    {
        try
        {
            // Ensure database is created and seed demo data
            using (var scope = _host!.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await dbContext.Database.EnsureCreatedAsync();
                
                // Seed demo products if database is empty
                if (!await dbContext.Products.AnyAsync())
                {
                    var demoProducts = DemoDataService.GetDemoProducts();
                    await dbContext.Products.AddRangeAsync(demoProducts);
                    await dbContext.SaveChangesAsync();
                    Log.Information("Seeded {Count} demo products", demoProducts.Count);
                }
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error initializing database");
        }
    }

    protected override async void OnExit(ExitEventArgs e)
    {
        if (_host != null)
        {
            await _host.StopAsync();
            _host.Dispose();
        }

        Log.CloseAndFlush();
        base.OnExit(e);
    }

    private void LoadCustomFonts()
    {
        try
        {
            // Try to load from application directory first (where fonts are copied during build)
            var fontsFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Fonts");
            
            // If not found, try relative to current directory (for development)
            if (!Directory.Exists(fontsFolder))
            {
                fontsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Fonts");
            }

            if (Directory.Exists(fontsFolder))
            {
                // Prefer Kalpurush if available, otherwise use first font found
                var fontFiles = Directory.GetFiles(fontsFolder, "*.ttf")
                    .Concat(Directory.GetFiles(fontsFolder, "*.otf"))
                    .OrderBy(f => !Path.GetFileNameWithoutExtension(f).Equals("kalpurush", StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (fontFiles.Any())
                {
                    var fontPath = fontFiles.First();
                    var fontFileName = Path.GetFileName(fontPath);
                    var fontName = Path.GetFileNameWithoutExtension(fontPath);
                    
                    // Capitalize first letter for proper font name (kalpurush -> Kalpurush)
                    fontName = char.ToUpper(fontName[0]) + fontName.Substring(1).ToLower();
                    
                    // Use file URI for fonts in output directory
                    var fontUri = new Uri(fontPath, UriKind.Absolute);
                    var fontFamily = new FontFamily(fontUri, fontName);
                    
                    // Set as application-wide default font
                    Resources["BanglaFontFamily"] = fontFamily;
                    
                    Log.Information("Loaded Bangla font '{FontName}' from: {FontPath}", fontName, fontPath);
                }
                else
                {
                    Log.Information("No font files found in Fonts folder. Using system fonts.");
                }
            }
            else
            {
                Log.Information("Fonts folder not found at: {FontsFolder}. Using system fonts.", fontsFolder);
            }
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Error loading custom fonts. Using system fonts.");
        }
    }
}

