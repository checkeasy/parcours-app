# 🔄 Nouveau Workflow Webhook en 2 Étapes

## 📋 Problème résolu

Le payload du webhook était trop volumineux à cause des images en base64, ce qui causait :
- Des timeouts lors de l'envoi
- Des erreurs 500 de Bubble.io
- Une mauvaise expérience utilisateur

## ✨ Solution : Workflow en 2 étapes

Au lieu d'envoyer tout en une seule requête, le webhook est maintenant divisé en 2 étapes :

### Étape 1 : Créer le logement et le parcours (SANS les pièces)

**Endpoint :**
- **Test :** `https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour`
- **Production :** `https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour`

**Payload envoyé :**
```json
{
  "conciergerieID": "...",
  "userID": "...",
  "nom": "Appartement Paris",
  "adresse": "15 Rue de la Paix, 75002 Paris",
  "airbnbLink": "https://www.airbnb.fr/rooms/12345678",
  "parcoursType": "menage",
  "nomParcours": "Ménage Check Easy",
  "modele": {
    "type": "predefined",
    "value": "menage"
  }
  // PAS de pièces dans cette requête
}
```

**Réponse attendue de Bubble :**
```json
{
  "status": "success",
  "response": {
    "logementID": "1762186316823x781362145695184000",
    "parcourID": "1762186316907x354038844660805570"
  }
}
```

### Étape 2 : Créer chaque pièce individuellement

Pour chaque pièce du tableau `pieces`, une requête séparée est envoyée.

**Endpoint :**
- **Test :** `https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createpiece/initialize`
- **Production :** `https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createpiece/initialize`

**Payload pour chaque pièce :**
```json
{
  "logementID": "1762186316823x781362145695184000",
  "parcourID": "1762186316907x354038844660805570",
  "nom": "Cuisine",
  "quantite": 1,
  "tasks": [
    {
      "id": "m-cuisine-1",
      "emoji": "🗑️",
      "titre": "Vider les poubelles",
      "description": "Remplacer sac ; nettoyer couvercle & bac.",
      "photoObligatoire": true
    },
    ...
  ],
  "photos": [
    {
      "url": "https://example.com/cuisine1.jpg",
      "type": "url"
    },
    {
      "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
      "type": "base64"
    }
  ]
}
```

## 📊 Logs du serveur

Le serveur affiche maintenant des logs détaillés pour chaque étape :

```
📨 Received webhook request for logement: Appartement Paris
   - Test mode: YES
   - ConciergerieID: 1730741276842x778024514623373300
   - UserID: 1730741188020x554510837711264200

📤 ÉTAPE 1/2 : Création du logement et du parcours...
   Endpoint: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour
   Logement: Appartement Paris
✅ Logement et parcours créés avec succès
   - LogementID: 1762186316823x781362145695184000
   - ParcourID: 1762186316907x354038844660805570

📤 ÉTAPE 2/2 : Création des pièces (3 pièces)...
   Endpoint: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createpiece/initialize

   📦 Pièce 1/3: Cuisine (quantité: 1)
      - Tâches: 6
      - Photos: 2
      ✅ Pièce créée avec succès

   📦 Pièce 2/3: Chambre (quantité: 2)
      - Tâches: 4
      - Photos: 1
      ✅ Pièce créée avec succès

   📦 Pièce 3/3: Salle de bain avec toilettes (quantité: 1)
      - Tâches: 5
      - Photos: 1
      ✅ Pièce créée avec succès

============================================================
✅ WEBHOOK TERMINÉ pour logement: Appartement Paris
   - Logement créé: ✅
   - Parcours créé: ✅
   - Pièces créées: 3/3
============================================================
```

## 🔧 Configuration dans Bubble.io

### ⚠️ IMPORTANT : Configuration requise dans Bubble

Pour que le workflow en 2 étapes fonctionne, vous devez configurer les workflows suivants dans Bubble.io :

#### 1. Workflow `webhookparcour` (Étape 1)

**Endpoint :** `/api/1.1/wf/webhookparcour`

**Paramètres attendus :**
- `conciergerieID` (text)
- `userID` (text)
- `nom` (text)
- `adresse` (text)
- `airbnbLink` (text, optional)
- `parcoursType` (text)
- `nomParcours` (text)
- `modele` (object)

