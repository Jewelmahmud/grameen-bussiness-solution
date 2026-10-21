using GrameenPOS.Models;

namespace GrameenPOS.Services.Interfaces;

public interface ILocalDbService
{
    Task<List<Product>> GetProductsAsync();
    Task<Product?> GetProductByBarcodeAsync(string barcode);
    Task SaveProductAsync(Product product);
    Task SaveProductsAsync(List<Product> products);
    Task<List<Sale>> GetUnsyncedSalesAsync();
    Task SaveSaleAsync(Sale sale);
    Task MarkSaleAsSyncedAsync(string saleId);
}

