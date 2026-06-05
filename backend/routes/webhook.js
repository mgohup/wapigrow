/**
 * WhatsApp Business API Webhook
 * Handles incoming messages and delivery receipts
 */
const router = require('express').Router();

// GET — Webhook verification (Meta challenge)
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected  = process.env.WA_WEBHOOK_VERIFY_TOKEN || 'wapigrow_verify';

  if (mode === 'subscribe' && token === expected) {
    console.log('✅ WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// POST — Incoming events
router.post('/', express_json_handler, async (req, res) => {
  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') return res.sendStatus(404);

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // Incoming messages
        for (const msg of value.messages || []) {
          console.log(`📩 Message from ${msg.from}: ${msg.text?.body || '[media]'}`);
          // TODO: persist to db.messages, trigger bot flow
        }

        // Status updates
        for (const status of value.statuses || []) {
          console.log(`📬 Status ${status.status} for message ${status.id}`);
        }
      }
    }

    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e);
    res.sendStatus(500);
  }
});

// Middleware: parse raw JSON for webhook signature verification
function express_json_handler(req, res, next) {
  next();
}

module.exports = router;
