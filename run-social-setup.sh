#!/bin/bash
echo "🚀 Setting up Social Wall Feature..."
echo ""

# Step 1: Generate Prisma client
echo "📦 Step 1: Generating Prisma client..."
npx prisma generate || exit 1

# Step 2: Run migrations
echo ""
echo "🗄️  Step 2: Running database migrations..."
npx prisma migrate dev --name add-social-chat || exit 1

# Step 3: Seed channels
echo ""
echo "🌱 Step 3: Seeding default channels..."
docker exec -i zwickly-local-merged-db-1 psql -U postgres -d app < prisma/seed_channels.sql || {
  echo "⚠️  Docker method failed, trying direct psql..."
  psql $DATABASE_URL < prisma/seed_channels.sql
}

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:8080/social"
echo "3. Start chatting!"
