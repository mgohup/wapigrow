const router = require('express').Router();
const db     = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/dashboard/kpis
router.get('/kpis', async (req, res) => {
  try {
    const [contacts, campaigns, automations] = await Promise.all([
      db.contacts.count({}),
      db.campaigns.find({}),
      db.automations.find({}),
    ]);
    const totalRevenue  = automations.reduce((s, a) => s + (a.revenueAll  || 0), 0)
                        + campaigns.reduce((s, c)   => s + (c.revenue     || 0), 0);
    const revenue30d    = automations.reduce((s, a) => s + (a.revenue30d  || 0), 0);
    res.json({
      contacts,
      totalRevenue:       totalRevenue.toFixed(2),
      revenue30d:         revenue30d.toFixed(2),
      campaignRevenue:    campaigns.reduce((s, c) => s + (c.revenue || 0), 0).toFixed(2),
      liveCampaigns:      campaigns.filter(c => c.status === 'live').length,
      activeAutomations:  automations.filter(a => a.active).length,
      messagesSent:       24812,
      openRate:           97.4,
      avgOrderValue:      526,
      attributedOrders:   752,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/dashboard/automations-revenue
router.get('/automations-revenue', async (_, res) => {
  try { res.json(await db.automations.find({})); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/dashboard/recent-campaigns
router.get('/recent-campaigns', async (_, res) => {
  try {
    const camps = await db.campaigns.find({});
    camps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(camps.slice(0, 5));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
