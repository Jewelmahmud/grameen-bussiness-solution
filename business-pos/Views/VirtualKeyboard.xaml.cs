using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace GrameenPOS.Views;

public partial class VirtualKeyboard : UserControl
{
    public static readonly DependencyProperty TargetTextBoxProperty =
        DependencyProperty.Register(
            nameof(TargetTextBox),
            typeof(TextBox),
            typeof(VirtualKeyboard),
            new PropertyMetadata(null));

    public TextBox? TargetTextBox
    {
        get => (TextBox?)GetValue(TargetTextBoxProperty);
        set => SetValue(TargetTextBoxProperty, value);
    }

    public event EventHandler? DoneClicked;

    public VirtualKeyboard()
    {
        InitializeComponent();
    }

    private void LetterButton_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && TargetTextBox != null)
        {
            var text = button.Content?.ToString() ?? "";
            var currentText = TargetTextBox.Text ?? "";
            var caretIndex = TargetTextBox.CaretIndex;
            
            TargetTextBox.Text = currentText.Insert(caretIndex, text);
            TargetTextBox.CaretIndex = caretIndex + text.Length;
            TargetTextBox.Focus();
        }
    }

    private void NumberButton_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && TargetTextBox != null)
        {
            var text = button.Content?.ToString() ?? "";
            var currentText = TargetTextBox.Text ?? "";
            var caretIndex = TargetTextBox.CaretIndex;
            
            TargetTextBox.Text = currentText.Insert(caretIndex, text);
            TargetTextBox.CaretIndex = caretIndex + text.Length;
            TargetTextBox.Focus();
        }
    }

    private void BackspaceButton_Click(object sender, RoutedEventArgs e)
    {
        if (TargetTextBox != null && TargetTextBox.Text.Length > 0)
        {
            var caretIndex = TargetTextBox.CaretIndex;
            if (caretIndex > 0)
            {
                TargetTextBox.Text = TargetTextBox.Text.Remove(caretIndex - 1, 1);
                TargetTextBox.CaretIndex = caretIndex - 1;
            }
            TargetTextBox.Focus();
        }
    }

    private void ClearButton_Click(object sender, RoutedEventArgs e)
    {
        if (TargetTextBox != null)
        {
            TargetTextBox.Text = "";
            TargetTextBox.Focus();
        }
    }

    private void DoneButton_Click(object sender, RoutedEventArgs e)
    {
        DoneClicked?.Invoke(this, EventArgs.Empty);
    }
}

