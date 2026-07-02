# Task Management Backlog

## Batches Progress Tracker
- **[x] Batch 1:** System Setup & Authentication (US-1) - **100% Complete**
- **[x] Batch 2:** Menu & Table Management (US-2, US-3) - **100% Complete**
- **[ ] Batch 3:** Ordering & Kitchen Queue (US-4, US-5) - **0% Complete**
- **[ ] Batch 4:** Billing & Reservations (US-6, US-7) - **0% Complete**

---

## User Story 1: System Setup & Authentication (US-1)
**Description:** As staff, I want to log in securely so that I can access roles-based dashboard features.

- [x] **Task 1.1:** Setup Node.js/Express server boilerplate with native MongoDB driver connection.
- [x] **Task 1.2:** Integrate Better Auth client/server routes in Express API.
- [x] **Task 1.3:** Create staff database seed script (default admin user).
- [x] **Task 1.4:** Build Next.js Next client scaffolding (Tailwind, DaisyUI config).
- [x] **Task 1.5:** Create login page (`/login`) and route role-guards (`/dashboard`, `/unauthorized`).
- [x] **Task 1.6:** Implement staff list management UI for admins.

**Acceptance Criteria:**
- Express server runs on PORT and connects to MongoDB database.
- Better Auth handles email/password sessions.
- Inactive staff are rejected at auth.
- Default admin credentials exist and log in successfully.
- Non-staff cannot access `/dashboard`.

---

## User Story 2: Menu & Category Management (US-2)
**Description:** As admin, I want to manage categories and menu items so customers can browse current offerings.

- [x] **Task 2.1:** Implement Menu Categories API (CRUD) & Admin UI (`/dashboard/menu/categories`).
- [x] **Task 2.2:** Implement Menu Items API (CRUD) & Admin UI (`/dashboard/menu`).
- [x] **Task 2.3:** Create public menu viewer page (`/menu`) and search/filter.

**Acceptance Criteria:**
- Admin can create, read, update, delete (CRUD) categories.
- Admin can CRUD menu items (name, description, price, category, available).
- Public menu displays items grouped by category.
- Unavailable items do not show in public menu.

---

## User Story 3: Table Layout & Status (US-3)
**Description:** As waiter, I want to view and manage restaurant tables so I know which seats are free.

- [x] **Task 3.1:** Implement Tables API (CRUD) & Dashboard UI (`/dashboard/tables`).
- [x] **Task 3.2:** Build table availability layout grid showing status (`free`, `occupied`, `reserved`).

**Acceptance Criteria:**
- Staff can add, update table status, and delete tables.
- Table numbers are unique.
- Visual layout grid highlights table state by color (DaisyUI badges/cards).

---

## User Story 4: Ordering (US-4)
**Description:** As waiter/customer, I want to place orders so the kitchen knows what food to prepare.

- [ ] **Task 4.1:** Implement Orders API (Create Order, Get status).
- [ ] **Task 4.2:** Create staff new order page (`/dashboard/orders/new`) with table selection and item picker.
- [ ] **Task 4.3:** Build customer public order tracker (`/order/[id]`) with status timeline.

**Acceptance Criteria:**
- Orders support dine-in (table selection required) or takeaway.
- Selecting table for dine-in changes table status to `occupied`.
- Item prices are snapshotted on order creation.
- Unique daily sequential order number generated (e.g., `ORD-YYYYMMDD-001`).

---

## User Story 5: Kitchen Queue (US-5)
**Description:** As kitchen staff, I want to see and update order preparation steps so I can manage food prep.

- [ ] **Task 5.1:** Build Kitchen Queue Kanban board page (`/dashboard/kitchen`) with columns for `pending`, `preparing`, and `ready`.
- [ ] **Task 5.2:** Implement status transition API endpoint and one-click status buttons.

**Acceptance Criteria:**
- Columns show active orders matching status.
- Single click advances status (`pending` -> `preparing` -> `ready`).
- Kitchen staff can only update status, cannot edit order items.

---

## User Story 6: Billing & Payments (US-6)
**Description:** As cashier, I want to generate invoices and collect payment so the table can be freed for new guests.

- [ ] **Task 6.1:** Implement Bill generation API (calculates subtotal, tax %, total) on status `served`.
- [ ] **Task 6.2:** Create dashboard billing list (`/dashboard/billing`) and pay view (`/dashboard/billing/[id]`).
- [ ] **Task 6.3:** Integrate mark-paid control (cash/card flag) that updates order status to `billed` and sets table `free`.

**Acceptance Criteria:**
- Invoices snapshot items exactly.
- Bill total correctly applies tax rate from system settings.
- Payment updates order status to `billed` and changes linked table status to `free`.

---

## User Story 7: Table Reservations (US-7)
**Description:** As customer, I want to book a table online so that I have a guaranteed seat when I arrive.

- [ ] **Task 7.1:** Create public reservation form (`/reserve`) and success redirection.
- [ ] **Task 7.2:** Build dashboard reservation manager (`/dashboard/reservations`) with accept, assign table, and cancel controls.
- [ ] **Task 7.3:** Implement reservation seated action that marks guest arrived and sets table status to `occupied`.

**Acceptance Criteria:**
- Reservation status starts as `pending`.
- Admin can confirm reservation and assign specific table (capacity checks).
- Confirming reservation sets table status to `reserved` at booking slot time.
- Seating guest changes reservation to `seated` and table to `occupied`.
