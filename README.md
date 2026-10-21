# 🌿 Grameen Business Solution

> **An end-to-end digital commerce, ERP, inventory, and retail terminal suite designed for local businesses and rural merchants in Bangladesh.**

Grameen Business Solution brings together a robust backend API, a modern bilingual web dashboard for inventory and business management, a dedicated offline-capable desktop Point of Sale (POS) application, and custom operating system deployment scripts into a unified monorepo.

---

## 🏛️ Ecosystem Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           Grameen Business Suite             │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌──────────────────────────────┬─────────────┴────────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼                              ▼
┌──────────────────┐          ┌───────────────────┐          ┌───────────────────┐          ┌───────────────────┐
│ business-backend │          │ business-frontend │          │   business-pos    │          │     grameenOS     │
├──────────────────┤          ├───────────────────┤          ├───────────────────┤          ├───────────────────┤
│ • Node.js / Exp. │          │ • React 18 / CRA  │          │ • .NET 8 / WPF    │          │ • Zorin OS Base   │
│ • PostgreSQL 16  │◄─────────┤ • Material UI 5   │          │ • SQLite Cache    │          │ • Turnkey Scripts │
│ • Docker Compose │          │ • Recharts / Maps │          │ • ESC/POS Printer │          │ • Auto-kiosk Prep │
│ • SSLCommerz /   │          │ • Bilingual (BN/EN│          │ • Barcode Wedge   │          │ • Hardware Driver │
│   Auth Gateway   │          │ • Multi-role ERP  │          │ • Offline-First   │          │   Configurations  │
└──────────────────┘          └───────────────────┘          └───────────────────┘          └───────────────────┘
```

---

## 📦 Project Modules

| Module | Tech Stack | Role / Purpose |
| :--- | :--- | :--- |
| [`business-backend`](./business-backend) | **Node.js, Express, PostgreSQL, Docker** | Core REST API, authentication, product catalog, sales tracking, database migrations, and payment gateways. |
| [`business-frontend`](./business-frontend) | **React 18, Material UI, Recharts, Leaflet** | Web portal for inventory management, ERP operations, order tracking, analytics, and bilingual (Bangla/English) store admin. |
| [`business-pos`](./business-pos) | **C# / .NET 8, WPF, SQLite, EF Core** | Fast Windows desktop POS terminal with offline-first synchronization, thermal receipt printing, and barcode scanner integration. |
| [`grameenOS`](./grameenOS) | **Bash, Live-Build, Zorin OS Base** | Automated customization scripts to build a lightweight, branded Linux operating system tailored for rural retail hardware. |

---

## 📁 Repository Structure

```text
grameen-bussiness-solution/
├── business-backend/                # Core Node.js & PostgreSQL Backend API
│   ├── docker/                     # Docker setup files
│   ├── schemas/                    # JSON database schemas
│   ├── src/                        # Express API controllers, models, routes, services
│   ├── tests/                      # Jest test suite
│   ├── Dockerfile                  # Container build file
│   ├── docker-compose.yml          # Local multi-container stack (App, Postgres, pgAdmin)
│   ├── env.example                 # Backend environment variable template
│   └── package.json
├── business-frontend/               # React 18 Web Management Portal
│   ├── public/                     # Static assets & HTML template
│   ├── src/                        # React components, pages, context, and UI modules
│   ├── .env.example                # Frontend environment variable template
│   └── package.json
├── business-pos/                    # .NET 8 WPF Desktop Point of Sale Application
│   ├── assets/                     # Icons, screenshots, brand graphics
│   ├── Data/                       # Entity Framework & SQLite local database context
│   ├── DTOs/                       # API request and response data contracts
│   ├── Models/                     # Cart, Product, User, and Sale domain models
│   ├── Services/                   # Hardware (printer, scanner) & API sync services
│   ├── ViewModels/                 # MVVM ViewModels with commands
│   ├── Views/                      # Touch-friendly XAML user interface
│   ├── GrameenPOS.csproj           # C# project definition
│   └── grameen-pos.sln             # Visual Studio solution file
├── grameenOS/                       # Custom Linux OS Deployment Scripts
│   ├── plan.md                     # OS rebranding and live-build guidelines
│   └── plan.sh                     # Bash script for remastering Zorin OS ISO
├── .gitignore                       # Global Git ignore rules for the monorepo
└── README.md                        # Project root documentation (this file)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- **Git** (2.x+)
- **Node.js** (v18.0.0 or higher) & **npm** (v9.0.0+)
- **Docker Desktop** & **Docker Compose** (v20.10+ recommended for backend)
- **.NET 8.0 SDK** (required for `business-pos`)
- **Visual Studio 2022** (or VS Code with C# Dev Kit)

---

### 1. Setting Up `business-backend`

1. Navigate to the backend directory:
   ```bash
   cd business-backend
   ```
2. Copy environment settings:
   ```bash
   cp env.example .env
   ```
3. Run with Docker Compose (recommended):
   ```bash
   docker-compose up -d
   ```
   * The API will be available at `http://localhost:3040/api/v1`
   * pgAdmin dashboard will be available at `http://localhost:5050`

4. Or run directly with Node.js:
   ```bash
   npm install
   npm run db:migrate
   npm run dev
   ```

---

### 2. Setting Up `business-frontend`

1. Navigate to the frontend directory:
   ```bash
   cd business-frontend
   ```
2. Copy environment settings:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start development server:
   ```bash
   npm install
   npm start
   ```
4. Access the web dashboard at `http://localhost:3000`.

---

### 3. Setting Up `business-pos`

1. Navigate to the POS directory:
   ```bash
   cd business-pos
   ```
2. Restore NuGet dependencies and build:
   ```powershell
   dotnet restore
   dotnet build
   ```
3. Run the application:
   ```powershell
   dotnet run
   ```
4. To create a standalone installer or single-file executable, refer to `business-pos/HOW_TO_RUN.md` and `create-installer.ps1`.

---

### 4. Exploring `grameenOS`

1. Navigate to the `grameenOS` directory:
   ```bash
   cd grameenOS
   ```
2. Inspect `plan.md` for prerequisites (Ubuntu/Zorin host, `live-build`, `squashfs-tools`, `xorriso`).
3. Customize build configurations inside `plan.sh` to produce a customized bootable ISO for rural store machines.

---

## 🔒 Security & Best Practices

- **Never commit `.env` files**: All secrets, database passwords, and third-party API keys must remain inside `.env` files (which are ignored by `.gitignore`).
- **Use `.env.example` templates**: Whenever new configuration variables are introduced, add dummy placeholder values to the relevant `.env.example`.
- **Database Dumps**: Database dumps (`*.dump`, `*.backup`, `*.sql.gz`) are strictly excluded from version control.

---

## 👥 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit changes with clear, descriptive commit messages.
3. Push to your branch and open a Pull Request.

---

## 📄 License

This repository is maintained by the Grameen Innovation Lab. All rights reserved.
