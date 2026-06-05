const router = require('express').Router();
const db     = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (_, res) => {
  try { res.json(await db.automations.find({})); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const a = await db.automations.findOne({ _id: req.params.id });
    if (!a) return res.status(404).json({ error: 'Not found' });
    await db.automations.update({ _id: req.params.id }, { $set: { active: !a.active } });
    res.json(await db.automations.findOne({ _id: req.params.id }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
