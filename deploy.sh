#!/bin/bash
# Deploy script for MariosPizza
# Place this in /opt/stacks/mariospizza/deploy.sh
# Run with: bash /opt/stacks/mariospizza/deploy.sh

set -e

DEPLOY_PATH="/opt/stacks/mariospizza"

echo "📦 Starting MariosPizza deployment..."

# Clone or update
if [ -d "$DEPLOY_PATH" ]; then
    echo "📥 Updating existing repository..."
    cd "$DEPLOY_PATH"
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
else
    echo "🔗 Cloning repository..."
    mkdir -p "$(dirname $DEPLOY_PATH)"
    git clone https://github.com/marioeduardo/mariospizza.git "$DEPLOY_PATH"
    cd "$DEPLOY_PATH"
fi

echo "🏗️ Building Docker image..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$DEPLOY_PATH:/workdir" -w /workdir docker:cli compose build

echo "🚀 Starting container..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$DEPLOY_PATH:/workdir" -w /workdir docker:cli compose up -d

echo "⏳ Waiting for application to start..."
sleep 5

echo "✅ Checking application health..."
if curl -f http://localhost:3000 2>/dev/null; then
    echo "✅ Application is healthy and responding!"
else
    echo "⚠️ Application started but may need more time to initialize"
    echo "   Check logs with: docker logs mariospizza_app"
fi

echo "🔄 Reloading Caddy reverse proxy..."
docker exec caddy caddy reload -c /etc/caddy/Caddyfile 2>/dev/null || echo "⚠️ Caddy reload skipped"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Access your application at: https://pizza.marioeduardo.com.br"
echo ""
echo "📊 View logs:"
echo "   docker logs mariospizza_app -f"
echo ""
echo "🛑 To stop:"
echo "   cd $DEPLOY_PATH && docker compose down"