**Actions du workflow :**
1. Créer un nouveau logement avec les données reçues
2. Créer un nouveau parcours lié au logement
3. Retourner les IDs créés dans la réponse :
   ```json
   {
     "logementID": "[ID du logement créé]",
     "parcourID": "[ID du parcours créé]"
   }
   ```

#### 2. Workflow `createpiece` (Étape 2)

**Endpoint :** `/api/1.1/wf/createpiece/initialize`

**⚠️ Le workflow doit être en mode "initialization" (paramètre dans l'URL)**

**Paramètres attendus :**
- `logementID` (text)
- `parcourID` (text)
- `nom` (text)
- `quantite` (number)
- `tasks` (list of objects)
- `photos` (list of texts)

**Actions du workflow :**
1. Créer une nouvelle pièce liée au logement et au parcours
2. Créer les tâches associées à la pièce
3. Sauvegarder les photos de la pièce
4. Retourner un statut de succès

## 🚨 Gestion des erreurs

### Erreur à l'étape 1

Si l'étape 1 échoue, le processus s'arrête immédiatement et aucune pièce n'est créée.

**Exemple de log :**
```
❌ ÉCHEC GLOBAL du webhook pour logement: Appartement Paris
Error: Étape 1 échouée: 500 Internal Server Error - ...
```

### Erreur à l'étape 2

Si une pièce échoue, le serveur continue avec les autres pièces.

**Exemple de log :**
```
   📦 Pièce 1/3: Cuisine (quantité: 1)
      - Tâches: 6
      - Photos: 2
      ❌ Erreur lors de la création de la pièce "Cuisine": Error: 404 Not Found - ...

   📦 Pièce 2/3: Chambre (quantité: 2)
      - Tâches: 4
      - Photos: 1
      ✅ Pièce créée avec succès
```

**Résumé final :**
```
============================================================
✅ WEBHOOK TERMINÉ pour logement: Appartement Paris
   - Logement créé: ✅
   - Parcours créé: ✅
   - Pièces créées: 2/3
   - Erreurs: 1 pièce(s) en échec
============================================================
```

Si **toutes** les pièces échouent, une erreur globale est levée :
```
❌ ÉCHEC GLOBAL du webhook pour logement: Appartement Paris
Error: Toutes les pièces ont échoué (3/3)
```

## 📁 Fichiers modifiés

### `src/config/webhooks.ts`

Ajout des nouveaux endpoints pour les 2 étapes :

```typescript
export const webhookConfig = {
  // Étape 1 : Création du logement et du parcours
  createLogement: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour',
  },
  
  // Étape 2 : Création de chaque pièce individuellement
  createPiece: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createpiece/initialize',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createpiece/initialize',
  },
} as const;
```

### `server/services/webhookService.ts`

Réécriture complète de la fonction `sendWebhookToBubble()` pour implémenter le workflow en 2 étapes.

## ✅ Avantages du nouveau workflow

1. **Payloads plus légers** : Chaque requête est plus petite
2. **Moins de timeouts** : Les requêtes sont plus rapides
3. **Meilleure gestion des erreurs** : Si une pièce échoue, les autres continuent
4. **Logs détaillés** : Suivi précis de chaque étape
5. **Scalabilité** : Peut gérer des logements avec beaucoup de pièces et de photos

## 🧪 Test du workflow

Le workflow a été testé avec succès :

✅ **Étape 1** : Logement et parcours créés dans Bubble
- LogementID: `1762186316823x781362145695184000`
- ParcourID: `1762186316907x354038844660805570`

⚠️ **Étape 2** : En attente de configuration du workflow `createpiece` dans Bubble

**Erreur actuelle :**
```
404 Not Found - {"statusCode":404,"body":{"status":"NOT_FOUND","message":"Workflow createpiece not in initialization mode"}}
```

**Action requise :** Configurer le workflow `createpiece` en mode "initialization" dans Bubble.io

## 📚 Documentation associée

- [QUICK_START.md](QUICK_START.md) - Guide de démarrage rapide
- [WEBHOOK_ARCHITECTURE.md](WEBHOOK_ARCHITECTURE.md) - Architecture générale
- [README.md](README.md) - Documentation générale

---

**Date de mise à jour :** 2025-11-03  
**Version :** 2.0.0 (Workflow en 2 étapes)

