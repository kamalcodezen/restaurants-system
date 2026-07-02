# Restaurant Management System - Architecture

## Tech Stack
- **Frontend**: Next.js (JavaScript, App Router), Better Auth, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express (Single file: `server/index.js`, No MVC)
- **Database**: MongoDB (Official driver, No Mongoose)

## Directory Structure
```
restaurant-management/
├── server/
│   ├── index.js          # Main Express app and API routes
│   └── package.json
├── client/
│   ├── app/              # Next.js pages and routes
│   ├── components/       # Shared React components
│   └── package.json
├── architecture.md
├── features.md
└── rules.md
```

## System Components

### 1. Customer-Facing UI
- **Home (`/`)**: Hero section, logo, tagline, links to browse menu or book reservations.
- **Menu (`/menu`)**: Browse active menu categories and food items.
- **Reserve Table (`/reserve`)**: Booking form (name, phone, party size, date/time).
- **Order Tracker (`/order/[id]`)**: Live order status timeline.
- **Bill Summary (`/order/[id]/bill`)**: Read-only bill details.

### 2. Admin / Staff Dashboard (`/dashboard`)
- **Dashboard Home (`/dashboard`)**: Daily revenue, pending orders, table count, active reservations.
- **Orders (`/dashboard/orders`)**: Manage active orders. Waiter creates, kitchen views.
- **Kitchen Queue (`/dashboard/kitchen`)**: Dedicated page for kitchen staff to prepare/complete orders.
- **Menu Management (`/dashboard/menu`)**: Admin CRUD for categories and dishes.
- **Table Setup (`/dashboard/tables`)**: Table configurations (seating capacity, free/occupied/reserved).
- **Reservations (`/dashboard/reservations`)**: Accept, assign table, or cancel reservations.
- **Billing (`/dashboard/billing`)**: Generate bill from order and mark paid (cash/card).
- **Staff Management (`/dashboard/staff`)**: Admin CRUD for managing staff users and roles (`admin`, `waiter`, `kitchen`).

### 3. Backend API (`server/index.js`)
- All endpoints live in `server/index.js`.
- Standard API response format: `{ success: true, data: ... }` or `{ success: false, error: ... }`.
- Better Auth session middleware inline for role protection.

### 4. Database Collections
- `menuCategories`: Category list.
- `menuItems`: Category dishes with availability status.
- `tables`: Table details and current availability status.
- `orders`: Food items ordered, status (`pending` -> `preparing` -> `ready` -> `served` -> `billed`).
- `reservations`: Bookings (`pending` -> `confirmed` -> `seated` -> `completed` / `cancelled`).
- `bills`: Invoice snapshots. One bill per order.
- `staff`: Role details (`admin`/`waiter`/`kitchen`) linked to Better Auth user.
- `restaurantSettings`: Global configurations (tax rate, name).
