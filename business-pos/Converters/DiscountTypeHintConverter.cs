using System.Globalization;
using System.Windows.Data;

namespace GrameenPOS.Converters;

public class DiscountTypeHintConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is string discountType)
        {
            return discountType == "Percentage" ? "শতাংশ (যেমন: 10)" : "পরিমাণ (যেমন: 50)";
        }
        return "";
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}

