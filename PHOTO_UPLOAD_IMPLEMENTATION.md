# Implémentation de l'upload des photos de tâches

## 📋 Problème résolu

Les photos de référence des tâches dans les modèles de parcours n'étaient pas persistées correctement. Elles étaient stockées en base64 localement mais jamais converties en URLs permanentes via l'API Bubble.io.

## ✅ Solution implémentée

### 1. Configuration centralisée : `src/config/bubbleEndpoints.ts`

Ajout de l'endpoint `createFile` dans la configuration :
```typescript
createFile: {
  test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createfileap',
  production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createfileap',
}
```

### 2. Nouveau fichier utilitaire : `src/utils/imageUpload.ts`

Fonctions créées :
- **`convertBase64ToUrl(base64Image: string)`** : Convertit une image base64 en URL permanente via l'API Bubble.io
- **`isBase64Image(str: string)`** : Vérifie si une chaîne est une image base64
- **`isUrl(str: string)`** : Vérifie si une chaîne est une URL
- **`isTestMode()`** : Détecte le mode test/production depuis l'URL

**Endpoint utilisé :**
- **Test** : `https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createfileap`
- **Production** : `https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createfileap`

L'endpoint est automatiquement sélectionné selon le paramètre URL `?version-test=true`

```
POST <endpoint selon mode>
Body: { "base64": "<base64_string>" }
Response: { "imgUrl": "<url>" }
```

### 3. Modifications dans `TacheDialog.tsx`

**Changements :**
- Import de `convertBase64ToUrl`, `isBase64Image` et `useToast`
- Ajout d'un état `isUploadingPhoto` pour gérer le loading
- Modification de `handlePhotoChange` pour convertir automatiquement le base64 en URL
- Affichage d'un spinner pendant l'upload
- Toast de confirmation ou d'erreur après l'upload
- Désactivation du bouton "Ajouter To Do" pendant l'upload

**Flux d'upload :**
1. L'utilisateur sélectionne une photo
2. La photo est lue en base64 (FileReader)
3. **NOUVEAU** : Appel automatique à `convertBase64ToUrl()`
4. Si succès : stockage de l'URL dans `photoPreview`
5. Si échec : fallback sur le base64 avec avertissement
6. Toast de notification à l'utilisateur

### 4. Modifications dans `webhook.ts`

**Nouvelle fonction :**
```typescript
async function convertTaskPhotosToUrls(modeleData: ParcoursModele): Promise<ParcoursModele>
```

Cette fonction :
- Parcourt toutes les pièces du modèle
- Pour chaque tâche, vérifie si `photoUrl` est en base64
- Convertit les base64 restants en URLs
- Retourne le modèle avec toutes les photos en URLs

**Intégration dans `dispatchModeleWebhook` :**
- Avant d'envoyer le modèle à Bubble.io, appel de `convertTaskPhotosToUrls()`
- Garantit que toutes les photos sont des URLs permanentes

**Intégration dans `dispatchWebhook` (création de logement/parcours) :**
```typescript
// Convert task photos from base64 to URLs if modele is a custom ParcoursModele
let processedModele = logementData.modele;
if (typeof logementData.modele !== 'string') {
  console.log('🔄 Converting task photos in custom modele before creating logement...');
  processedModele = await convertTaskPhotosToUrls(logementData.modele);
  console.log('✅ Task photos converted successfully');
}
```
- Détecte si le modèle est personnalisé (pas "menage" ou "voyageur")
- Convertit toutes les photos de tâches avant de créer le logement/parcours
- Garantit que Bubble.io reçoit des URLs permanentes, pas du base64

### 5. Modifications dans `CustomModeleBuilder.tsx`

**Problème** : Les tâches par défaut partagent le même ID entre tous les modèles. Si on ajoute une photo à une tâche par défaut dans un modèle, elle apparaîtrait dans tous les autres modèles.

**Solution** : Modification de `handleSaveEditedTask` pour créer une copie unique de la tâche quand on la modifie.

