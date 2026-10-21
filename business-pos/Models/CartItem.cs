using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;

namespace GrameenPOS.Models;

public class CartItem : INotifyPropertyChanged
{
    private Product _product;
    private int _quantity;

    // Default constructor for serialization
    public CartItem()
    {
        _product = null!;
        _quantity = 0;
    }

    // Proper constructor to ensure object is fully initialized before use
    public CartItem(Product product, int quantity = 1)
    {
        if (product == null)
            throw new ArgumentNullException(nameof(product), "Product cannot be null");
        
        _product = product;
        _quantity = quantity;
    }

    public Product Product
    {
        get => _product;
        set
        {
            if (_product != value)
            {
                if (value == null)
                {
                    throw new ArgumentNullException(nameof(Product), "Product cannot be null");
                }
                _product = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(TotalPrice));
            }
        }
    }

    public int Quantity
    {
        get => _quantity;
        set
        {
            if (_quantity != value)
            {
                _quantity = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(TotalPrice));
            }
        }
    }

    public decimal TotalPrice
    {
        get
        {
            try
            {
                if (Product == null)
                    return 0;
                
                // Ensure Price and Quantity are valid
                var price = Product.Price;
                var quantity = Quantity;
                
                // Return 0 if either value is invalid
                if (price < 0 || quantity < 0)
                    return 0;
                
                return price * quantity;
            }
            catch
            {
                // Return 0 on any error to prevent binding crashes
                return 0;
            }
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        try
        {
            // Simple property change notification - WPF handles thread marshaling automatically
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
        catch
        {
            // Silently handle errors during property change notification
            // This prevents crashes when binding errors occur
        }
    }
}

