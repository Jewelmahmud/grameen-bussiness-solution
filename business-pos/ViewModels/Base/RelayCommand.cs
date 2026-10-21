using System.Windows.Input;
using System.Windows.Threading;
using Microsoft.Extensions.Logging;

namespace GrameenPOS.ViewModels.Base;

public class RelayCommand : ICommand
{
    private readonly Action<object?> _execute;
    private readonly Func<object?, bool>? _canExecute;
    private static ILogger? _logger;

    public static void SetLogger(ILogger logger)
    {
        _logger = logger;
    }

    public RelayCommand(Action<object?> execute, Func<object?, bool>? canExecute = null)
    {
        _execute = execute ?? throw new ArgumentNullException(nameof(execute));
        _canExecute = canExecute;
    }

    public event EventHandler? CanExecuteChanged
    {
        add { CommandManager.RequerySuggested += value; }
        remove { CommandManager.RequerySuggested -= value; }
    }

    public bool CanExecute(object? parameter)
    {
        return _canExecute == null || _canExecute(parameter);
    }

    public void Execute(object? parameter)
    {
        try
        {
            _execute(parameter);
        }
        catch (Exception ex)
        {
            // Log and handle exceptions to prevent crashes
            _logger?.LogError(ex, "RelayCommand Execute error");
            System.Diagnostics.Debug.WriteLine($"RelayCommand Execute error: {ex}");
            throw; // Re-throw to see actual error in debugger
        }
    }
}

public class RelayCommand<T> : ICommand
{
    private readonly Action<T?> _execute;
    private readonly Func<T?, bool>? _canExecute;
    private readonly Dispatcher? _dispatcher;
    private static ILogger? _logger;

    public static void SetLogger(ILogger logger)
    {
        _logger = logger;
    }

    public RelayCommand(Action<T?> execute, Func<T?, bool>? canExecute = null)
    {
        _execute = execute ?? throw new ArgumentNullException(nameof(execute));
        _canExecute = canExecute;
        _dispatcher = Dispatcher.CurrentDispatcher;
    }

    public event EventHandler? CanExecuteChanged
    {
        add { CommandManager.RequerySuggested += value; }
        remove { CommandManager.RequerySuggested -= value; }
    }

    public bool CanExecute(object? parameter)
    {
        try
        {
            return _canExecute == null || _canExecute((T?)parameter);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "RelayCommand<T> CanExecute error");
            return false;
        }
    }

    public void Execute(object? parameter)
    {
        try
        {
            if (_dispatcher != null && !_dispatcher.CheckAccess())
            {
                _dispatcher.Invoke(() => _execute((T?)parameter));
            }
            else
            {
                _execute((T?)parameter);
            }
        }
        catch (Exception ex)
        {
            // Log and handle exceptions to prevent crashes
            _logger?.LogError(ex, "RelayCommand<T> Execute error: Parameter type: {ParameterType}, Parameter: {Parameter}", 
                typeof(T).Name, parameter?.ToString() ?? "null");
            System.Diagnostics.Debug.WriteLine($"RelayCommand<T> Execute error: {ex}");
            throw; // Re-throw to see actual error in debugger
        }
    }
}

