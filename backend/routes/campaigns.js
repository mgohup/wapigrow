const router       = require('express').Router();
const { v4: uuid } = require('uuid');
const db           = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const list = await db.campaigns.find(status ? { status } : {});
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  const c = await db.campaigns.findOne({ _id: req.params.id });
  c ? res.json(c) : res.status(404).json({ error: 'Not found' });
});

router.post('/', async (req, res) => {
  try {
    const { name, message, scheduledAt, audience } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
    const c = await db.campaigns.insert({
      _id: uuid(), name, message, audience: audience || 'all',
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt || null,
      sent: 0, openRate: 0, clicks: 0, revenue: 0, createdAt: new Date(),
    });
    res.status(201).json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    await db.campaigns.update({ _id: req.params.id }, { $set: { ...req.body, updatedAt: new Date() } });
    res.json(await db.campaigns.findOne({ _id: req.params.id }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.campaigns.remove({ _id: req.params.id }, {});
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Simulate send
router.post('/:id/send', async (req, res) => {
  try {
    const count = await db.contacts.count({ status: 'active' });
    await db.campaigns.update({ _id: req.params.id }, {
      $set: { status: 'live', sent: count, openRate: +(94 + Math.random() * 4).toFixed(1), updatedAt: new Date() }
    });
    res.json(await db.campaigns.findOne({ _id: req.params.id }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
