## Grameen Business Solution

Grameen Business Solution is a single, unified app for ERP, POS, business management, inventory, and the main API surface for Grameen E-Commerce. It combines marketplace shopping, multi-role dashboards, and operational tooling into one consistent experience for customers, store owners, admins, support teams, and employees.

## What This App Covers

- **ERP + Business Management**: Centralized management for stores, staff, products, and operations.
- **Inventory + POS**: POS workflows with sales, analytics, transactions, and configuration screens.
- **Marketplace + E-Commerce**: Bazar category browsing, product detail pages, carts, and checkout.
- **Role-based Portals**: Dedicated dashboards for Admin, Store Owner, Support, Employees, and Customers.
- **Integrations (optional)**: POS hardware and multi-bank payment flows; Asterisk PBX support center hooks.
- **Bilingual UX**: Bangla/English UI with locale-aware formatting.

## Key Features

- **Unified bazar experience** across multiple categories (Daily, Medicine, Food, Grains, Garments, Cosmetics, Books, Nursery, Electronics, Chemical, Hardware, National, Feed).
- **Location-aware UI** with persistent selection to personalize the experience.
- **Checkout flow** with cart, pricing, and Bangla digit formatting.
- **Inventory/POS suite** with Sales, Analytics, Transaction History, and Configuration.
- **Multi-bank POS services** with Dutch-Bangla stubs and a shared abstraction layer.
- **Support center option** with Asterisk ARI integration for calls and events.

## Tech Stack

- **React** 18 (CRA)
- **React Router DOM** 6
- **Material UI** 5, @emotion
- **Axios** for HTTP
- **Recharts**, **Leaflet**, **Swiper** for charts/maps/sliders
- **Testing Library** + Jest

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+ (recommended)

### Install and run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

### Environment configuration

- Create a `.env` file (optional) for API base URL used by POS services:
  ```env
  REACT_APP_API_BASE_URL=http://localhost:8000/api
  ```
- Update API base URL used by `src/services/ApiService.js` if hosting a different backend (defaults to `http://bazar.test/api/v1` inside that file).
- For Asterisk PBX integration, see `docs/ASTERISK_SETUP.md` and configure `src/config/asterisk.js`.

## Scripts

- `npm start` — start development server
- `npm run build` — build production assets
- `npm test` — run tests (Jest + Testing Library)
- `npm run eject` — eject CRA config

## Project Structure (high level)

- `src/`
  - `components/` — shared UI, including `POSIntegration/`
  - `contexts/` — `AuthContext`, `CartContext`, `LocationContext`
  - `pages/` — route pages (admin, store-owner, support, employees, customer, inventory, etc.)
    - `inventory/` — `POSSystem.js`, `SalesPage.js`, `AnalyticsPage.js`, `TransactionHistory.js`, `POSConfiguration.js`
  - `services/` — API and integrations
    - `ApiService.js` — application REST endpoints
    - `dutchBanglaPOSService.js` — DBBL POS endpoints
    - `multiBankPOSService.js` — abstraction for multiple banks
    - `AsteriskService.js` — ARI-based call control/events
  - `config/` — `asterisk.js`, `languages.js`, banner/bazar configs
  - `styles/` — theme and CSS assets
  - `tests/` — basic tests (`auth.test.js`, `components.test.js`, `roles.test.js`)

## Core Routes (high level)

- Public: `/`, `/help`, `/contact`, `/about`, `/search`, `/cart`, `/checkout`
- Bazar: `/daily-bazar`, `/medicine-bazar`, `/food-bazar`, `/grains`, `/garments-bazar`, `/cosmetics-bazar`, `/book-bazar`, `/nursery-bazar`, `/electronics-bazar`, `/chemical-bazar`, `/hardware-bazar`, `/national-bazar`, `/feed-bazar`
- Details: `/daily-bazar/products/:productId`, `/stores/:slug`, `/products/:id`
- Dashboards: `/admin/dashboard`, `/store-owner/dashboard`, `/support/dashboard`, `/employees/dashboard`, `/customer/dashboard`
- Inventory/POS: `/inventory/dashboard`, `/inventory/pos-system`

## POS and Hardware Integration

- See `docs/POS_INTEGRATION_GUIDE.md` for barcode scanners, printers, cash drawer, and payment terminals.
- Services:
  - `src/services/dutchBanglaPOSService.js`
  - `src/services/multiBankPOSService.js`

## Asterisk PBX (Support Center)

- See `docs/ASTERISK_SETUP.md` for ARI setup, dialplan, queues, and credentials.
- Client integration: `src/services/AsteriskService.js` (WebSocket + REST ARI).

## i18n and Locale

- Default languages in `src/config/languages.js` (`bn`, `en`).
- Bangla digit price formatting via `utils/priceUtils.js`.

## Build & Deploy

- Build production assets:
  ```bash
  npm run build
  ```
- Outputs to `build/` (static assets compatible with most static hosts or any SPA-serving backend).

## Documentation

- POS integration: `docs/POS_INTEGRATION_GUIDE.md`
- Asterisk PBX: `docs/ASTERISK_SETUP.md`

## License

No explicit license file was found. If you intend to open source or distribute, add a `LICENSE` file and update this section.