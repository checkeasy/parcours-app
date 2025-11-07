# Configuration de l'API Google Maps

## Obtenir une clé API Google Maps

1. **Accédez à la Google Cloud Console**
   - Rendez-vous sur https://console.cloud.google.com/

2. **Créez un nouveau projet (ou sélectionnez un projet existant)**
   - Cliquez sur le sélecteur de projet en haut de la page
   - Cliquez sur "Nouveau projet"
   - Donnez un nom à votre projet (ex: "Parcours App")
   - Cliquez sur "Créer"

3. **Activez l'API Places**
   - Dans le menu de navigation, allez dans "APIs & Services" > "Bibliothèque"
   - Recherchez "Places API"
   - Cliquez sur "Places API"
   - Cliquez sur "Activer"

4. **Créez une clé API**
   - Dans le menu de navigation, allez dans "APIs & Services" > "Identifiants"
   - Cliquez sur "Créer des identifiants" > "Clé API"
   - Votre clé API sera créée et affichée

5. **Sécurisez votre clé API (IMPORTANT)**
   - Cliquez sur "Modifier la clé API"
   - Sous "Restrictions relatives aux applications", sélectionnez "Référents HTTP (sites web)"
   - Ajoutez vos domaines autorisés :
     - `http://localhost:*` (pour le développement local)
     - `https://votre-domaine.com/*` (pour la production)
   - Sous "Restrictions relatives aux API", sélectionnez "Restreindre la clé"
   - Sélectionnez uniquement "Places API"
   - Cliquez sur "Enregistrer"

## Configuration dans l'application

1. **Copiez votre clé API**

2. **Ajoutez-la dans le fichier `env`**
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=votre_clé_api_ici
   ```

3. **Redémarrez votre serveur de développement**
   ```bash
   npm run start
   ```

## Vérification

L'autocomplétion d'adresse devrait maintenant fonctionner dans le formulaire d'ajout de logement :
- Ouvrez le dialogue "Ajouter un logement"
- Commencez à taper une adresse dans le champ "Adresse postale"
- Des suggestions d'adresses devraient apparaître automatiquement

## Tarification

Google Maps Platform offre :
- **200 $ de crédit gratuit par mois**
- L'API Places Autocomplete coûte **2,83 $ pour 1000 requêtes** (après le crédit gratuit)
- Pour la plupart des petites applications, le crédit gratuit est largement suffisant

Plus d'informations : https://mapsplatform.google.com/pricing/

## Dépannage

### L'autocomplétion ne fonctionne pas
1. Vérifiez que la clé API est correctement configurée dans le fichier `env`
2. Vérifiez que l'API Places est activée dans Google Cloud Console
3. Vérifiez la console du navigateur pour les erreurs
4. Assurez-vous que votre domaine est autorisé dans les restrictions de la clé API

### Erreur "This API project is not authorized to use this API"
- Vérifiez que l'API Places est bien activée dans votre projet Google Cloud

### Erreur "RefererNotAllowedMapError"
- Ajoutez votre domaine dans les restrictions de référents HTTP de la clé API

