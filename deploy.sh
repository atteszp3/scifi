#!/data/data/com.termux/files/usr/bin/bash

cd ~/storage/shared/space || exit

echo "📦 Módosítások hozzáadása..."
git add .

echo "📝 Commit készítése..."
git commit -m "auto deploy $(date)" || echo "Nincs új változás"

echo "🚀 Feltöltés GitHubra (Netlify ezt figyeli)..."
git push origin main

echo "✅ Kész! Netlify automatikusan frissül."
