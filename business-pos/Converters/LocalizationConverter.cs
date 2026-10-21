using System.Globalization;
using System.Windows;
using System.Windows.Data;
using GrameenPOS.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace GrameenPOS.Converters;

public class LocalizationConverter : IValueConverter, IMultiValueConverter
{
    private static ILocalizationService? GetLocalizationService()
    {
        if (Application.Current is App app)
        {
            try
            {
                var serviceProvider = app.GetServiceProvider();
                return serviceProvider?.GetService<ILocalizationService>();
            }
            catch
            {
                // Service not available
            }
        }
        return null;
    }

    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (parameter is string key)
        {
            var localizationService = GetLocalizationService();
            if (localizationService != null)
            {
                return localizationService.GetString(key);
            }
        }
        
        return value ?? string.Empty;
    }

    public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
    {
        // Multi-binding support - use Language property change to trigger refresh
        // values[0] is the Language property from ViewModel
        if (parameter is string key)
        {
            var localizationService = GetLocalizationService();
            if (localizationService != null)
            {
                return localizationService.GetString(key);
            }
        }
        return string.Empty;
    }

    public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
