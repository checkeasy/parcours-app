#!/bin/bash

# Script bash pour démarrer le backend et le frontend

echo "🚀 Démarrage de l'application CheckEasy..."
echo ""

# Démarrer le serveur backend en arrière-plan
echo "📡 Démarrage du serveur backend..."
npm run server &
BACKEND_PID=$!

# Attendre 3 secondes pour que le serveur démarre
sleep 3

# Démarrer le frontend en arrière-plan
echo "🎨 Démarrage du frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application démarrée !"
echo ""
echo "📡 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Pour arrêter l'application, exécutez:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Ou appuyez sur Ctrl+C"

# Attendre que l'utilisateur arrête les processus
wait

