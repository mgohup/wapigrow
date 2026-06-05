const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const { authMiddleware } = require('../middleware/auth');

const SECRET  = process.env.JWT_SECRET || 'wapigrow-dev-secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar };
    const token   = jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

    res.json({ token, user: payload });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const user = await db.users.findOne({ _id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// POST /api/auth/logout  (client just discards token; server-side noop)
router.post('/logout', authMiddleware, (_, res) => res.json({ success: true }));

module.exports = router;
