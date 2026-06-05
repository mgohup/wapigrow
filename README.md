# WapiGrow v2 — WhatsApp Marketing Platform

> Full-stack Node.js app · Arabic RTL dashboard · REST API · Admin panel · Google Cloud ready

## 📁 Project Structure

```
wapigrow/
│
├── backend/                    ← Node.js + Express API
│   ├── server.js               ← Entry point
│   ├── db/
│   │   ├── index.js            ← NeDB datastores
│   │   └── seed.js             ← Demo data seeder
│   ├── middleware/
│   │   └── auth.js             ← JWT auth + admin guard
│   └── routes/
│       ├── auth.js             ← Login / me / logout
│       ├── dashboard.js        ← KPIs + stats
│       ├── contacts.js         ← Contacts CRUD
│       ├── campaigns.js        ← Campaigns CRUD + send
│       ├── automations.js      ← List + toggle
│       ├── admin.js            ← Users + settings (admin only)
│       └── webhook.js          ← WhatsApp Business API webhook
│
├── frontend/
│   ├── landing/                ← Public marketing site  →  /
│   │   └── index.html
│   ├── dashboard/              ← Arabic RTL app         →  /app
│   │   └── index.html
│   └── admin/                  ← Admin panel            →  /admin
│       ├── index.html
│       └── login.html          →  /admin/login.html
│
├── scripts/
│   └── deploy.sh               ← GCP one-command deploy
│
├── docs/
│   └── api.md                  ← API reference
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Auto CI/CD on push to main
│
├── .env.example                ← Environment variable template
├── .gitignore
└── package.json
```

## 🌐 URLs

| Path | Content |
|------|---------|
| `/` | Landing page (public) |
| `/app` | Arabic RTL dashboard |
| `/admin` | Admin panel |
| `/admin/login.html` | Login page |
| `/health` | Health check JSON |
| `/api/*` | REST API |

## 🚀 Deploy to Your GCP Server (34.10.76.173)

### Step 1 — SSH into your server
```bash
gcloud compute ssh YOUR_INSTANCE_NAME --zone YOUR_ZONE
# or
ssh user@34.10.76.173
```

### Step 2 — Run the deploy script (first time)
```bash
curl -fsSL https://raw.githubusercontent.com/mgohup/wapigrow/main/scripts/deploy.sh | bash
```

### Step 3 — Update after pushing new code
```bash
cd /opt/wapigrow
git pull && npm ci && pm2 restart wapigrow
```

### Auto-deploy via GitHub Actions
Push to `main` branch → auto-deploys via `.github/workflows/deploy.yml`.
Add these secrets to your GitHub repo Settings → Secrets:
- `GCP_SA_KEY` — Google Cloud service account JSON key
- `GCE_INSTANCE_NAME` — your VM name
- `GCE_ZONE` — e.g. `us-central1-a`
- `GCE_SSH_KEY` — SSH private key

## 🔧 Local Development

```bash
git clone https://github.com/mgohup/wapigrow.git
cd wapigrow
npm install
cp .env.example .env   # edit as needed
npm run dev
```

Open: http://localhost:3000

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wapigrow.com | admin123 |
| Agent | nada@wapigrow.com | agent123 |

> ⚠️ Change these immediately in production via `/admin`

## 🔌 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | `{email, password}` | Get JWT token |
| GET | `/api/auth/me` | — | Current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/kpis` | Platform KPIs |
| GET | `/api/dashboard/automations-revenue` | Revenue by automation |
| GET | `/api/dashboard/recent-campaigns` | Last 5 campaigns |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List (supports `?search=&tag=&status=&limit=&skip=`) |
| GET | `/api/contacts/:id` | Single contact |
| POST | `/api/contacts` | Create |
| PUT | `/api/contacts/:id` | Update |
| DELETE | `/api/contacts/:id` | Delete |

### Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List all |
| POST | `/api/campaigns` | Create |
| PUT | `/api/campaigns/:id` | Update |
| DELETE | `/api/campaigns/:id` | Delete |
| POST | `/api/campaigns/:id/send` | Send campaign |

### Automations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/automations` | List all |
| PUT | `/api/automations/:id/toggle` | Toggle active/inactive |

### Admin (admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/overview` | Platform stats |
| GET | `/api/admin/users` | All users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/settings` | All settings |
| PUT | `/api/admin/settings/:key` | Update setting |

### WhatsApp Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhook` | Meta verification challenge |
| POST | `/api/webhook` | Incoming messages/events |

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 4
- **Database**: NeDB (embedded JSON, no setup needed → swap to MongoDB later)
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **Frontend**: Vanilla JS, Tailwind CSS, React (landing)
- **Process manager**: PM2
- **Reverse proxy**: Nginx
- **Hosting**: Google Cloud Compute Engine
- **CI/CD**: GitHub Actions
