using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using GrameenPOS.DTOs;
using GrameenPOS.Models;
using GrameenPOS.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.Services;

public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ApiService> _logger;
    private readonly string _baseUrl;
    private readonly IAuthService _authService;

    public ApiService(HttpClient httpClient, ILogger<ApiService> logger, IConfiguration configuration, IAuthService authService)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["ApiBaseUrl"] ?? "https://business.grameenbazaar.com";
        _authService = authService;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Attempting login for email: {Email}", request.Email);
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/v1/auth/login", request);
            
            if (response.IsSuccessStatusCode)
            {
                var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();
                _logger.LogInformation("Login response received. Success: {Success}, HasTokens: {HasTokens}", 
                    loginResponse?.Success ?? false, 
                    loginResponse?.Tokens != null);
                
                if (loginResponse != null && loginResponse.Success && loginResponse.Tokens != null)
                {
                    // Store access token for future API calls
                    _httpClient.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginResponse.Tokens.AccessToken);
                    _logger.LogInformation("Login successful, token stored");
                }
                else
                {
                    _logger.LogWarning("Login response indicates failure. Message: {Message}", loginResponse?.Message);
                }
                return loginResponse;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Login failed with status {StatusCode}: {Error}", response.StatusCode, errorContent);
                
                // Try to parse error response to get message
                try
                {
                    var errorJson = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(errorContent);
                    if (errorJson.TryGetProperty("message", out var messageProp))
                    {
                        var errorResponse = new LoginResponse
                        {
                            Success = false,
                            Message = messageProp.GetString() ?? "Login failed"
                        };
                        return errorResponse;
                    }
                }
                catch
                {
                    // If parsing fails, return null
                }
                
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return null;
        }
    }

    public async Task<bool> LogoutAsync()
    {
        try
        {
            // Ensure authorization header is set with current token
            if (_authService.CurrentUser != null && !string.IsNullOrEmpty(_authService.CurrentUser.AccessToken))
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authService.CurrentUser.AccessToken);
            }
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/auth/logout", null);
            
            // Clear authorization header after logout
            _httpClient.DefaultRequestHeaders.Authorization = null;
            
            if (response.IsSuccessStatusCode)
            {
                var logoutResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
                var success = logoutResponse.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
                return success;
            }
            else
            {
                _logger.LogWarning("Logout failed with status {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            // Clear authorization header even if request failed
            _httpClient.DefaultRequestHeaders.Authorization = null;
            return false;
        }
    }

    public async Task<List<Product>> GetProductsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/api/products");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<Product>>() ?? new List<Product>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching products");
            return new List<Product>();
        }
    }

    public async Task<Product?> GetProductByBarcodeAsync(string barcode)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/api/products/barcode/{barcode}");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<Product>();
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching product by barcode");
            return null;
        }
    }

    public async Task<bool> CreateSaleAsync(SaleRequest sale)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/sales", sale);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating sale");
            return false;
        }
    }

    public async Task<bool> SyncOfflineSalesAsync(List<Sale> sales)
    {
        try
        {
            var saleRequests = sales.Select(s => new SaleRequest
            {
                Items = s.Items.Select(i => new SaleItemDto
                {
                    ProductId = i.Product.Id,
                    Quantity = i.Quantity,
                    Price = i.Product.Price
                }).ToList(),
                TotalAmount = s.TotalAmount,
                PaymentType = s.PaymentType,
                CashierId = s.CashierId
            }).ToList();

            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/api/sales/sync", saleRequests);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing offline sales");
            return false;
        }
    }
}

