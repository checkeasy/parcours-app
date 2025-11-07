#!/bin/bash

# Script pour tester rapidement l'autocomplétion Google Maps

echo "🧪 Test de l'autocomplétion Google Maps"
echo "========================================"
echo ""

# Vérifier que la clé API est configurée
if [ -f ".env.local" ]; then
    if grep -q "VITE_GOOGLE_MAPS_API_KEY=AIzaSy" .env.local; then
        echo "✅ Clé API Google Maps trouvée dans .env.local"
    else
        echo "❌ Clé API Google Maps non trouvée dans .env.local"
        echo "   Ajoutez : VITE_GOOGLE_MAPS_API_KEY=votre_clé_api"
        exit 1
    fi
else
    echo "❌ Fichier .env.local non trouvé"
    echo "   Créez le fichier et ajoutez : VITE_GOOGLE_MAPS_API_KEY=votre_clé_api"
    exit 1
fi

echo ""
echo "🚀 Lancement des tests Playwright..."
echo ""

# Lancer les tests
npm test

echo ""
echo "📊 Pour voir le rapport détaillé :"
echo "   npx playwright show-report"
echo ""
echo "🎯 Pour tester manuellement :"
echo "   1. npm run start"
echo "   2. Ouvrez http://localhost:8080"
echo "   3. Suivez le guide dans tests/manual-test-guide.md"
echo ""

