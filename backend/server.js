/**
 * WapiGrow — Main Server
 * Entry point for the Express API + static file server
 */

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { seedDB } = require('./db/seed');

// ── Route imports ─────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth');
const dashboardRoutes   = require('./routes/dashboard');
const contactsRoutes    = require('./routes/contacts');
const campaignsRoutes   = require('./routes/campaigns');
const automationsRoutes = require('./routes/automations');
const adminRoutes       = require('./routes/admin');
const webhookRoutes     = require('./routes/webhook');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (frontend) ───────────────────────────────────────────
// Serve landing page at root
app.use('/',        express.static(path.join(__dirname, '../frontend/landing')));
// Dashboard app
app.use('/app',     express.static(path.join(__dirname, '../frontend/dashboard')));
// Admin panel
app.use('/admin',   express.static(path.join(__dirname, '../frontend/admin')));

// ── API routes ────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/contacts',    contactsRoutes);
app.use('/api/campaigns',   campaignsRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/webhook',     webhookRoutes);

// ── SPA fallbacks ─────────────────────────────────────────────────────
app.get('/app/*',   (_, res) => res.sendFile(path.join(__dirname, '../frontend/dashboard/index.html')));
app.get('/admin/*', (_, res) => res.sendFile(path.join(__dirname, '../frontend/admin/index.html')));
app.get('*',        (_, res) => res.sendFile(path.join(__dirname, '../frontend/landing/index.html')));

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', version: '2.0.0', env: process.env.NODE_ENV }));

// ── Boot ──────────────────────────────────────────────────────────────
seedDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🟢 WapiGrow v2 running on port ${PORT}`);
    console.log(`   Landing   → http://localhost:${PORT}/`);
    console.log(`   Dashboard → http://localhost:${PORT}/app`);
    console.log(`   Admin     → http://localhost:${PORT}/admin`);
    console.log(`   API       → http://localhost:${PORT}/api`);
    console.log(`   Health    → http://localhost:${PORT}/health\n`);
  });
}).catch(err => {
  console.error('❌ Boot failed:', err);
  process.exit(1);
});
