<div align="center">

# Grameen Business Solution

An all-in-one retail management system built specifically for shops, pharmacies, and local businesses in Bangladesh.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-8.0_WPF-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/Jewelmahmud/grameen-bussiness-solution/pulls)

</div>

---

Most standard ERPs and POS systems don't work well in rural or semi-urban Bangladesh: internet goes out frequently, shopkeepers need Bangla language support with Bangla digits, and hardware like cheap Chinese ESC/POS thermal printers or barcode guns need to just plug in and work.

**Grameen Business Solution** solves this by bundling three dedicated parts into one monorepo:

1. **`business-backend`** – Express API running on PostgreSQL for central inventory, tenancy, reports, and payments.
2. **`business-frontend`** – Web-based inventory and ERP dashboard with full Bangla/English localization and multi-role access.
3. **`business-pos`** – Windows desktop POS app (.NET 8 WPF) that runs offline with local SQLite caching and syncs back when connectivity returns.

---

## What's in the Box

```
grameen-bussiness-solution/
├── business-backend/     # Express.js REST API + PostgreSQL + Docker
├── business-frontend/    # React 18 web dashboard (CRA, MUI 5, Recharts)
└── business-pos/         # Windows desktop POS (.NET 8 WPF, SQLite, ESC/POS printer)
```

### 1. `business-backend` (API & Storage)
- **Runtime & DB**: Node 18+, Express 4, PostgreSQL 16.
- **Multi-Tenancy**: Tenant-aware business context and modules.
- **Payments**: Local payment hooks including SSLCommerz integration stubs.
- **Docker Compose**: One command to spin up Postgres, pgAdmin, and the backend.

### 2. `business-frontend` (Store Management Dashboard)
- **UI Stack**: React 18, Material UI 5, Recharts for sales graphs, Leaflet for store mapping.
- **Bilingual**: English & Bangla support throughout (with Bangla digit formatting).
- **Core Modules**: Products & variations, purchases, sales history, warranty tracking, warehouses, HR/payroll, and reports.

### 3. `business-pos` (Desktop Point-of-Sale)
- **UI & Framework**: .NET 8 WPF (Material Design in XAML), MVVM architecture.
- **Offline Reliability**: SQLite cache with EF Core so sales don't stop when Wi-Fi drops.
- **Hardware Integrations**:
  - ESC/POS 58mm/80mm thermal receipt printing.
  - Cash drawer kick via printer port.
  - Barcode scanner (keyboard wedge & HID mode).
  - On-screen touch virtual keyboard for touchscreen counters.

---

## Quick Start

### Prerequisites
Make sure you have these on your machine:
- **Node.js** v18+ and **npm**
- **Docker & Docker Compose** (for easy DB setup)
- **.NET 8 SDK** (for the desktop POS app)

---

### Step 1: Run Backend & Database

The fastest way to get the database and API running is with Docker:

```bash
cd business-backend

# 1. Copy the sample environment file
cp env.example .env

# 2. Start PostgreSQL, pgAdmin, and the API
docker-compose up -d
```

- API runs at: `http://localhost:3040/api/v1`
- pgAdmin runs at: `http://localhost:5050` (`admin@dokan.com` / `admin`)

> **Prefer running Node directly without Docker?**
> Set your PostgreSQL credentials in `.env`, then:
> ```bash
> npm install
> npm run db:migrate
> npm run dev
> ```

---

### Step 2: Run the Web Dashboard

In a new terminal window:

```bash
cd business-frontend

# 1. Copy environment template
cp .env.example .env

# 2. Install dependencies & start
npm install
npm start
```

Your browser should open to `http://localhost:3000`.

---

### Step 3: Run the Desktop POS

If you are developing or testing the retail checkout terminal on Windows:

```powershell
cd business-pos

# Restore packages and run
dotnet restore
dotnet run
```

Settings like default thermal printer name, API URL, and tax percentage can be configured directly inside the app settings view or in `appsettings.json`.

---

## Configuration & Secrets

Each sub-project uses its own environment config. **Never commit `.env` files.**

- Backend: Copy `business-backend/env.example` to `business-backend/.env`
- Frontend: Copy `business-frontend/.env.example` to `business-frontend/.env`
- POS: Edit `business-pos/appsettings.json` (or `appsettings.Development.json`)

---

## Ports Summary

| Service | Default Port | Notes |
| :--- | :--- | :--- |
| **Frontend Web App** | `3000` | React dev server |
| **Backend REST API** | `3040` | Express server |
| **PostgreSQL** | `6040` (host) / `5432` (container) | Mapped to avoid Windows Hyper-V port conflicts |
| **pgAdmin Web** | `5050` | Optional DB management UI |

---

## Contributing

1. Fork or branch off `main`: `git checkout -b feature/my-new-feature`
2. Keep code style consistent with the respective sub-project (.eslintrc for JS, C# conventions for WPF).
3. Test your changes locally before submitting a PR.
4. Open a pull request describing what changed and why.

---

## Maintainers

Maintained by **[Jewel Mahmud](https://github.com/Jewelmahmud)** & Grameen Innovation Lab team.
