# Fix Google Maps API - Guide de résolution

## Problème identifié

Deux problèmes ont été détectés :

1. **ApiNotActivatedMapError** : L'API Google Maps JavaScript n'est pas activée pour la clé API
2. **Deprecation Warning** : L'ancienne API `Autocomplete` sera dépréciée en mars 2025

## Solution immédiate : Activer les APIs Google Maps

### Étape 1 : Accéder à Google Cloud Console

1. Allez sur : https://console.cloud.google.com/google/maps-apis
2. Connectez-vous avec votre compte Google
3. Sélectionnez votre projet (ou créez-en un nouveau)

### Étape 2 : Activer les APIs nécessaires

Vous devez activer **3 APIs** pour que l'autocomplétion d'adresse fonctionne :

#### A. Maps JavaScript API (OBLIGATOIRE)
1. Dans le menu, cliquez sur **"Bibliothèque"**
2. Recherchez **"Maps JavaScript API"**
3. Cliquez dessus
4. Cliquez sur **"ACTIVER"**
5. Attendez quelques secondes

#### B. Places API (New) (OBLIGATOIRE)
1. Dans le menu, cliquez sur **"Bibliothèque"**
2. Recherchez **"Places API (New)"**
3. Cliquez dessus
4. Cliquez sur **"ACTIVER"**
5. Attendez quelques secondes

#### C. Geocoding API (OPTIONNEL mais recommandé)
1. Dans le menu, cliquez sur **"Bibliothèque"**
2. Recherchez **"Geocoding API"**
3. Cliquez dessus
4. Cliquez sur **"ACTIVER"**

### Étape 3 : Vérifier et sécuriser votre clé API

1. Allez dans **"Identifiants"** dans le menu
2. Trouvez votre clé API : `AIzaSyB4jU_gmu7xz1VRF4cBncN9tjjYwOlRz6M`
3. Cliquez sur l'icône de modification (crayon)
4. Sous **"Restrictions relatives aux applications"** :
   - Sélectionnez **"Référents HTTP (sites web)"**
   - Ajoutez vos domaines autorisés :
     ```
     http://localhost:*
     https://localhost:*
     https://app-production-01a1.up.railway.app/*
     ```
5. Sous **"Restrictions relatives aux API"** :
   - Sélectionnez **"Restreindre la clé"**
   - Cochez :
     - ✅ Maps JavaScript API
     - ✅ Places API (New)
     - ✅ Geocoding API
6. Cliquez sur **"ENREGISTRER"**

### Étape 4 : Configurer la clé dans Railway

1. Allez sur https://railway.app
2. Ouvrez votre projet
3. Cliquez sur votre service
4. Allez dans l'onglet **"Variables"**
5. Ajoutez ou modifiez :
   - **Nom** : `VITE_GOOGLE_MAPS_API_KEY`
   - **Valeur** : `AIzaSyB4jU_gmu7xz1VRF4cBncN9tjjYwOlRz6M`
6. Cliquez sur **"Add"**
7. Railway redéploiera automatiquement

### Étape 5 : Vérifier le déploiement

1. Attendez que le déploiement se termine (2-3 minutes)
2. Regardez les **logs de build** dans Railway
3. Vous devriez voir :
   ```
   🔧 Vite build mode: production
   🔑 VITE_GOOGLE_MAPS_API_KEY présente: true
   ```
4. Si vous voyez `false`, la variable n'est pas configurée correctement

### Étape 6 : Tester l'application

1. Ouvrez votre application : https://app-production-01a1.up.railway.app/api/send-webhook?version-test=true&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&viewmode=full
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a plus l'erreur `ApiNotActivatedMapError`
4. Testez l'autocomplétion d'adresse dans le formulaire

## Problème de dépréciation (à faire plus tard)

L'API `google.maps.places.Autocomplete` sera dépréciée en mars 2025. Pour l'instant, elle fonctionne encore, mais il faudra migrer vers `PlaceAutocompleteElement` avant cette date.

### Migration recommandée (optionnel pour l'instant)

La migration vers la nouvelle API nécessite :
1. Utiliser des Web Components au lieu de l'API JavaScript classique
2. Modifier significativement le composant `address-autocomplete.tsx`
3. Tester en profondeur la nouvelle implémentation

**Recommandation** : Gardez l'ancienne API pour l'instant (elle fonctionne jusqu'en mars 2025) et planifiez la migration pour début 2025.

## Checklist de vérification

- [ ] Maps JavaScript API activée dans Google Cloud Console
- [ ] Places API (New) activée dans Google Cloud Console
- [ ] Geocoding API activée dans Google Cloud Console (optionnel)
- [ ] Restrictions de domaine configurées sur la clé API
- [ ] Variable `VITE_GOOGLE_MAPS_API_KEY` configurée dans Railway
- [ ] Application redéployée dans Railway
- [ ] Logs de build montrent "🔑 VITE_GOOGLE_MAPS_API_KEY présente: true"
- [ ] Pas d'erreur `ApiNotActivatedMapError` dans la console du navigateur
- [ ] Autocomplétion d'adresse fonctionne dans l'application

## Liens utiles

- Google Cloud Console : https://console.cloud.google.com/google/maps-apis
- Documentation Maps JavaScript API : https://developers.google.com/maps/documentation/javascript
- Documentation Places API : https://developers.google.com/maps/documentation/places/web-service
- Guide de migration : https://developers.google.com/maps/documentation/javascript/places-migration-overview
- Messages d'erreur : https://developers.google.com/maps/documentation/javascript/error-messages

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les APIs sont bien activées
2. Attendez 2-3 minutes après l'activation (propagation)
3. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
4. Vérifiez les logs de build dans Railway
5. Vérifiez la console du navigateur pour les erreurs détaillées

