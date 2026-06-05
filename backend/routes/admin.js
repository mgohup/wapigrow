const router       = require('express').Router();
const bcrypt       = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db           = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

const safeUser = u => { const { password, ...s } = u; return s; };

// Overview
router.get('/overview', async (_, res) => {
  try {
    const [users, contacts, campaigns, automations] = await Promise.all([
      db.users.find({}), db.contacts.count({}),
      db.campaigns.find({}), db.automations.find({}),
    ]);
    const totalRevenue = automations.reduce((s,a)=>s+(a.revenueAll||0),0)
                       + campaigns.reduce((s,c)=>s+(c.revenue||0),0);
    res.json({
      totalUsers:        users.length,
      totalContacts:     contacts,
      totalCampaigns:    campaigns.length,
      totalAutomations:  automations.length,
      activeAutomations: automations.filter(a=>a.active).length,
      totalRevenue:      totalRevenue.toFixed(2),
      recentUsers:       users.map(safeUser).slice(-5),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Users CRUD
router.get('/users', async (_, res) => {
  const users = await db.users.find({});
  res.json(users.map(safeUser));
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
    if (await db.users.findOne({ email })) return res.status(400).json({ error: 'Email already in use' });
    const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const user = await db.users.insert({ _id: uuid(), name, email, password: await bcrypt.hash(password,10), role: role||'agent', avatar: initials, createdAt: new Date() });
    res.status(201).json(safeUser(user));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const update = { name, email, role, updatedAt: new Date() };
    if (password) update.password = await bcrypt.hash(password, 10);
    await db.users.update({ _id: req.params.id }, { $set: update });
    res.json(safeUser(await db.users.findOne({ _id: req.params.id })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await db.users.remove({ _id: req.params.id }, {});
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Settings
router.get('/settings', async (_, res) => {
  try {
    const rows = await db.settings.find({});
    res.json(rows.reduce((m, r) => { m[r.key] = r; return m; }, {}));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const existing = await db.settings.findOne({ key: req.params.key });
    if (existing) await db.settings.update({ key: req.params.key }, { $set: { ...req.body, updatedAt: new Date() } });
    else          await db.settings.insert({ ...req.body, key: req.params.key, createdAt: new Date() });
    res.json(await db.settings.findOne({ key: req.params.key }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
