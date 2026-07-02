import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { toNodeHandler } from 'better-auth/node';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI env var is missing');
  process.exit(1);
}

const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db();
  console.log('Connected to MongoDB successfully');
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
}

// Better Auth setup
export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: mongoClient
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false // Admin will create staff accounts
  },
  trustedOrigins: [
    process.env.CLIENT_URL || 'http://localhost:3000'
  ]
});

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Mount Better Auth handler BEFORE body-parser middlewares
app.all('/api/auth/*', toNodeHandler(auth));

// Mount express.json AFTER Better Auth handler
app.use(express.json());

// Auth Session Middleware
const requireAuth = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session || !session.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session missing' });
  }

  // Load staff profile to get role and active status
  const staff = await db.collection('staff').findOne({ userId: session.user.id });
  if (!staff) {
    return res.status(403).json({ success: false, error: 'Forbidden: Staff record missing' });
  }

  if (!staff.active) {
    return res.status(403).json({ success: false, error: 'Forbidden: Account inactive' });
  }

  req.user = session.user;
  req.staff = staff;
  next();
};

// Role Guard Middleware Creator
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.staff || !roles.includes(req.staff.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Public Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

// Protected Route to get current staff profile
app.get('/api/staff/me', requireAuth, (req, res) => {
  res.json({ success: true, data: req.staff });
});

// Protected Route to get dashboard statistics
app.get('/api/dashboard/stats', requireAuth, requireRole(['admin', 'waiter']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeOrders = await db.collection('orders').countDocuments({ status: { $ne: 'billed' } });
    const reservationsCount = await db.collection('reservations').countDocuments({
      dateTime: { $gte: today }
    });
    const reservedTables = await db.collection('tables').countDocuments({ status: { $in: ['occupied', 'reserved'] } });

    const billsToday = await db.collection('bills').find({
      paid: true,
      paidAt: { $gte: today }
    }).toArray();
    const revenue = billsToday.reduce((sum, b) => sum + b.total, 0);

    res.json({
      success: true,
      data: {
        activeOrders,
        reservationsCount,
        reservedTables,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Get all staff members
app.get('/api/staff', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const list = await db.collection('staff').find().toArray();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Create new staff member and Better Auth account
app.post('/api/staff', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existing = await db.collection('staff').findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    });

    if (!user || !user.user) {
      throw new Error('Failed to register user in Better Auth');
    }

    const newStaff = {
      userId: user.user.id,
      name,
      email,
      role,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('staff').insertOne(newStaff);
    res.json({ success: true, data: newStaff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Update staff member details
app.patch('/api/staff/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, active } = req.body;

    const staffRecord = await db.collection('staff').findOne({ _id: new ObjectId(id) });
    if (!staffRecord) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }

    if ((role && role !== 'admin') || active === false) {
      if (staffRecord.role === 'admin') {
        const activeAdminsCount = await db.collection('staff').countDocuments({
          role: 'admin',
          active: true
        });
        if (activeAdminsCount <= 1) {
          return res.status(400).json({ success: false, error: 'Cannot demote or deactivate the last active admin' });
        }
      }
    }

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;

    await db.collection('staff').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json({ success: true, data: { ...staffRecord, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all categories
app.get('/api/menu/categories', async (req, res) => {
  try {
    const categories = await db.collection('menuCategories').find().sort({ sortOrder: 1 }).toArray();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Create menu category
app.post('/api/menu/categories', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, slug, sortOrder, active } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'Name and slug are required' });
    }

    const existing = await db.collection('menuCategories').findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Slug must be unique' });
    }

    const newCategory = {
      name,
      slug,
      sortOrder: Number(sortOrder) || 0,
      active: active !== undefined ? active : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('menuCategories').insertOne(newCategory);
    res.json({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Update menu category
app.patch('/api/menu/categories/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, sortOrder, active } = req.body;

    const category = await db.collection('menuCategories').findOne({ _id: new ObjectId(id) });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (slug && slug !== category.slug) {
      const existing = await db.collection('menuCategories').findOne({ slug });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Slug must be unique' });
      }
    }

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);
    if (active !== undefined) updates.active = active;

    await db.collection('menuCategories').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json({ success: true, data: { ...category, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Delete menu category (must check empty first)
app.delete('/api/menu/categories/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const count = await db.collection('menuItems').countDocuments({ categoryId: new ObjectId(id) });
    if (count > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete category containing menu items' });
    }

    const result = await db.collection('menuCategories').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = {};

    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session || !session.user) {
      filter.available = true;
    }

    if (categoryId) {
      filter.categoryId = new ObjectId(categoryId);
    }

    const items = await db.collection('menuItems').find(filter).toArray();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Create menu item
app.post('/api/menu', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { categoryId, name, price, description, available } = req.body;
    if (!categoryId || !name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Category, name, and price are required' });
    }

    const newItem = {
      categoryId: new ObjectId(categoryId),
      name,
      price: Number(price),
      description: description || '',
      available: available !== undefined ? available : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('menuItems').insertOne(newItem);
    res.json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Update menu item
app.patch('/api/menu/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, price, description, available } = req.body;

    const item = await db.collection('menuItems').findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const updates = { updatedAt: new Date() };
    if (categoryId !== undefined) updates.categoryId = new ObjectId(categoryId);
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = description;
    if (available !== undefined) updates.available = available;

    await db.collection('menuItems').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json({ success: true, data: { ...item, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Delete menu item
app.delete('/api/menu/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.collection('menuItems').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await db.collection('tables').find().sort({ number: 1 }).toArray();
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Create table
app.post('/api/tables', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { number, capacity, location, notes } = req.body;
    if (number === undefined || capacity === undefined) {
      return res.status(400).json({ success: false, error: 'Table number and capacity are required' });
    }

    const existing = await db.collection('tables').findOne({ number: Number(number) });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Table number must be unique' });
    }

    const newTable = {
      number: Number(number),
      capacity: Number(capacity),
      status: 'free',
      location: location || '',
      notes: notes || '',
      updatedAt: new Date()
    };

    await db.collection('tables').insertOne(newTable);
    res.json({ success: true, data: newTable });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Waiter and Admin: Update table
app.patch('/api/tables/:id', requireAuth, requireRole(['admin', 'waiter']), async (req, res) => {
  try {
    const { id } = req.params;
    const { number, capacity, status, location, notes } = req.body;

    const table = await db.collection('tables').findOne({ _id: new ObjectId(id) });
    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    if (req.staff.role === 'waiter') {
      if (number !== undefined || capacity !== undefined || location !== undefined || notes !== undefined) {
        return res.status(403).json({ success: false, error: 'Waiters can only update table status' });
      }
    }

    if (number !== undefined && Number(number) !== table.number) {
      const existing = await db.collection('tables').findOne({ number: Number(number) });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Table number must be unique' });
      }
    }

    const updates = { updatedAt: new Date() };
    if (number !== undefined) updates.number = Number(number);
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (status !== undefined) {
      if (!['free', 'occupied', 'reserved'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid table status' });
      }
      updates.status = status;
    }
    if (location !== undefined) updates.location = location;
    if (notes !== undefined) updates.notes = notes;

    await db.collection('tables').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json({ success: true, data: { ...table, ...updates } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin-only: Delete table
app.delete('/api/tables/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.collection('tables').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Seed Function for Settings
const seedSettings = async () => {
  const settingsCount = await db.collection('restaurantSettings').countDocuments();
  if (settingsCount === 0) {
    await db.collection('restaurantSettings').insertOne({
      name: 'Gourmet Haven',
      tagline: 'Delicious Food, Great Times',
      phone: '123-456-7890',
      address: '123 Foodie Street, Flavor Town',
      taxRate: 8.5,
      currency: 'USD',
      openingHours: {
        mon: '11:00-22:00',
        tue: '11:00-22:00',
        wed: '11:00-22:00',
        thu: '11:00-22:00',
        fri: '11:00-23:00',
        sat: '11:00-23:00',
        sun: '12:00-21:00'
      },
      updatedAt: new Date()
    });
    console.log('Default restaurant settings seeded.');
  }
};

// Seed Function for Admin Staff
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@restaurant.com';
    const adminPassword = 'AdminPassword123!';
    const adminName = 'System Admin';

    const existingStaff = await db.collection('staff').findOne({ email: adminEmail });
    if (existingStaff) {
      console.log('Admin staff record already exists.');
      return;
    }

    const user = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName
      }
    });

    if (!user || !user.user) {
      throw new Error('Failed to create Better Auth user');
    }

    const staffRecord = {
      userId: user.user.id,
      name: adminName,
      email: adminEmail,
      role: 'admin',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('staff').insertOne(staffRecord);
    console.log('Admin seeded successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

// Start Server and Seeding
const start = async () => {
  try {
    await seedSettings();
    
    if (process.argv.includes('--seed')) {
      await seedAdmin();
      console.log('Seeding complete. Exiting.');
      process.exit(0);
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
  }
};

start();
