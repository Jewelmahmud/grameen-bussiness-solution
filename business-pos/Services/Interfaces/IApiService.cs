using GrameenPOS.DTOs;
using GrameenPOS.Models;

namespace GrameenPOS.Services.Interfaces;

public interface IApiService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> LogoutAsync();
    Task<List<Product>> GetProductsAsync();
    Task<Product?> GetProductByBarcodeAsync(string barcode);
    Task<bool> CreateSaleAsync(SaleRequest sale);
    Task<bool> SyncOfflineSalesAsync(List<Sale> sales);
}

