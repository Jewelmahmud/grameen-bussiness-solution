# Windows POS Client Plan – WPF (.NET)

## 1. Project Overview

**Goal:** Build a modern Windows POS terminal app consuming your existing API.
**Platform:** Windows 10/11 (Desktop)
**Framework:** WPF (.NET 8)
**Database:** SQLite (local caching & offline mode)
**Target Hardware:** Barcode scanner, thermal receipt printer, cash drawer, card payment device (via vendor SDK), customer display.

**Key Requirements:**

* Modern UI (Material Design / Fluent Design)
* Offline-first with local caching
* API integration (REST / JSON)
* Peripheral support (printer, scanner, cash drawer)
* Fast, responsive, touch-friendly interface

---

## 2. Architecture

```
+---------------------------------------------------+
|                    Windows POS App               |
|---------------------------------------------------|
| UI Layer (WPF XAML + MVVM)                       |
|  - Views (Screens)                               |
|  - ViewModels (Bind UI to Models)               |
|  - Commands & Data Binding                       |
|---------------------------------------------------|
| Business Layer / Services                         |
|  - API Service (HttpClient wrapper)             |
|  - Local DB Service (SQLite)                    |
|  - Print Service (ESC/POS, vendor SDK)          |
|  - Barcode Scanner Service                        |
|  - Cash Drawer Service                            |
|  - Payment Terminal Service (via SDK)           |
|---------------------------------------------------|
| Data Layer                                       |
|  - Models (Product, Sale, Cart, User)          |
|  - DTOs for API communication                   |
+---------------------------------------------------+
```

**Patterns:**

* MVVM (Model-View-ViewModel)
* Repository pattern for local DB & API
* Dependency Injection (Microsoft.Extensions.DependencyInjection)

---

## 3. Core Features / Modules

### A. Authentication

* Login screen with API call
* Remember me option
* Role-based access (Admin / Cashier)

### B. Product Search / POS Screen

* Search products by name / barcode
* Product grid view (image, price, stock)
* Add to cart / remove / quantity change
* Barcode scanner input support

### C. Cart & Checkout

* Display cart items, subtotal, tax, total
* Apply discounts / promo codes
* Payment options: Cash / Card
* Generate receipt (print preview + print)
* Offline mode → cache sales to SQLite, sync later

### D. Receipt Printing

* ESC/POS thermal printer support
* Network / USB / Serial printers
* Trigger cash drawer on print
* Print detailed receipt (items, total, date, cashier)

### E. Offline Caching

* Local SQLite database for products & sales
* Background sync with API when online
* Conflict resolution for offline sales

### F. Peripheral Integration

* Barcode scanner (keyboard wedge or HID)
* Thermal printer (ESC/POS commands)
* Cash drawer (via printer pulse)
* Optional: Customer display (secondary monitor / VFD)

### G. Settings & Config

* Printer setup & test
* API endpoint configuration
* Offline sync settings
* Themes: Light / Dark mode

### H. Reports (Optional)

* Daily sales report
* Product-wise sales
* Cashier performance report

---

## 4. UI / UX Design

**Style & Framework:**

* MaterialDesignInXAML or FluentWPF
* Touch-friendly controls
* Big buttons for items, checkout, navigation
* Smooth animations / transitions

**Screens / Views:**

1. Login Screen: Username / Password / Remember Me / Login button
2. Dashboard / POS Screen: Product search bar, product grid, cart panel, quick buttons
3. Receipt Preview Screen: Print / Save PDF / Reprint
4. Settings Screen: Printers, API, offline cache, theme
5. Reports Screen (optional): Sales summaries, filters by date or cashier

---

## 5. Data Models

```csharp
class Product {
    string Id;
    string Name;
    string Barcode;
    decimal Price;
    int Stock;
    string ImageUrl;
}

class CartItem {
    Product Product;
    int Quantity;
    decimal TotalPrice;
}

class Sale {
    string Id;
    List<CartItem> Items;
    decimal TotalAmount;
    string PaymentType; // Cash / Card
    DateTime Timestamp;
}

class User {
    string Id;
    string Name;
    string Role;
}
```

---

## 6. Technical Stack

| Layer                | Tech / Library                                       |
| -------------------- | ---------------------------------------------------- |
| Frontend (UI)        | WPF (.NET 8), XAML, MaterialDesignInXAML / FluentWPF |
| Backend API          | HttpClient (REST / JSON)                             |
| Local DB             | SQLite + Entity Framework Core                       |
| Dependency Injection | Microsoft.Extensions.DependencyInjection             |
| Printing             | ESC/POS via RawPrinterHelper / Vendor SDK            |
| Barcode Scanner      | Keyboard input / HID API                             |
| Payment Terminal     | Vendor SDK (Verifone / Ingenico / Pax)               |
| Logging / Error      | Serilog / NLog                                       |

---

## 7. Development Steps

1. Set up project structure (MVVM + DI)
2. Implement authentication via API
3. Build main POS screen (product grid, cart)
4. Integrate barcode scanner input
5. Add cart management & checkout workflow
6. Add receipt printing & cash drawer trigger
7. Implement offline SQLite caching
8. Create Settings screen (printer, API, theme)
9. (Optional) Add reports screen
10. UI polish (animations, transitions, Material/Fluent design)
11. Testing (printer, scanner, offline mode, API)
12. Deploy (MSIX installer / EXE)

---

## 8. Extras for Cursor AI

* Define each screen and feature with actions.
* Include API endpoints for products, sales, login, etc.
* Define UI layout & control types (buttons, grids, textboxes).
* Specify hardware integrations (printer, scanner, cash drawer).
* Optional: provide sample colors, themes, and icons for Cursor AI UI generation.
