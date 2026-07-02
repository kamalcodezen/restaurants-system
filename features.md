# Restaurant Management System - Features & Specifications

## 1. User Roles & Permission Matrix
The system has four roles. Three staff roles live in the `staff` collection. Customers are public, unauthenticated users.

| Feature / Page | Customer | Kitchen | Waiter | Admin |
|---|---|---|---|---|
| View Menu / Book Table | Yes | No | No | No |
| Track Order / Bill | Yes | No | No | No |
| Dashboard Home / Stats | No | No | Yes | Yes |
| Kitchen Queue | No | Yes | Yes | Yes |
| Table Management | No | No | Yes | Yes |
| Create / Edit Orders | No | No | Yes | Yes |
| Reservation Management | No | No | Yes | Yes |
| Billing & Payments | No | No | Yes | Yes |
| Menu & Category CRUD | No | No | No | Yes |
| Staff Management | No | No | No | Yes |
| System Settings | No | No | No | Yes |

## 2. Page List (`client/app/`)

### Customer-Facing pages (Public)
- `/` - Home Page (hero, highlights, links)
- `/menu` - Browse menu categories and items
- `/reserve` - Table reservation booking form
- `/order/[id]` - Active order tracker (timeline)
- `/order/[id]/bill` - Read-only bill summary

### Staff Auth Pages
- `/login` - Staff email/password login
- `/unauthorized` - Access denied page

### Dashboard Pages (`/dashboard/*`)
- `/dashboard` - Overview statistics (revenue, open orders, tables occupancy)
- `/dashboard/kitchen` - Kitchen columns (`pending`, `preparing`, `ready`) with quick status controls
- `/dashboard/orders` - List of all orders, filterable by table/status
- `/dashboard/orders/new` - Place new order (walk-in/table seating)
- `/dashboard/orders/[id]` - Order details and item edits (before preparing status)
- `/dashboard/tables` - Table status grid and table details editor
- `/dashboard/reservations` - View and manage guest reservations
- `/dashboard/billing` - Unpaid and paid bills overview
- `/dashboard/billing/[id]` - Take payment (cash/card flag) and printable receipt view
- `/dashboard/menu` - Admin categories and items management
- `/dashboard/staff` - Admin user manager (add/edit staff, assign roles)
- `/dashboard/settings` - Admin restaurant options (name, tax rate)

## 3. Main Flows

### Dine-In Order Flow
1. Customer/staff selects free table.
2. Order items added -> order status is `pending`, table status is `occupied`.
3. Kitchen moves status: `pending` -> `preparing` -> `ready`.
4. Waiter serves order -> moves status to `served`.
5. Bill is generated based on current items.
6. Cashier/waiter marks bill paid -> order status is `billed`, table status becomes `free`.

### Reservation Flow
1. Guest submits reservation request on `/reserve` -> status is `pending`.
2. Admin approves request on `/dashboard/reservations`, assigns free table -> status is `confirmed`, table is `reserved`.
3. Guest arrives -> admin marks guest as `seated`, table becomes `occupied`.
4. Waiter opens order for the table.
5. Order/bill complete -> reservation status is `completed`, table is `free`.

## 4. MongoDB Collection Specifications (No Schema Files)

### `menuCategories`
- `_id`: ObjectId
- `name`: String
- `slug`: String (unique URL)
- `sortOrder`: Number
- `active`: Boolean

### `menuItems`
- `_id`: ObjectId
- `categoryId`: ObjectId (FK)
- `name`: String
- `price`: Number
- `description`: String (optional)
- `available`: Boolean

### `tables`
- `_id`: ObjectId
- `number`: Number (unique)
- `capacity`: Number
- `status`: String (`free`, `occupied`, `reserved`)
- `location`: String (optional, e.g. "Terrace")

### `orders`
- `_id`: ObjectId
- `orderNumber`: String (unique sequential, e.g., `ORD-YYYYMMDD-XXX`)
- `type`: String (`dine-in`, `takeaway`)
- `tableId`: ObjectId (optional)
- `items`: Array of objects:
  - `menuItemId`: ObjectId
  - `name`: String
  - `price`: Number (snapshot)
  - `qty`: Number
  - `lineTotal`: Number
- `subtotal`: Number
- `total`: Number
- `status`: String (`pending`, `preparing`, `ready`, `served`, `billed`)
- `staffId`: ObjectId (optional, waiter who took order)
- `createdAt`: Date

### `reservations`
- `_id`: ObjectId
- `reservationNumber`: String (unique sequential)
- `customerName`: String
- `phone`: String
- `partySize`: Number
- `tableId`: ObjectId (optional)
- `dateTime`: Date
- `status`: String (`pending`, `confirmed`, `seated`, `completed`, `cancelled`)
- `createdAt`: Date

### `bills`
- `_id`: ObjectId
- `billNumber`: String (unique sequential)
- `orderId`: ObjectId (FK)
- `lineItems`: Array (snapshot of order items)
- `subtotal`: Number
- `taxRate`: Number (%)
- `tax`: Number (computed)
- `total`: Number
- `paid`: Boolean
- `paymentMethod`: String (`cash`, `card`)
- `paidAt`: Date

### `staff`
- `_id`: ObjectId
- `userId`: String (Better Auth UID, unique)
- `name`: String
- `email`: String (unique)
- `role`: String (`admin`, `waiter`, `kitchen`)
- `active`: Boolean
