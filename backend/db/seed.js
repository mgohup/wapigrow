const bcrypt   = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db       = require('./index');

async function seedDB() {
  // ── Users ──────────────────────────────────────────────────────────
  const adminExists = await db.users.findOne({ email: 'admin@wapigrow.com' });
  if (!adminExists) {
    await db.users.insert([
      { _id: uuid(), name: 'Ahmed Hassan',  email: 'admin@wapigrow.com',  password: await bcrypt.hash('admin123',  10), role: 'admin', avatar: 'AH', createdAt: new Date() },
      { _id: uuid(), name: 'Nada Mostafa',  email: 'nada@wapigrow.com',   password: await bcrypt.hash('agent123',  10), role: 'agent', avatar: 'NM', createdAt: new Date() },
      { _id: uuid(), name: 'Khaled Amin',   email: 'khaled@wapigrow.com', password: await bcrypt.hash('agent123',  10), role: 'agent', avatar: 'KA', createdAt: new Date() },
    ]);
    console.log('  ✔ users seeded');
  }

  // ── Contacts ───────────────────────────────────────────────────────
  if (await db.contacts.count({}) === 0) {
    const names = ['Sara Ahmed','Mohamed Karim','Layla Nour','Amr Radwan','Hana Farouq','Omar Sayed','Rania Hassan','Tariq Ali','Dina Mostafa','Yusuf Ibrahim'];
    const tags  = ['VIP','New','Loyal','At Risk','Inactive'];
    await db.contacts.insert(names.map((name, i) => ({
      _id: uuid(), name,
      phone:  `+966${String(500000000 + i * 11111111)}`,
      email:  name.toLowerCase().replace(' ', '.') + '@example.com',
      tag:    tags[i % tags.length],
      status: i < 8 ? 'active' : 'inactive',
      orders: Math.floor(Math.random() * 12),
      revenue: parseFloat((Math.random() * 1200).toFixed(2)),
      lastPurchase: new Date(Date.now() - Math.random() * 30 * 86400000),
      createdAt: new Date(),
    })));
    console.log('  ✔ contacts seeded');
  }

  // ── Campaigns ──────────────────────────────────────────────────────
  if (await db.campaigns.count({}) === 0) {
    await db.campaigns.insert([
      { _id: uuid(), name: 'Eid Sale Blast 🎉',   status: 'live',      sent: 4200, openRate: 96.2, clicks: 1240, revenue: 8840,  createdAt: new Date(Date.now() - 1*86400000) },
      { _id: uuid(), name: 'New Arrivals Drop 👕', status: 'scheduled', sent: 0,    openRate: 0,    clicks: 0,    revenue: 0,     scheduledAt: new Date(Date.now() + 86400000), createdAt: new Date() },
      { _id: uuid(), name: 'Win-back May 💙',      status: 'completed', sent: 1840, openRate: 89.4, clicks: 342,  revenue: 4150,  createdAt: new Date(Date.now() - 11*86400000) },
      { _id: uuid(), name: 'Flash Sale 24h ⚡',    status: 'completed', sent: 6100, openRate: 97.8, clicks: 2810, revenue: 11280, createdAt: new Date(Date.now() - 16*86400000) },
    ]);
    console.log('  ✔ campaigns seeded');
  }

  // ── Automations ────────────────────────────────────────────────────
  if (await db.automations.count({}) === 0) {
    await db.automations.insert([
      { _id: uuid(), name: 'Abandoned Cart Recovery',   type: 'abandoned_cart', active: true,  revenue30d: 23932.20, revenuePrev: 22539.23, revenueAll: 167253.96, orders30d: 43, convRate: 18.4 },
      { _id: uuid(), name: 'Customer Welcome Series',   type: 'welcome',        active: true,  revenue30d: 8024.11,  revenuePrev: 5409.93,  revenueAll: 97597.94,  orders30d: 7,  convRate: 35.1 },
      { _id: uuid(), name: 'Post-Purchase Retargeting', type: 'upsell',         active: true,  revenue30d: 447.94,   revenuePrev: 2566.74,  revenueAll: 5323.91,   orders30d: 2,  convRate: 8.7  },
      { _id: uuid(), name: 'Browse Abandonment',        type: 'browse',         active: true,  revenue30d: 22805.44, revenuePrev: 16530.86, revenueAll: 119235.96, orders30d: 35, convRate: 12.2 },
      { _id: uuid(), name: 'Customer Win-back',         type: 'winback',        active: true,  revenue30d: 540.52,   revenuePrev: 65.01,    revenueAll: 4669.95,   orders30d: 1,  convRate: 12.0 },
      { _id: uuid(), name: 'Marketing Campaigns',       type: 'campaign',       active: false, revenue30d: 0,        revenuePrev: 0,        revenueAll: 1737.17,   orders30d: 0,  convRate: 0    },
    ]);
    console.log('  ✔ automations seeded');
  }

  // ── Settings ───────────────────────────────────────────────────────
  if (!await db.settings.findOne({ key: 'general' })) {
    await db.settings.insert([
      { key: 'general',   businessName: 'WapiGrow', website: 'https://wapigrow.com', timezone: 'Asia/Riyadh', currency: 'SAR' },
      { key: 'whatsapp',  number: '966509559535', displayName: 'WapiGrow Official', status: 'connected', qualityRating: 'high', messageLimit: 100000, country: 'SA' },
    ]);
    console.log('  ✔ settings seeded');
  }

  console.log('  ✔ database ready\n');
}

module.exports = { seedDB };
