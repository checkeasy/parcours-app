# CheckEasy - Parcours App

Application de gestion de parcours de nettoyage et d'arrivée voyageur pour CheckEasy.

## ��� Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

Copier `.env.example` vers `.env` et configurer les variables :

```env
SCRAPING_SERVICE_URL=https://scraping-airbnb-production.up.railway.app
BUBBLE_API_URL=https://checkeasy.bubbleapps.io/version-test/api/1.1/wf
BUBBLE_API_KEY=your_api_key
```

### Lancement

**Option 1 : Script automatique (Windows)**
```bash
.\start-all.ps1
```

**Option 2 : Script automatique (Linux/Mac)**
```bash
./start-all.sh
```

**Option 3 : Manuel**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

## ��� Endpoints

- **Frontend** : http://localhost:8080
- **Backend** : http://localhost:3001
- **Health Check** : http://localhost:3001/health

## ���️ Architecture

- **Frontend** : React + TypeScript + Vite
- **Backend** : Express.js + TypeScript
- **Scraping** : Service Python externe (Railway)
- **Webhook** : Bubble.io

## ��� Structure

```
├── src/              # Frontend React
├── server/           # Backend Express
│   ├── routes/       # Routes API
│   ├── services/     # Services métier
│   └── config/       # Configuration
└── public/           # Assets statiques
```
