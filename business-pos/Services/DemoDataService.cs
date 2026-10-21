using GrameenPOS.Models;

namespace GrameenPOS.Services;

public static class DemoDataService
{
    public static List<Product> GetDemoProducts()
    {
        return new List<Product>
        {
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "চাল (বাসমতি)",
                Barcode = "1001",
                Price = 120.00m,
                Stock = 50,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "ডাল (মসুর)",
                Barcode = "1002",
                Price = 150.00m,
                Stock = 30,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "তেল (সয়াবিন)",
                Barcode = "1003",
                Price = 180.00m,
                Stock = 25,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "চিনি",
                Barcode = "1004",
                Price = 90.00m,
                Stock = 40,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "লবণ",
                Barcode = "1005",
                Price = 25.00m,
                Stock = 100,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "পেঁয়াজ",
                Barcode = "1006",
                Price = 60.00m,
                Stock = 35,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "রসুন",
                Barcode = "1007",
                Price = 200.00m,
                Stock = 20,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "আদা",
                Barcode = "1008",
                Price = 180.00m,
                Stock = 15,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "মরিচ (শুকনো)",
                Barcode = "1009",
                Price = 350.00m,
                Stock = 10,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "হলুদ গুঁড়া",
                Barcode = "1010",
                Price = 280.00m,
                Stock = 18,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "জিরা",
                Barcode = "1011",
                Price = 320.00m,
                Stock = 12,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "ধনিয়া গুঁড়া",
                Barcode = "1012",
                Price = 250.00m,
                Stock = 15,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "সাবান (লাইফবয়)",
                Barcode = "2001",
                Price = 45.00m,
                Stock = 60,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "শ্যাম্পু (সানসিল্ক)",
                Barcode = "2002",
                Price = 180.00m,
                Stock = 25,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "টুথপেস্ট (কলগেট)",
                Barcode = "2003",
                Price = 95.00m,
                Stock = 40,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "বিস্কুট (পারলে)",
                Barcode = "3001",
                Price = 35.00m,
                Stock = 80,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "চা (তাজা)",
                Barcode = "3002",
                Price = 220.00m,
                Stock = 20,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "কফি (নেসলে)",
                Barcode = "3003",
                Price = 450.00m,
                Stock = 15,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "ডিম (এক ডজন)",
                Barcode = "4001",
                Price = 140.00m,
                Stock = 30,
                ImageUrl = ""
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                Name = "দুধ (লিটার)",
                Barcode = "4002",
                Price = 90.00m,
                Stock = 25,
                ImageUrl = ""
            }
        };
    }
}

