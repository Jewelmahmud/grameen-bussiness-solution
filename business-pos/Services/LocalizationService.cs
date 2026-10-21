using System.Collections.Generic;
using System.Globalization;
using System.Resources;
using System.Windows;
using GrameenPOS.Services.Interfaces;

namespace GrameenPOS.Services;

public class LocalizationService : ILocalizationService
{
    private CultureInfo _currentCulture;
    private readonly Dictionary<string, Dictionary<string, string>> _translations;

    public string CurrentLanguage => _currentCulture.TwoLetterISOLanguageName;

    public event EventHandler? LanguageChanged;

    public LocalizationService()
    {
        _currentCulture = new CultureInfo("bn-BD"); // Default to Bangla
        _translations = new Dictionary<string, Dictionary<string, string>>();
        LoadTranslations();
    }

    private void LoadTranslations()
    {
        // English translations
        var english = new Dictionary<string, string>
        {
            // Common
            { "AppName", "Grameen POS" },
            { "Settings", "Settings" },
            { "Logout", "Logout" },
            { "OK", "OK" },
            { "Reset", "Reset Settings" },
            { "Cancel", "Cancel" },
            { "Apply", "Apply" },
            { "Clear", "Clear" },
            { "Delete", "Delete" },
            { "Search", "Search" },
            
            // Login
            { "Login", "Login" },
            { "Email", "Email" },
            { "Password", "Password" },
            { "LoginButton", "Login" },
            { "LoginError", "Login failed. Please check your credentials." },
            
            // POS Screen
            { "Cart", "Cart" },
            { "ClearCart", "Clear Cart" },
            { "Subtotal", "Subtotal:" },
            { "Discount", "Discount:" },
            { "Tax", "Tax:" },
            { "Total", "Total:" },
            { "ApplyDiscount", "Apply Discount:" },
            { "DiscountType", "Discount Type" },
            { "NoDiscount", "No Discount" },
            { "Percentage", "Percentage" },
            { "FixedAmount", "Fixed Amount" },
            { "RemoveDiscount", "Remove Discount" },
            { "CashPayment", "Cash Payment" },
            { "CardPayment", "Card Payment" },
            { "CreditPayment", "Credit Payment" },
            { "Quantity", "Quantity" },
            { "Price", "Price" },
            { "ProductName", "Product Name" },
            { "SearchPlaceholder", "Search by product name or barcode" },
            { "Keyboard", "Keyboard" },
            { "Increase", "Increase" },
            { "Decrease", "Decrease" },
            { "Remove", "Remove" },
            { "Language", "Language" },
            { "Barcode", "Barcode: " },
            { "Stock", "Stock: " },
            { "Image", "Image: " },
            { "Times", " x " },
            { "Equals", " = " },
            
            // Settings Page
            { "Back", "Back" },
            { "LoginBackground", "Login Page Background" },
            { "SelectBackgroundImage", "Select background image:" },
            { "Select", "Select" },
            { "OverlayColorSettings", "Overlay Color Settings" },
            { "StartColor", "Start Color:" },
            { "EndColor", "End Color:" },
            { "Opacity", "Opacity:" },
            { "TaxSettings", "Tax Settings" },
            { "EnableTax", "Enable Tax" },
            { "TaxRate", "Tax Rate (%):" },
            { "TaxRateHint", "e.g., 10 (for 10% tax)" },
            { "Save", "Save" },
        };

        // Bangla translations
        var bangla = new Dictionary<string, string>
        {
            // Common
            { "AppName", "গ্রামীণ POS" },
            { "Settings", "সেটিংস" },
            { "Logout", "লগআউট" },
            { "OK", "ঠিক আছে" },
            { "Reset", "রিসেট করুন" },
            { "Cancel", "বাতিল" },
            { "Apply", "প্রয়োগ" },
            { "Clear", "পরিষ্কার" },
            { "Delete", "মুছুন" },
            { "Search", "অনুসন্ধান" },
            
            // Login
            { "Login", "লগইন" },
            { "Email", "ইমেইল" },
            { "Password", "পাসওয়ার্ড" },
            { "LoginButton", "লগইন" },
            { "LoginError", "লগইন ব্যর্থ হয়েছে। আপনার তথ্য যাচাই করুন।" },
            
            // POS Screen
            { "Cart", "কার্ট" },
            { "ClearCart", "কার্ট খালি করুন" },
            { "Subtotal", "উপমোট:" },
            { "Discount", "ছাড়:" },
            { "Tax", "কর:" },
            { "Total", "মোট:" },
            { "ApplyDiscount", "ছাড় প্রয়োগ করুন:" },
            { "DiscountType", "ছাড়ের ধরন" },
            { "NoDiscount", "ছাড় নেই" },
            { "Percentage", "শতাংশ" },
            { "FixedAmount", "নির্দিষ্ট পরিমাণ" },
            { "RemoveDiscount", "ছাড় সরান" },
            { "CashPayment", "নগদ পেমেন্ট" },
            { "CardPayment", "কার্ড পেমেন্ট" },
            { "CreditPayment", "বাঁকি" },
            { "Quantity", "পরিমাণ" },
            { "Price", "মূল্য" },
            { "ProductName", "পণ্যের নাম" },
            { "SearchPlaceholder", "পণ্যের নাম বা বারকোড দিয়ে অনুসন্ধান করুন" },
            { "Keyboard", "কীবোর্ড" },
            { "Increase", "বাড়ান" },
            { "Decrease", "কম করুন" },
            { "Remove", "মুছুন" },
            { "Language", "ভাষা" },
            { "Barcode", "বারকোড: " },
            { "Stock", "স্টক: " },
            { "Image", "ছবি: " },
            { "Times", " x " },
            { "Equals", " = " },
            
            // Settings Page
            { "Back", "ফিরে যান" },
            { "LoginBackground", "লগইন পৃষ্ঠার ব্যাকগ্রাউন্ড" },
            { "SelectBackgroundImage", "ব্যাকগ্রাউন্ড ছবি নির্বাচন করুন:" },
            { "Select", "বাছাই করুন" },
            { "OverlayColorSettings", "ওভারলে রঙ সেটিংস" },
            { "StartColor", "শুরু রঙ:" },
            { "EndColor", "শেষ রঙ:" },
            { "Opacity", "স্বচ্ছতা:" },
            { "TaxSettings", "কর সেটিংস" },
            { "EnableTax", "কর সক্রিয় করুন" },
            { "TaxRate", "কর হার (%):" },
            { "TaxRateHint", "যেমন: 10 (10% করের জন্য)" },
            { "Save", "সংরক্ষণ করুন" },
        };

        _translations["en"] = english;
        _translations["bn"] = bangla;
    }

    public string GetString(string key)
    {
        var lang = _currentCulture.TwoLetterISOLanguageName;
        if (_translations.TryGetValue(lang, out var langDict) && langDict.TryGetValue(key, out var value))
        {
            return value;
        }
        
        // Fallback to English if not found
        if (lang != "en" && _translations.TryGetValue("en", out var enDict) && enDict.TryGetValue(key, out var enValue))
        {
            return enValue;
        }
        
        return key; // Return key if translation not found
    }

    public void SetLanguage(string languageCode)
    {
        try
        {
            _currentCulture = new CultureInfo(languageCode);
            LanguageChanged?.Invoke(this, EventArgs.Empty);
        }
        catch
        {
            // If invalid language code, default to Bangla
            _currentCulture = new CultureInfo("bn-BD");
        }
    }
}

