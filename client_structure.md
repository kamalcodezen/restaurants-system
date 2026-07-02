# Next.js Client Folder Structure

```
client/
├── app/
│   ├── layout.js                 # Root layout (Tailwind, DaisyUI config)
│   ├── page.js                   # Public landing page (Home)
│   ├── menu/
│   │   └── page.js               # Browse menu and items
│   ├── reserve/
│   │   ├── page.js               # Table booking reservation form
│   │   └── success/
│   │       └── page.js           # Reservation confirmation screen
│   ├── order/
│   │   └── [id]/
│   │       ├── page.js           # Public live order tracker
│   │       └── bill/
│   │           └── page.js       # Customer read-only bill
│   ├── login/
│   │   └── page.js               # Staff login page
│   ├── unauthorized/
│   │   └── page.js               # Access denied page
│   └── dashboard/
│       ├── layout.js             # Sidebar, Navbar, Role guard
│       ├── page.js               # Overview dashboard stats
│       ├── kitchen/
│       │   └── page.js           # Kitchen columns status screen
│       ├── orders/
│       │   ├── page.js           # Admin orders list
│       │   ├── new/
│       │   │   └── page.js       # Place staff-created order
│       │   └── [id]/
│       │       └── page.js       # Order detail and actions
│       ├── tables/
│       │   └── page.js           # Table status grid and settings
│       ├── reservations/
│       │   └── page.js           # Staff reservation list and approval
│       ├── billing/
│       │   ├── page.js           # Bill list overview
│       │   └── [id]/
│       │       └── page.js       # Take payment and receipt view
│       ├── menu/
│       │   └── page.js           # Categories & menu items CRUD
│       ├── staff/
│       │   └── page.js           # Staff list & role management
│       └── settings/
│           └── page.js           # Restaurant settings CRUD
├── components/
│   ├── Sidebar.js                # Sidebar navigation for dashboard
│   ├── Navbar.js                 # Top bar navigation
│   ├── OrderCard.js              # Order details component
│   └── TableGrid.js              # Seating map status widget
├── lib/
│   ├── api.js                    # Fetch client methods
│   └── auth.js                   # Better Auth setup
├── package.json
└── tailwind.config.js
```
