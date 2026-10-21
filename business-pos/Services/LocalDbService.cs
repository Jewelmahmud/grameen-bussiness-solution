using GrameenPOS.Data;
using GrameenPOS.Models;
using GrameenPOS.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.Services;

public class LocalDbService : ILocalDbService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LocalDbService> _logger;

    public LocalDbService(ApplicationDbContext context, ILogger<LocalDbService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Product>> GetProductsAsync()
    {
        try
        {
            return await _context.Products.ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching products from local DB");
            return new List<Product>();
        }
    }

    public async Task<Product?> GetProductByBarcodeAsync(string barcode)
    {
        try
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.Barcode == barcode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching product by barcode from local DB");
            return null;
        }
    }

    public async Task SaveProductAsync(Product product)
    {
        try
        {
            var existing = await _context.Products.FindAsync(product.Id);
            if (existing != null)
            {
                _context.Entry(existing).CurrentValues.SetValues(product);
            }
            else
            {
                await _context.Products.AddAsync(product);
            }
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving product to local DB");
        }
    }

    public async Task SaveProductsAsync(List<Product> products)
    {
        try
        {
            foreach (var product in products)
            {
                var existing = await _context.Products.FindAsync(product.Id);
                if (existing != null)
                {
                    _context.Entry(existing).CurrentValues.SetValues(product);
                }
                else
                {
                    await _context.Products.AddAsync(product);
                }
            }
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving products to local DB");
        }
    }

    public async Task<List<Sale>> GetUnsyncedSalesAsync()
    {
        try
        {
            return await _context.Sales
                .Where(s => !s.IsSynced)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching unsynced sales from local DB");
            return new List<Sale>();
        }
    }

    public async Task SaveSaleAsync(Sale sale)
    {
        try
        {
            await _context.Sales.AddAsync(sale);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving sale to local DB");
        }
    }

    public async Task MarkSaleAsSyncedAsync(string saleId)
    {
        try
        {
            var sale = await _context.Sales.FindAsync(saleId);
            if (sale != null)
            {
                sale.IsSynced = true;
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking sale as synced");
        }
    }
}

