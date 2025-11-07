# Guide de Test Manuel - Autocomplétion Google Maps

## 🎯 Objectif
Vérifier que vous pouvez sélectionner une adresse depuis les suggestions de Google Maps.

## 📋 Étapes de test

### 1. Démarrer l'application
```bash
npm run start
```

### 2. Ouvrir l'application dans le navigateur
Allez sur : http://localhost:8080/api/send-webhook?version-test=true&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&viewmode=full

### 3. Ouvrir la console du navigateur
- Appuyez sur `F12` ou `Cmd+Option+I` (Mac)
- Allez dans l'onglet "Console"

### 4. Ouvrir le dialogue d'ajout de logement
- Cherchez le bouton pour ajouter un nouveau logement
- Cliquez dessus

### 5. Tester l'autocomplétion

#### A. Vérifier que Google Maps est chargé
Dans la console, vous devriez voir :
```
📍 Initialisation de l'autocomplétion Google Places
✅ Autocomplétion initialisée avec succès
```

#### B. Remplir le nom du logement
- Entrez un nom dans le champ "Nom du logement"
- Exemple : "Test Appartement"

#### C. Tester l'autocomplétion d'adresse
1. Cliquez dans le champ "Adresse postale"
2. Tapez : `Tour Eiffel`
3. **Attendez que les suggestions apparaissent** (liste déroulante sous le champ)
4. **Cliquez sur une suggestion**

#### D. Vérifier le résultat
Dans la console, vous devriez voir :
```
📍 Place sélectionné: {formatted_address: "...", ...}
✅ Adresse formatée: Champ de Mars, 5 Av. Anatole France, 75007 Paris, France
```

Le champ d'adresse devrait maintenant contenir l'adresse complète.

## ✅ Critères de succès

- [ ] Les suggestions Google Maps apparaissent quand vous tapez
- [ ] Vous pouvez cliquer sur une suggestion
- [ ] L'adresse complète s'affiche dans le champ après la sélection
- [ ] La console affiche "✅ Adresse formatée: ..."
- [ ] Aucune erreur dans la console

## ❌ Problèmes possibles

### Les suggestions n'apparaissent pas
- Vérifiez que la clé API est configurée dans `.env.local`
- Vérifiez qu'il n'y a pas d'erreur dans la console
- Vérifiez que vous avez activé l'API Places dans Google Cloud Console

### Je peux cliquer mais l'adresse ne se remplit pas
- C'était le problème initial ! La correction devrait le résoudre
- Vérifiez dans la console si vous voyez "📍 Place sélectionné:"
- Si oui, mais que le champ ne se remplit pas, il y a encore un problème

### Erreur "ApiNotActivatedMapError"
- L'API Places n'est pas activée dans Google Cloud Console
- Suivez le guide dans `GOOGLE_MAPS_FIX.md`

## 🔍 Debug

Si ça ne fonctionne toujours pas, dans la console, tapez :
```javascript
// Vérifier que Google Maps est chargé
console.log('Google Maps:', typeof google !== 'undefined');
console.log('Places API:', typeof google?.maps?.places !== 'undefined');

// Vérifier le champ d'adresse
const input = document.getElementById('adresse');
console.log('Input:', input);
console.log('Has pac-target-input class:', input?.classList.contains('pac-target-input'));
```

## 📸 Captures d'écran attendues

1. **Avant la sélection** : Le champ contient ce que vous avez tapé (ex: "Tour Eiffel")
2. **Suggestions visibles** : Une liste déroulante apparaît sous le champ
3. **Après la sélection** : Le champ contient l'adresse complète (ex: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France")

## 🎬 Vidéo de démonstration

Si vous voulez enregistrer une vidéo pour montrer le problème ou la solution :
1. Utilisez QuickTime (Mac) ou l'outil de capture Windows
2. Enregistrez l'écran pendant que vous testez
3. Montrez bien la console et le champ d'adresse

## 📝 Rapport de bug

Si ça ne fonctionne toujours pas, notez :
- [ ] Navigateur utilisé (Chrome, Firefox, Safari, etc.)
- [ ] Version du navigateur
- [ ] Messages dans la console (copier-coller)
- [ ] Comportement observé vs comportement attendu
- [ ] Captures d'écran ou vidéo

