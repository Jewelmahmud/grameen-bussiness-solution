using System.Collections.ObjectModel;
using GrameenPOS.DTOs;
using GrameenPOS.Models;
using GrameenPOS.Services;
using GrameenPOS.Services.Interfaces;
using GrameenPOS.ViewModels.Base;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.ViewModels;

public class POSViewModel : ViewModelBase
{
    private readonly IApiService _apiService;
    private readonly ILocalDbService _localDbService;
    private readonly IPrintService _printService;
    private readonly IBarcodeScannerService _barcodeScannerService;
    private readonly IPaymentTerminalService _paymentTerminalService;
    private readonly LocalSettingsService _settingsService;
    private readonly ILocalizationService _localizationService;
    private readonly ILogger<POSViewModel> _logger;

    private string _searchText = string.Empty;
    private List<Product> _products = new();
    private List<Product> _filteredProducts = new();
    private ObservableCollection<CartItem> _cartItems = new();
    private decimal _subtotal;
    private decimal _discount;
    private decimal _tax;
    private decimal _total;
    private string _discountType = "None"; // None, Percentage, Fixed
    private decimal _discountValue;
    private bool _isCalculatingTotals = false;

    public POSViewModel(
        IApiService apiService,
        ILocalDbService localDbService,
        IPrintService printService,
        IBarcodeScannerService barcodeScannerService,
        IPaymentTerminalService paymentTerminalService,
        LocalSettingsService settingsService,
        ILocalizationService localizationService,
        ILogger<POSViewModel> logger)
    {
        _apiService = apiService;
        _localDbService = localDbService;
        _printService = printService;
        _barcodeScannerService = barcodeScannerService;
        _paymentTerminalService = paymentTerminalService;
        _settingsService = settingsService;
        _localizationService = localizationService;
        _logger = logger;
        
        // Subscribe to language changes
        _localizationService.LanguageChanged += (s, e) => OnLanguageChanged();

        AddToCartCommand = new RelayCommand<Product>(product => 
        {
            _logger.LogInformation("AddToCartCommand executed. Product: {ProductName}, Id: {ProductId}", 
                product?.Name ?? "null", product?.Id ?? "null");
            try
            {
                AddToCartSync(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in AddToCartCommand handler");
                throw;
            }
        });
        RemoveFromCartCommand = new RelayCommand<CartItem>(RemoveFromCart);
        UpdateQuantityCommand = new RelayCommand<object>(UpdateQuantity);
        IncreaseQuantityCommand = new RelayCommand<CartItem>(IncreaseQuantity);
        DecreaseQuantityCommand = new RelayCommand<CartItem>(DecreaseQuantity);
        ClearCartCommand = new RelayCommand(_ => ClearCart(), _ => CartItems.Any());
        CheckoutCommand = new RelayCommand(async _ => await CheckoutAsync(), _ => CartItems.Any());
        ProcessCashPaymentCommand = new RelayCommand(async _ => await ProcessPaymentAsync("Cash"));
        ProcessCardPaymentCommand = new RelayCommand(async _ => await ProcessPaymentAsync("Card"));
        ProcessCreditPaymentCommand = new RelayCommand(async _ => await ProcessPaymentAsync("Credit"));
        NavigateToSettingsCommand = new RelayCommand(_ => NavigateToSettingsRequested?.Invoke(this, EventArgs.Empty));
        LogoutCommand = new RelayCommand(async _ => await LogoutAsync());
        SwitchLanguageCommand = new RelayCommand(_ => SwitchLanguage());
        ApplyDiscountCommand = new RelayCommand(_ => ApplyDiscount());
        ClearDiscountCommand = new RelayCommand(_ => ClearDiscount());

        _barcodeScannerService.BarcodeScanned += OnBarcodeScanned;
        _barcodeScannerService.StartListening();

        LoadProductsAsync();
    }

    public string SearchText
    {
        get => _searchText;
        set
        {
            SetProperty(ref _searchText, value);
            FilterProducts();
        }
    }

    public List<Product> FilteredProducts
    {
        get => _filteredProducts;
        set => SetProperty(ref _filteredProducts, value);
    }

    public ObservableCollection<CartItem> CartItems
    {
        get => _cartItems ??= new ObservableCollection<CartItem>();
        set
        {
            if (SetProperty(ref _cartItems, value ?? new ObservableCollection<CartItem>()))
            {
                // Only calculate totals if the property actually changed
                CalculateTotals();
            }
        }
    }

    public decimal Subtotal
    {
        get => _subtotal;
        set => SetProperty(ref _subtotal, value);
    }

    public decimal Discount
    {
        get => _discount;
        set => SetProperty(ref _discount, value);
    }

    public decimal Tax
    {
        get => _tax;
        set => SetProperty(ref _tax, value);
    }

    public decimal Total
    {
        get => _total;
        set => SetProperty(ref _total, value);
    }

    public string DiscountType
    {
        get => _discountType;
        set => SetProperty(ref _discountType, value);
    }

    public decimal DiscountValue
    {
        get => _discountValue;
        set
        {
            SetProperty(ref _discountValue, value);
            if (DiscountType != "None")
            {
                ApplyDiscount();
            }
        }
    }

    public RelayCommand<Product> AddToCartCommand { get; }
    public RelayCommand<CartItem> RemoveFromCartCommand { get; }
    public RelayCommand<object> UpdateQuantityCommand { get; }
    public RelayCommand<CartItem> IncreaseQuantityCommand { get; }
    public RelayCommand<CartItem> DecreaseQuantityCommand { get; }
    public RelayCommand ClearCartCommand { get; }
    public RelayCommand CheckoutCommand { get; }
    public RelayCommand ProcessCashPaymentCommand { get; }
    public RelayCommand ProcessCardPaymentCommand { get; }
    public RelayCommand ProcessCreditPaymentCommand { get; }
    public RelayCommand NavigateToSettingsCommand { get; }
    public RelayCommand LogoutCommand { get; }
    public RelayCommand SwitchLanguageCommand { get; }
    public RelayCommand ApplyDiscountCommand { get; }
    public RelayCommand ClearDiscountCommand { get; }

    public event EventHandler? NavigateToSettingsRequested;
    public event EventHandler? LogoutRequested;

    private async void LoadProductsAsync()
    {
        try
        {
            // Try API first, fallback to local DB
            _products = await _apiService.GetProductsAsync();
            if (!_products.Any())
            {
                _products = await _localDbService.GetProductsAsync();
                
                // If still no products, load demo products
                if (!_products.Any())
                {
                    var demoProducts = DemoDataService.GetDemoProducts();
                    await _localDbService.SaveProductsAsync(demoProducts);
                    _products = demoProducts;
                }
            }
            else
            {
                // Sync to local DB
                await _localDbService.SaveProductsAsync(_products);
            }
            FilterProducts();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading products");
            _products = await _localDbService.GetProductsAsync();
            
            // If still no products, load demo products
            if (!_products.Any())
            {
                var demoProducts = DemoDataService.GetDemoProducts();
                await _localDbService.SaveProductsAsync(demoProducts);
                _products = demoProducts;
            }
            FilterProducts();
        }
    }

    private void FilterProducts()
    {
        if (string.IsNullOrWhiteSpace(SearchText))
        {
            FilteredProducts = _products.ToList();
        }
        else
        {
            FilteredProducts = _products
                .Where(p => p.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                           p.Barcode.Contains(SearchText, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }
    }

    public void AddToCartSync(Product? product)
    {
        _logger.LogInformation("AddToCartSync called. Product: {ProductName}, Id: {ProductId}", 
            product?.Name ?? "null", product?.Id ?? "null");
            
        if (product == null)
        {
            _logger.LogWarning("Attempted to add null product to cart");
            return;
        }

        try
        {
            _logger.LogInformation("Checking UI thread access...");
            // Ensure we're on the UI thread
            if (System.Windows.Application.Current?.Dispatcher != null)
            {
                if (System.Windows.Application.Current.Dispatcher.CheckAccess())
                {
                    _logger.LogInformation("On UI thread, calling AddToCartInternal directly");
                    AddToCartInternal(product);
                }
                else
                {
                    _logger.LogInformation("Not on UI thread, invoking on dispatcher");
                    System.Windows.Application.Current.Dispatcher.Invoke(() => 
                    {
                        _logger.LogInformation("Dispatcher invoke started");
                        AddToCartInternal(product);
                        _logger.LogInformation("Dispatcher invoke completed");
                    });
                }
            }
            else
            {
                _logger.LogWarning("Application.Current.Dispatcher is null, calling directly");
                AddToCartInternal(product);
            }
            _logger.LogInformation("AddToCartSync completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding product to cart: {ProductId}, {ProductName}. Exception: {Exception}", 
                product?.Id ?? "unknown", 
                product?.Name ?? "unknown",
                ex.ToString());
        }
    }

    private void AddToCartInternal(Product product)
    {
        _logger.LogInformation("AddToCartInternal started for product: {ProductName}, Id: {ProductId}", 
            product.Name, product.Id);
        
        // Create a detached copy of the product to avoid EF tracking issues
        // This ensures the Product is a plain POCO that won't try to access DbContext
        var productCopy = new Product
        {
            Id = string.IsNullOrEmpty(product.Id) ? Guid.NewGuid().ToString() : product.Id,
            Name = product.Name ?? string.Empty,
            Barcode = product.Barcode ?? string.Empty,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl ?? string.Empty
        };

        if (string.IsNullOrEmpty(productCopy.Id))
        {
            productCopy.Id = Guid.NewGuid().ToString();
            _logger.LogInformation("Generated temporary ID for product: {ProductName}", productCopy.Name);
        }

        // Get current cart items - use the actual property, not a local copy
        _logger.LogInformation("Getting current cart items. Current count: {Count}", CartItems?.Count ?? 0);
        
        // Ensure CartItems is initialized
        if (_cartItems == null)
        {
            _cartItems = new ObservableCollection<CartItem>();
        }
        
        // Check if product already exists in cart
        _logger.LogInformation("Checking if product already exists in cart...");
        var existingItem = _cartItems.FirstOrDefault(c => 
            c != null && 
            c.Product != null && 
            !string.IsNullOrEmpty(c.Product.Id) &&
            c.Product.Id == productCopy.Id);
        
        if (existingItem != null)
        {
            _logger.LogInformation("Product already in cart, incrementing quantity. Current quantity: {Quantity}", existingItem.Quantity);
            // Increment quantity - this will trigger property change automatically
            // The CartItem's Quantity setter will notify WPF of the change
            existingItem.Quantity++;
            _logger.LogInformation("Quantity incremented to: {Quantity}", existingItem.Quantity);
            // Manually trigger totals calculation since we modified an item in-place
            _logger.LogInformation("Calculating totals...");
            CalculateTotals();
            _logger.LogInformation("Totals calculated");
        }
        else
        {
            _logger.LogInformation("Product not in cart, creating new cart item...");
            // Create new cart item with detached product copy using constructor
            // This ensures the object is fully initialized before being added to the collection
            var newItem = new CartItem(productCopy, 1);
            _logger.LogInformation("New cart item created");
            
            // Add directly to ObservableCollection - this will automatically notify UI
            _logger.LogInformation("Adding to cart items collection...");
            _cartItems.Add(newItem);
            _logger.LogInformation("Item added to collection. New count: {Count}", _cartItems.Count);
            // Notify that CartItems property has changed (collection contents changed)
            OnPropertyChanged(nameof(CartItems));
            // CalculateTotals is needed since we modified the collection
            _logger.LogInformation("Calculating totals...");
            CalculateTotals();
            _logger.LogInformation("Totals calculated");
        }
        
        _logger.LogInformation("Product {ProductName} (ID: {ProductId}) added to cart successfully. Final cart count: {Count}", 
            productCopy.Name ?? "Unknown", 
            productCopy.Id,
            CartItems?.Count ?? 0);
    }

    private async Task RefreshProductFromApiAsync(Product product)
    {
        // This runs in background to refresh product data without blocking UI
        try
        {
            Product? refreshedProduct = null;
            
            if (!string.IsNullOrEmpty(product.Barcode))
            {
                refreshedProduct = await _apiService.GetProductByBarcodeAsync(product.Barcode);
            }
            else if (!string.IsNullOrEmpty(product.Id))
            {
                var allProducts = await _apiService.GetProductsAsync();
                refreshedProduct = allProducts.FirstOrDefault(p => p.Id == product.Id);
            }

            if (refreshedProduct != null)
            {
                // Update the product in the list if it exists
                var index = _products.FindIndex(p => p.Id == product.Id);
                if (index >= 0)
                {
                    _products[index] = refreshedProduct;
                    FilterProducts();
                }
                
                // Update cart items if this product is in cart
                var cartItem = CartItems.FirstOrDefault(c => c.Product?.Id == product.Id);
                if (cartItem != null && cartItem.Product != null)
                {
                    cartItem.Product = refreshedProduct;
                    // ObservableCollection automatically notifies UI, but we need to recalculate totals
                    CalculateTotals();
                }
                
                _logger.LogInformation("Product {ProductId} refreshed from API", product.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not refresh product from API: {ProductId}", product.Id);
        }
    }

    private void RemoveFromCart(CartItem? item)
    {
        if (item == null) return;
        
        try
        {
            CartItems.Remove(item);
            CalculateTotals();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing item from cart");
        }
    }

    private void ClearCart()
    {
        try
        {
            var count = CartItems?.Count ?? 0;
            _logger.LogInformation("Clearing cart. Current item count: {Count}", count);
            
            if (CartItems != null)
            {
                CartItems.Clear();
            }
            CalculateTotals();
            
            _logger.LogInformation("Cart cleared successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart");
        }
    }

    private void UpdateQuantity(object? parameter)
    {
        // TODO: Implement quantity update dialog or inline editing
    }

    private void IncreaseQuantity(CartItem? item)
    {
        if (item == null) return;
        
        try
        {
            _logger.LogInformation("Increasing quantity for cart item: {ProductName}, Current quantity: {Quantity}", 
                item.Product?.Name ?? "Unknown", item.Quantity);
            
            item.Quantity++;
            _logger.LogInformation("Quantity increased to: {Quantity}", item.Quantity);
            
            // Recalculate totals since quantity changed
            CalculateTotals();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error increasing quantity for cart item");
        }
    }

    private void DecreaseQuantity(CartItem? item)
    {
        if (item == null) return;
        
        try
        {
            _logger.LogInformation("Decreasing quantity for cart item: {ProductName}, Current quantity: {Quantity}", 
                item.Product?.Name ?? "Unknown", item.Quantity);
            
            if (item.Quantity > 1)
            {
                item.Quantity--;
                _logger.LogInformation("Quantity decreased to: {Quantity}", item.Quantity);
                
                // Recalculate totals since quantity changed
                CalculateTotals();
            }
            else
            {
                // If quantity is 1, remove the item instead
                _logger.LogInformation("Quantity is 1, removing item from cart");
                RemoveFromCart(item);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error decreasing quantity for cart item");
        }
    }

    private void CalculateTotals()
    {
        // Prevent recursive calls
        if (_isCalculatingTotals)
            return;

        try
        {
            _isCalculatingTotals = true;

            var items = CartItems;
            if (items == null || items.Count == 0)
            {
                Subtotal = 0;
                Discount = 0;
                Tax = 0;
                Total = 0;
                return;
            }

            // Calculate subtotal efficiently
            decimal subtotal = 0;
            foreach (var item in items)
            {
                if (item != null && item.Product != null)
                {
                    try
                    {
                        subtotal += item.TotalPrice;
                    }
                    catch
                    {
                        // Skip invalid items
                    }
                }
            }
            Subtotal = subtotal;
            
            // Apply discount
            if (DiscountType == "Percentage" && DiscountValue > 0)
            {
                Discount = Subtotal * (DiscountValue / 100m);
            }
            else if (DiscountType == "Fixed" && DiscountValue > 0)
            {
                Discount = DiscountValue;
            }
            else
            {
                Discount = 0;
            }
            
            var afterDiscount = Subtotal - Discount;
            
            // Apply tax only if enabled in settings
            var settings = _settingsService.GetSettings();
            if (settings != null && settings.TaxEnabled)
            {
                Tax = afterDiscount * settings.TaxRate;
            }
            else
            {
                Tax = 0;
            }
            
            Total = afterDiscount + Tax;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating totals");
            Subtotal = 0;
            Discount = 0;
            Tax = 0;
            Total = 0;
        }
        finally
        {
            _isCalculatingTotals = false;
        }
    }

    private void ApplyDiscount()
    {
        CalculateTotals();
    }

    private void ClearDiscount()
    {
        DiscountType = "None";
        DiscountValue = 0;
        CalculateTotals();
    }

    private async void OnBarcodeScanned(object? sender, string barcode)
    {
        try
        {
            var product = await _apiService.GetProductByBarcodeAsync(barcode);
            if (product == null)
            {
                product = await _localDbService.GetProductByBarcodeAsync(barcode);
            }

            if (product != null)
            {
                AddToCartSync(product);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing barcode scan");
        }
    }

    private Task CheckoutAsync()
    {
        // Checkout logic will be handled by payment commands
        return Task.CompletedTask;
    }

    private async Task ProcessPaymentAsync(string paymentType)
    {
        if (!CartItems.Any()) return;

        try
        {
            if (paymentType == "Card" && _paymentTerminalService.IsTerminalAvailable)
            {
                var success = await _paymentTerminalService.ProcessCardPaymentAsync(Total);
                if (!success)
                {
                    _logger.LogWarning("Card payment failed");
                    return;
                }
            }

            var sale = new Sale
            {
                Id = Guid.NewGuid().ToString(),
                Items = CartItems.ToList(),
                TotalAmount = Total,
                PaymentType = paymentType,
                Timestamp = DateTime.Now,
                IsSynced = false
            };

            // Try to save to API, fallback to local DB
            var saleRequest = new DTOs.SaleRequest
            {
                Items = sale.Items.Select(i => new DTOs.SaleItemDto
                {
                    ProductId = i.Product.Id,
                    Quantity = i.Quantity,
                    Price = i.Product.Price
                }).ToList(),
                TotalAmount = sale.TotalAmount,
                PaymentType = sale.PaymentType
            };

            var apiSuccess = await _apiService.CreateSaleAsync(saleRequest);
            if (apiSuccess)
            {
                sale.IsSynced = true;
            }

            // Always save to local DB for offline support
            await _localDbService.SaveSaleAsync(sale);

            // Print receipt
            await _printService.PrintReceiptAsync(sale);

            // Clear cart
            CartItems.Clear();
            CalculateTotals();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment");
        }
    }

    private async Task LogoutAsync()
    {
        try
        {
            // Call logout API
            await _apiService.LogoutAsync();
            
            // Stop barcode scanner
            _barcodeScannerService.StopListening();
            
            // Trigger logout event to navigate back to login
            LogoutRequested?.Invoke(this, EventArgs.Empty);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            // Still trigger logout even if API call fails
            _barcodeScannerService.StopListening();
            LogoutRequested?.Invoke(this, EventArgs.Empty);
        }
    }

    private void SwitchLanguage()
    {
        try
        {
            var currentLang = _localizationService.CurrentLanguage;
            _logger.LogInformation("Current language: {Language}, switching...", currentLang);
            var newLang = currentLang == "bn" ? "en-US" : "bn-BD";
            _localizationService.SetLanguage(newLang);
            _logger.LogInformation("Language switched to: {Language}", newLang);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error switching language");
        }
    }

    private void OnLanguageChanged()
    {
        // Ensure we're on the UI thread
        if (System.Windows.Application.Current?.Dispatcher != null)
        {
            if (System.Windows.Application.Current.Dispatcher.CheckAccess())
            {
                NotifyLanguageProperties();
            }
            else
            {
                System.Windows.Application.Current.Dispatcher.Invoke(() => NotifyLanguageProperties());
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
        OnPropertyChanged(nameof(AppName));
        OnPropertyChanged(nameof(Settings));
        OnPropertyChanged(nameof(Logout));
        OnPropertyChanged(nameof(Language));
        OnPropertyChanged(nameof(SearchPlaceholder));
        _logger.LogInformation("Language properties notified. Current language: {Language}", _localizationService.CurrentLanguage);
    }

    // Localized string properties for binding
    public string AppName => _localizationService.GetString("AppName");
    public string Settings => _localizationService.GetString("Settings");
    public string Logout => _localizationService.GetString("Logout");
    public string Language => _localizationService.CurrentLanguage == "bn" ? "English" : "বাংলা";
    public string SearchPlaceholder => _localizationService.GetString("SearchPlaceholder");
}

