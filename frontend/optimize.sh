#!/bin/bash

# Clear Next.js cache and node_modules cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# Clear npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Reinstall dependencies with optimizations
echo "📦 Reinstalling dependencies..."
npm install --legacy-peer-deps

echo "✅ Performance optimization complete!"
echo "💡 Start dev server with: npm run dev"
