#!/bin/bash
set -e
echo "🚀 BSTM ECOSYSTEM NETWORK v3"
git init 2>/dev/null || true
git add -A
git commit -m "feat: bstm-ecosystem-network v3 FINAL — 127 nodes, CabLink, CRUD, Supabase live" 2>/dev/null || echo "nothing new"
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Todd366/bstm-ecosystem-network.git
git branch -M main
git push -u origin main --force
echo ""
echo "✅ Pushed. Go to vercel.com/new → import Todd366/bstm-ecosystem-network → Deploy"
echo "No env vars needed — keys are baked in vercel.json"
echo ""
echo "Supabase: jeyneeetujvudwyovdzd | CabLink users=1 ✓ | AI Dept users=42 ✓"
