# Test du mode Parcours et du flux de création

## 🎯 Objectifs
Tester les deux modes de création de parcours :
1. **Mode AVEC LOGEMENT** (`parcourmode=true`) : quand `logementid` est présent dans l'URL
   - Le flux commence directement à l'étape de sélection du type de parcours
   - La numérotation des étapes est ajustée (commence à "Étape 1/4" au lieu de "Étape 2/5")
2. **Mode AUTONOME** (`parcourmode=false`) : quand aucun `logementid` n'est présent dans l'URL
   - Le flux commence normalement à l'étape de création du logement
   - La numérotation des étapes est normale (commence à "Étape 1/5")

---

## 📋 Scénarios de test

### Scénario 1 : Mode AVEC LOGEMENT (parcourmode=true)

**URL de test :**
```
http://localhost:8081/?logementid=1762768573904x510316102867504260&version-test=true&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200
```

**Comportement attendu :**

#### A. Détection du logement
- ✅ Le paramètre `logementid` est détecté dans l'URL
- ✅ Les données du logement sont chargées depuis Bubble.io
- ✅ Le dialog s'ouvre automatiquement avec les données pré-remplies
- ✅ Un toast de confirmation s'affiche

#### B. Flux de création de parcours
- ✅ **L'étape 1 (création du logement) est SAUTÉE**
- ✅ Le flux commence directement à l'étape de sélection du type de parcours
- ✅ L'utilisateur voit **"Étape 1/4"** (au lieu de "Étape 2/5")
- ✅ Le bouton "Retour" n'est PAS affiché (car on ne peut pas revenir à l'étape 1)
- ✅ Les étapes suivantes affichent :
  - Sélection du type de parcours : "Étape 1/4"
  - Sélection du modèle : "Étape 2/4"
  - Chargement Airbnb (si applicable) : "Étape 3/4"
  - Sélection des pièces : "Étape 4/4"

#### C. Payload envoyé à Bubble
- ✅ `parcourmode` est défini à `true`
- ✅ `logementid` contient la valeur `"1762768573904x510316102867504260"`

**Payload envoyé à Bubble :**
```json
{
  "conciergerieID": "1730741276842x778024514623373300",
  "userID": "1730741188020x554510837711264200",
  "nom": "LE LOGEMENT",
  "parcourmode": true,
  "logementid": "1762768573904x510316102867504260",
  ...
}
```

**Logs attendus dans la console :**
```
📤 SENDING WEBHOOK TO BACKEND
   🔗 Logement ID (URL): 1762768573904x510316102867504260
   📋 Parcour Mode: AVEC LOGEMENT (true)
   📦 Payload.parcourmode: true
   📦 Payload.logementid: 1762768573904x510316102867504260
```

---

### Scénario 2 : Mode AUTONOME (parcourmode=false)

**URL de test :**
```
http://localhost:8081/?version-test=true&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200
```

**Comportement attendu :**

#### A. Pas de logement détecté
- ✅ Aucun paramètre `logementid` dans l'URL
- ✅ Aucun chargement de données de logement
- ✅ Le dialog ne s'ouvre PAS automatiquement
- ✅ L'utilisateur doit cliquer sur "Ajouter un logement" pour ouvrir le dialog

#### B. Flux de création de parcours
- ✅ **Le flux commence normalement à l'étape 1** (création du logement)
- ✅ L'utilisateur voit **"Étape 1/5"**
- ✅ Le bouton "Retour" est affiché à l'étape 2
- ✅ Les étapes affichent :
  - Création du logement : "Étape 1/5"
  - Sélection du type de parcours : "Étape 2/5"
  - Sélection du modèle : "Étape 3/5"
  - Chargement Airbnb (si applicable) : "Étape 4/5"
  - Sélection des pièces : "Étape 5/5"

#### C. Payload envoyé à Bubble
- ✅ `parcourmode` est défini à `false`
- ✅ `logementid` est `null`

**Payload envoyé à Bubble :**
```json
{
  "conciergerieID": "1730741276842x778024514623373300",
  "userID": "1730741188020x554510837711264200",
  "nom": "Nom du logement",
  "parcourmode": false,
  "logementid": null,
  ...
}
```

**Logs attendus dans la console :**
```
📤 SENDING WEBHOOK TO BACKEND
   🔗 Logement ID (URL): NON PRÉSENT
   📋 Parcour Mode: AUTONOME (false)
   📦 Payload.parcourmode: false
   📦 Payload.logementid: null
```

---

## 🔍 Points de vérification

### Frontend (`src/utils/webhook.ts`)
- [ ] La fonction `getLogementID()` récupère correctement le paramètre de l'URL
- [ ] `parcourmode` est calculé avec `!!urlLogementId`
- [ ] Les logs affichent correctement les valeurs

### Backend Route (`server/routes/webhook.ts`)
- [ ] Les champs `parcourmode` et `logementid` sont extraits de `req.body`
- [ ] Les logs affichent correctement les valeurs reçues
- [ ] Les champs sont passés à `sendWebhookToBubble()`

### Backend Service (`server/services/webhookService.ts`)
- [ ] L'interface `WebhookPayload` inclut `parcourmode` et `logementid`
- [ ] Les champs sont extraits du payload
- [ ] Les champs sont ajoutés au `logementPayload` envoyé à Bubble
- [ ] Les logs affichent correctement les valeurs

---

## 🧪 Procédure de test

1. **Démarrer le serveur de développement** (si pas déjà lancé) :
   ```bash
   npm run dev
   ```

2. **Démarrer le backend** (dans un autre terminal) :
   ```bash
   cd server
   npm run dev
   ```

3. **Tester le Scénario 1** (avec logementid) :
   - Ouvrir l'URL du Scénario 1 dans le navigateur
   - Créer un nouveau logement/parcours
   - Vérifier les logs dans la console du navigateur (F12)
   - Vérifier les logs dans le terminal du backend

4. **Tester le Scénario 2** (sans logementid) :
   - Ouvrir l'URL du Scénario 2 dans le navigateur
   - Créer un nouveau logement/parcours
   - Vérifier les logs dans la console du navigateur (F12)
   - Vérifier les logs dans le terminal du backend

---

## ✅ Résultat attendu

Les deux scénarios doivent fonctionner correctement et envoyer les bons paramètres à Bubble.io :
- **Scénario 1** : `parcourmode=true` et `logementid="1762768573904x510316102867504260"`
- **Scénario 2** : `parcourmode=false` et `logementid=null`

