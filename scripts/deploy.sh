#!/bin/bash
set -e

# ==============================================================================
# Senior Production Deployment Script
# ==============================================================================

echo "🚀 Starting Production Deployment..."

# Navigate to project directory
PROJECT_DIR="${1:-/home/ubuntu/jaxmart_monorepo}"
cd "$PROJECT_DIR"

echo "📥 Pulling latest changes from Git..."
git fetch origin main
git reset --hard origin/main

echo "🛠️ Building and starting Docker services..."
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "🔄 Running Prisma Database Migrations inside backend container..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo "🩺 Verifying System Health..."
max_retries=10
retry_count=0

until [ $retry_count -ge $max_retries ]
do
    backend_status=$(docker inspect --format='{{json .State.Health.Status}}' jaxmart-backend-prod 2>/dev/null || echo '"unhealthy"')
    web_status=$(docker inspect --format='{{json .State.Health.Status}}' jaxmart-web-prod 2>/dev/null || echo '"unhealthy"')
    
    if [ "$backend_status" == '"healthy"' ] && [ "$web_status" == '"healthy"' ]; then
        echo "✅ Deployment Successful! All services healthy."
        exit 0
    fi

    echo "⏳ Waiting for services to become healthy... ($((retry_count+1))/$max_retries)"
    retry_count=$((retry_count+1))
    sleep 5
done

echo "❌ Deployment Failed! Services failed health check."
echo "📜 Fetching backend logs:"
docker compose -f docker-compose.prod.yml logs --tail=50 backend
echo "📜 Fetching web logs:"
docker compose -f docker-compose.prod.yml logs --tail=50 web
exit 1
