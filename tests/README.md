# Tests Playwright - Google Maps Autocomplete

Ce dossier contient les tests end-to-end (E2E) pour vérifier le bon fonctionnement de l'autocomplétion Google Maps dans l'application.

## 📋 Prérequis

1. **Clé API Google Maps configurée** dans `.env.local` :
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=votre_clé_api_ici
   ```

2. **Playwright installé** :
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

## 🚀 Lancer les tests

### Tous les tests
```bash
npm test
```

### Mode UI interactif (recommandé pour le développement)
```bash
npm run test:ui
```

### Mode headed (voir le navigateur)
```bash
npm run test:headed
```

### Mode debug (pas à pas)
```bash
npm run test:debug
```

### Un test spécifique
```bash
npx playwright test google-maps-autocomplete.spec.ts
```

## 📝 Tests disponibles

### 1. **Chargement de l'API Google Maps**
Vérifie que l'API Google Maps est correctement chargée et accessible.

### 2. **Affichage du champ d'adresse**
Vérifie que le dialogue d'ajout de logement s'ouvre et affiche le champ d'adresse.

### 3. **Saisie avec autocomplétion**
Vérifie que la saisie d'une adresse déclenche l'affichage des suggestions Google Maps.

### 4. **Sélection d'une adresse**
Vérifie qu'on peut sélectionner une adresse depuis les suggestions et que la valeur est correctement mise à jour.

### 5. **Gestion des erreurs**
Vérifie qu'il n'y a pas d'erreur `ApiNotActivatedMapError` ou autre erreur Google Maps.

### 6. **Configuration de la clé API**
Vérifie que la clé API est bien configurée dans l'environnement.

### 7. **Chargement du script**
Vérifie que le script Google Maps est chargé avec la bibliothèque `places`.

## 🔍 Résultats des tests

Après l'exécution, un rapport HTML est généré :
```bash
npx playwright show-report
```

## 🐛 Debugging

Si un test échoue :

1. **Voir les screenshots** : Les captures d'écran des échecs sont dans `test-results/`
2. **Voir les traces** : Ouvrir le rapport HTML pour voir les traces détaillées
3. **Mode debug** : Utiliser `npm run test:debug` pour exécuter pas à pas

## 📊 Structure des tests

```
tests/
├── google-maps-autocomplete.spec.ts  # Tests de l'autocomplétion Google Maps
└── README.md                          # Ce fichier
```

## ⚙️ Configuration

La configuration Playwright se trouve dans `playwright.config.ts` à la racine du projet.

### Points importants :
- **baseURL** : `http://localhost:8080`
- **webServer** : Lance automatiquement `npm run start` avant les tests
- **timeout** : 120 secondes pour le démarrage du serveur
- **retries** : 2 tentatives sur CI, 0 en local

## 🎯 Cas d'usage

### Vérifier que Google Maps fonctionne après un déploiement
```bash
npm test
```

### Développer un nouveau test
```bash
npm run test:ui
```

### Déboguer un test qui échoue
```bash
npm run test:debug -- --grep "nom du test"
```

## 📚 Documentation

- [Playwright Documentation](https://playwright.dev)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Places Autocomplete](https://developers.google.com/maps/documentation/javascript/place-autocomplete)

## ✅ Checklist avant de pousser du code

- [ ] Tous les tests passent : `npm test`
- [ ] Pas d'erreur dans la console du navigateur
- [ ] L'autocomplétion fonctionne correctement
- [ ] La clé API est configurée (mais pas commitée !)

