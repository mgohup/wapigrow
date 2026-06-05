#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# deploy.sh — Run on the GCP VM to set up or update WapiGrow
# Usage:  bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────
set -e

APP_DIR="/opt/wapigrow"
REPO="https://github.com/mgohup/wapigrow.git"
NODE_PORT=3000

echo "🚀 WapiGrow Deploy Script"
echo "=========================="

# 1. Install system deps (first run only)
if ! command -v node &>/dev/null; then
  echo "→ Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 &>/dev/null; then
  echo "→ Installing PM2..."
  sudo npm install -g pm2
fi

if ! command -v nginx &>/dev/null; then
  echo "→ Installing Nginx..."
  sudo apt-get install -y nginx
fi

# 2. Clone or pull latest code
if [ -d "$APP_DIR/.git" ]; then
  echo "→ Pulling latest code..."
  cd $APP_DIR && git pull origin main
else
  echo "→ Cloning repository..."
  sudo git clone $REPO $APP_DIR
  cd $APP_DIR
fi

# 3. Install npm deps
echo "→ Installing dependencies..."
cd $APP_DIR && sudo npm ci --omit=dev

# 4. Create .env if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
  echo "→ Creating .env from template..."
  cp $APP_DIR/.env.example $APP_DIR/.env
  # Generate a random JWT secret
  JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s/change-this-to-a-strong-random-secret-in-production/$JWT_SECRET/" $APP_DIR/.env
  echo "⚠️  Edit $APP_DIR/.env to set your WhatsApp API keys!"
fi

# 5. Start / restart with PM2
echo "→ Starting app with PM2..."
cd $APP_DIR
pm2 describe wapigrow &>/dev/null \
  && pm2 restart wapigrow \
  || pm2 start backend/server.js --name wapigrow --env production \
       --log /var/log/wapigrow.log \
       --error /var/log/wapigrow-error.log
pm2 save
pm2 startup --no-daemon || true

# 6. Configure Nginx reverse proxy
NGINX_CONF="/etc/nginx/sites-available/wapigrow"
if [ ! -f "$NGINX_CONF" ]; then
  echo "→ Configuring Nginx..."
  sudo tee $NGINX_CONF > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    # Gzip
    gzip on;
    gzip_types text/html text/css application/javascript application/json;

    # Proxy to Node
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
  sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/wapigrow
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx
fi

echo ""
echo "✅ Deploy complete!"
echo "   App:     http://$(curl -s ifconfig.me)/"
echo "   App:     http://$(curl -s ifconfig.me)/app"
echo "   Admin:   http://$(curl -s ifconfig.me)/admin"
echo "   Health:  http://$(curl -s ifconfig.me)/health"
echo ""
echo "🔑 Default login: admin@wapigrow.com / admin123"
echo "   (Change this immediately in production!)"
