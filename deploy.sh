#!/data/data/com.termux/files/usr/bin/bash

cd ~/storage/shared/Space || exit

echo "📦 Fájlok hozzáadása..."
git add .

echo "📝 Commit készítése..."
git commit -m "auto deploy $(date)" || echo "Nincs új változás"

echo "🚀 Push Netlify/GitHub felé..."
git push origin main

echo "✅ Kész! Netlify automatikusan deployol."
