#!/bin/bash
# OpenClaw Next Deployment Script
# Usage: ./deploy.sh [user@host] [remote-path]

set -e

# Configuration
LOCAL_DIST="./dist"
REMOTE_USER="${1:-root}"
REMOTE_HOST="${2:-your-vps-ip}"
REMOTE_PATH="${3:-/opt/openclaw-next}"
SERVICE_NAME="openclaw-next"

echo "🚀 OpenClaw Next Deployment"
echo "============================"
echo "Remote: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo ""

# Build first
echo "📦 Building project..."
npm run build

# Create remote directory
echo "📁 Creating remote directory..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH"

# Sync files
echo "📤 Uploading files..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='workspace' \
  --exclude='docs' \
  --exclude='*.log' \
  ./dist/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/dist/

# Copy package files
rsync -avz package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Copy environment file if exists
if [ -f .env.production ]; then
  rsync -avz .env.production $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/.env
elif [ -f .env ]; then
  rsync -avz .env $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/.env
fi

# Install production dependencies on remote
echo "📥 Installing production dependencies..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm ci --production"

# Setup systemd service
echo "🔧 Setting up systemd service..."
ssh $REMOTE_USER@$REMOTE_HOST "cat > /etc/systemd/system/$SERVICE_NAME.service << 'EOF'
[Unit]
Description=OpenClaw Next - Agentic Gateway Control Panel
After=network.target

[Service]
Type=simple
User=$REMOTE_USER
WorkingDirectory=$REMOTE_PATH
Environment=NODE_ENV=production
EnvironmentFile=$REMOTE_PATH/.env
ExecStart=/usr/bin/node $REMOTE_PATH/dist-cli/cli/index.js serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

# Reload systemd and start service
echo "🔄 Restarting service..."
ssh $REMOTE_USER@$REMOTE_HOST "systemctl daemon-reload && systemctl enable $SERVICE_NAME && systemctl restart $SERVICE_NAME"

echo ""
echo "✅ Deployment complete!"
echo "Service status:"
ssh $REMOTE_USER@$REMOTE_HOST "systemctl status $SERVICE_NAME --no-pager"
