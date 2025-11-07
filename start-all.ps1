# Script PowerShell pour démarrer le backend et le frontend

Write-Host "🚀 Démarrage de l'application CheckEasy..." -ForegroundColor Green
Write-Host ""

# Démarrer le serveur backend dans un nouveau terminal
Write-Host "📡 Démarrage du serveur backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run server"

# Attendre 3 secondes pour que le serveur démarre
Start-Sleep -Seconds 3

# Démarrer le frontend dans un nouveau terminal
Write-Host "🎨 Démarrage du frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "✅ Application démarrée !" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "🎨 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour arrêter l'application, fermez les deux terminaux." -ForegroundColor Gray

