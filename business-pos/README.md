# Grameen POS - Windows Point of Sale Application

A modern Windows POS terminal application built with WPF (.NET 8) that provides offline-first functionality with local caching and API integration.

## Features

- **Authentication**: Login with API integration and role-based access
- **Product Management**: Search products by name or barcode, product grid view
- **Shopping Cart**: Add/remove items, quantity management, real-time totals
- **Payment Processing**: Cash and card payment support
- **Receipt Printing**: ESC/POS thermal printer support with cash drawer integration
- **Offline Mode**: Local SQLite caching with background sync
- **Barcode Scanner**: Keyboard wedge and HID scanner support
- **Modern UI**: Material Design with touch-friendly interface

## Architecture

- **Framework**: WPF (.NET 8)
- **Pattern**: MVVM (Model-View-ViewModel)
- **Dependency Injection**: Microsoft.Extensions.DependencyInjection
- **Database**: SQLite with Entity Framework Core
- **UI Framework**: MaterialDesignInXAML
- **Logging**: Serilog

## Project Structure

```
GrameenPOS/
├── Models/              # Data models (Product, Sale, CartItem, User)
├── ViewModels/          # ViewModels for MVVM pattern
│   └── Base/           # Base classes (ViewModelBase, RelayCommand)
├── Views/              # XAML views
├── Services/           # Business logic services
│   └── Interfaces/     # Service interfaces
├── Data/               # Entity Framework context
├── DTOs/               # Data transfer objects for API
└── Converters/         # Value converters for XAML
```

## Setup

1. **Prerequisites**:
   - .NET 8 SDK ([Download here](https://dotnet.microsoft.com/download/dotnet/8.0))
   - Visual Studio 2022 or VS Code with C# extension

2. **Build**:
   ```powershell
   dotnet restore
   dotnet build
   ```

3. **Run**:
   ```powershell
   dotnet run
   ```

   **Or use Visual Studio:**
   - Open `GrameenPOS.csproj`
   - Press `F5` to run

   See [HOW_TO_RUN.md](HOW_TO_RUN.md) for detailed instructions.

## Configuration

Edit `appsettings.json` to configure:
- API Base URL
- Printer Name
- Tax Rate
- Theme (Light/Dark)

## Development Status

This is the initial project setup. The following features are implemented:

✅ Project structure and MVVM setup
✅ Dependency injection container
✅ SQLite database context
✅ Service interfaces and base implementations
✅ Login and POS views with ViewModels
✅ Material Design UI framework

### TODO (Next Steps):

- [ ] Complete API service implementation with actual endpoints
- [ ] Implement ESC/POS printer commands
- [ ] Add barcode scanner keyboard hook
- [ ] Implement payment terminal SDK integration
- [ ] Add settings screen
- [ ] Implement offline sync background service
- [ ] Add reports screen
- [ ] Add receipt preview and PDF export
- [ ] Testing and error handling improvements

## License

Copyright © 2024 Grameen POS

