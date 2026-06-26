# ECommerce

I built this project — a full-stack e-commerce platform with a .NET 9 Web API backend and a React + TypeScript frontend.

## Tech Stack

**Backend:** ASP.NET Core 9, Entity Framework Core, PostgreSQL, Auth0 (JWT), AutoMapper, Swagger

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, React Three Fiber (3D), Framer Motion, Auth0 React SDK, React Hook Form + Zod, Playwright

## Features

- Role-based authorization (Admin, Seller, Customer, OrderManager, CustomerSupport)
- Hierarchical product catalog (18 main categories, subcategories, leaf categories)
- Shopping cart management & checkout flow
- Order management with status tracking
- Address management
- User profiles & role selection
- Auth0 authentication with JWT bearer tokens
- Seller dashboard (products, orders, revenue, low-stock alerts)
- Swagger/OpenAPI documentation
- E2E testing with Playwright

## Prerequisites

- .NET 9 SDK
- Node.js 18+
- PostgreSQL
- Auth0 account

## Getting Started

### Backend

```sh
cd ECommerce
dotnet restore
# Update appsettings.json with your PostgreSQL connection string and Auth0 settings
dotnet ef database update
dotnet run
```

Swagger UI is available at the root URL in development mode.

### Frontend

```sh
cd frontend
npm install
# Copy .env.example to .env and configure Auth0 + API URL
npm run dev
```

### Tests

```sh
npm test              # headless Playwright
npm run test:headed   # headed Playwright
```

## Project Structure

```
ECommerce/
├── ECommerce/           # .NET 9 Web API
│   ├── Controllers/     # Address, Cart, Category, Order, Product, Profile, User
│   ├── Data/            # EF Core DbContext, migrations, seed data
│   ├── Model/           # Entities, DTOs, enums (OrderStatus, PaymentMethod, UserRole)
│   ├── Services/        # Business logic layer
│   └── Authorization/   # Role & resource-based policy handlers
├── frontend/            # React + TypeScript SPA
│   ├── src/
│   │   ├── components/  # UI components (Layout, Landing, shared)
│   │   ├── contexts/    # Cart, Theme, UserProfile providers
│   │   ├── hooks/       # Auth, cart, addresses, orders, etc.
│   │   ├── pages/       # All route pages
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── services/    # API client & service modules
│   │   ├── types/       # TypeScript interfaces
│   │   └── styles/      # Global CSS
│   └── e2e/             # Playwright end-to-end tests
└── landing-page.png     # Landing page preview
```
