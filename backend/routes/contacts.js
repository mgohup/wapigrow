const router       = require('express').Router();
const { v4: uuid } = require('uuid');
const db           = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { search, tag, status, limit = 50, skip = 0 } = req.query;
    let list = await db.contacts.find(Object.assign({}, tag && { tag }, status && { status }));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.email?.toLowerCase().includes(s));
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ total: list.length, contacts: list.slice(+skip, +skip + +limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  const c = await db.contacts.findOne({ _id: req.params.id });
  c ? res.json(c) : res.status(404).json({ error: 'Not found' });
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, tag, status } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
    const contact = await db.contacts.insert({ _id: uuid(), name, phone, email: email || '', tag: tag || 'New', status: status || 'active', orders: 0, revenue: 0, createdAt: new Date() });
    res.status(201).json(contact);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, tag, status } = req.body;
    await db.contacts.update({ _id: req.params.id }, { $set: { name, phone, email, tag, status, updatedAt: new Date() } });
    res.json(await db.contacts.findOne({ _id: req.params.id }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.contacts.remove({ _id: req.params.id }, {});
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