**Logique implémentée :**
```typescript
// Détection des changements significatifs
const hasPhotoChange = updatedTask.photoUrl !== originalTask.photoUrl;
const hasContentChange =
  updatedTask.titre !== originalTask.titre ||
  updatedTask.description !== originalTask.description ||
  updatedTask.emoji !== originalTask.emoji ||
  updatedTask.photoObligatoire !== originalTask.photoObligatoire;

if (hasPhotoChange || hasContentChange) {
  // Créer une nouvelle tâche personnalisée avec ID unique
  const newTaskId = `custom-edited-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  // Ajouter aux tâches personnalisées
  // Mettre à jour la sélection pour utiliser le nouvel ID
}
```

**Résultat** : Chaque modèle a maintenant ses propres versions des tâches modifiées, avec leurs propres photos.

## 🔄 Flux complet

### Scénario 1 : Upload immédiat réussi
```
1. Utilisateur upload photo dans TacheDialog
2. Conversion base64 → URL (API Bubble.io)
3. Stockage de l'URL dans la tâche
4. Toast "✅ Photo uploadée"
5. Sauvegarde du modèle → URL envoyée directement
```

### Scénario 2 : Upload immédiat échoué
```
1. Utilisateur upload photo dans TacheDialog
2. Tentative de conversion échoue
3. Stockage du base64 temporairement
4. Toast "⚠️ Upload partiel"
5. Sauvegarde du modèle → Conversion base64 → URL avant envoi
```

### Scénario 3 : Édition d'une tâche existante avec photo
```
1. Chargement de la tâche avec photoUrl (URL)
2. Affichage de la photo depuis l'URL
3. Pas de conversion nécessaire
```

## 🎯 Avantages

1. **Double sécurité** : Upload immédiat + conversion avant sauvegarde
2. **Feedback utilisateur** : Toast notifications claires
3. **Fallback robuste** : Si upload immédiat échoue, retry avant sauvegarde
4. **Performance** : Photos converties une seule fois
5. **Persistance** : URLs permanentes stockées dans Bubble.io
6. **Isolation des modèles** : Chaque modèle a ses propres photos de tâches (pas de partage entre modèles)

## 🧪 Tests à effectuer

1. ✅ Créer une nouvelle tâche avec photo
2. ✅ Vérifier le toast de succès
3. ✅ Sauvegarder le modèle
4. ✅ Vérifier que l'URL est envoyée à Bubble.io (console logs)
5. ✅ Recharger le modèle depuis Bubble.io
6. ✅ Vérifier que la photo s'affiche correctement
7. ⚠️ Tester le cas d'échec (endpoint indisponible)
8. ⚠️ Vérifier le fallback sur base64

## 📝 Notes techniques

- **Gestion automatique test/production** : L'endpoint est sélectionné selon `?version-test=true` dans l'URL
- Le base64 envoyé doit être **sans le préfixe** `data:image/...`
- La fonction `convertBase64ToUrl` gère automatiquement le nettoyage
- Les logs console permettent de suivre le processus de conversion
- Les photos existantes (déjà en URL) ne sont pas reconverties
- Configuration centralisée dans `src/config/bubbleEndpoints.ts`

### Isolation des photos entre modèles

**Problème résolu** : Quand on ajoute une photo à une tâche par défaut (ex: "Vider les poubelles"), la photo ne doit pas être partagée avec d'autres modèles utilisant la même tâche.

**Solution** : Quand on modifie une tâche par défaut (ajout de photo, changement de titre, etc.), le système crée automatiquement une **copie de la tâche avec un nouvel ID unique** (`custom-edited-{timestamp}-{random}`). Cette copie devient une tâche personnalisée spécifique au modèle en cours d'édition.

**Comportement** :
- Tâche par défaut non modifiée : ID partagé (ex: `m-cuisine-1`)
- Tâche par défaut modifiée : Nouvel ID unique (ex: `custom-edited-1764668600000-abc123`)
- Tâche personnalisée : ID unique dès la création (ex: `custom-1764668500000`)

Cela garantit que chaque modèle a ses propres photos de référence pour les tâches.

## 🔍 Logs de débogage

Lors de l'upload d'une photo, vous verrez dans la console :
```
📤 Converting base64 image to URL (TEST)...
   Endpoint: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createfileap
✅ Image uploaded successfully: https://...
```

Ou en production :
```
📤 Converting base64 image to URL (PRODUCTION)...
   Endpoint: https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createfileap
✅ Image uploaded successfully: https://...
```

Lors de la sauvegarde d'un modèle :
```
🔄 Converting task photos from base64 to URLs...
   Converting photo for task: <nom_tache>
   ✅ Converted: <nom_tache>
📤 Sending modele webhook request to backend server...
```

