using System.Windows;
using System.Windows.Controls;
using GrameenPOS.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace GrameenPOS.Views;

public partial class SettingsView : UserControl
{
    private readonly SettingsViewModel _viewModel;
    private readonly IServiceProvider _serviceProvider;

    public SettingsView(SettingsViewModel viewModel, IServiceProvider serviceProvider)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _serviceProvider = serviceProvider;
        DataContext = _viewModel;
        
        _viewModel.NavigateBackRequested += OnNavigateBack;
    }

    private void OnNavigateBack(object? sender, EventArgs e)
    {
        var mainWindow = Application.Current.MainWindow as MainWindow;
        mainWindow?.NavigateToPOS();
    }
}

