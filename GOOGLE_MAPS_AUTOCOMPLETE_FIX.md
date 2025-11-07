# Fix : Sélection d'adresse Google Maps Autocomplete

## 🐛 Problème

Vous ne pouviez pas sélectionner une adresse depuis les suggestions de Google Maps. Les suggestions s'affichaient correctement, mais quand vous cliquiez dessus, l'adresse ne se remplissait pas dans le champ.

### Cause du problème

Le composant `AddressAutocomplete` utilisait un **input contrôlé** avec `value={internalValue}`. Cela signifie que React contrôlait complètement la valeur du champ.

Quand Google Maps essayait de mettre à jour le champ après une sélection, React réinitialisait immédiatement la valeur à `internalValue`, empêchant ainsi la sélection de fonctionner.

## ✅ Solution

### Changements dans `src/components/ui/address-autocomplete.tsx`

#### 1. Remplacement de l'état interne par un flag
**Avant :**
```typescript
const [internalValue, setInternalValue] = React.useState(value);
```

**Après :**
```typescript
const isSelectingFromAutocomplete = React.useRef(false);
```

#### 2. Synchronisation conditionnelle de la valeur
**Avant :**
```typescript
React.useEffect(() => {
  setInternalValue(value);
}, [value]);
```

**Après :**
```typescript
React.useEffect(() => {
  if (inputRef.current && !isSelectingFromAutocomplete.current) {
    inputRef.current.value = value;
  }
}, [value]);
```

#### 3. Gestion de la sélection Google Maps
**Avant :**
```typescript
const listener = autocompleteRef.current.addListener("place_changed", () => {
  const place = autocompleteRef.current?.getPlace();
  if (place && place.formatted_address) {
    setInternalValue(place.formatted_address);
    onChange(place.formatted_address);
    onPlaceSelected?.(place);
  }
});
```

**Après :**
```typescript
const listener = autocompleteRef.current.addListener("place_changed", () => {
  const place = autocompleteRef.current?.getPlace();
  if (place && place.formatted_address) {
    // Marquer qu'on est en train de sélectionner depuis l'autocomplétion
    isSelectingFromAutocomplete.current = true;
    
    // Mettre à jour la valeur du champ directement
    if (inputRef.current) {
      inputRef.current.value = place.formatted_address;
    }
    
    // Notifier le parent du changement
    onChange(place.formatted_address);
    onPlaceSelected?.(place);
    
    // Réinitialiser le flag après un court délai
    setTimeout(() => {
      isSelectingFromAutocomplete.current = false;
    }, 100);
  }
});
```

#### 4. Changement de `value` à `defaultValue`
**Avant :**
```typescript
<input
  value={internalValue}
  onChange={handleInputChange}
  ...
/>
```

**Après :**
```typescript
<input
  defaultValue={value}
  onChange={handleInputChange}
  ...
/>
```

#### 5. Simplification du handler de changement
**Avant :**
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  setInternalValue(newValue);
  onChange(newValue);
};
```

**Après :**
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  onChange(newValue);
};
```

## 🎯 Comment ça fonctionne maintenant

1. **Initialisation** : Le champ utilise `defaultValue` au lieu de `value`, ce qui permet à Google Maps de modifier directement le DOM
2. **Saisie manuelle** : Quand l'utilisateur tape, `onChange` est appelé normalement
3. **Sélection Google Maps** :
   - Le flag `isSelectingFromAutocomplete` est activé
   - La valeur du champ est mise à jour directement via `inputRef.current.value`
   - Le parent est notifié via `onChange`
   - Le flag est désactivé après 100ms
4. **Synchronisation** : Si le parent change la valeur (via la prop `value`), le champ est mis à jour SAUF si une sélection Google Maps est en cours

## 🧪 Tests

### Tests Playwright créés
- ✅ Chargement de l'API Google Maps
- ✅ Affichage du champ d'adresse
- ✅ Saisie avec autocomplétion
- ✅ Sélection d'une adresse
- ✅ Gestion des erreurs
- ✅ Configuration de la clé API
- ✅ Chargement du script avec les bonnes bibliothèques

### Lancer les tests
```bash
# Tous les tests
npm test

# Mode UI interactif
npm run test:ui

# Mode headed (voir le navigateur)
npm run test:headed

# Mode debug
npm run test:debug
```

## 📋 Test manuel

Suivez le guide dans `tests/manual-test-guide.md` pour tester manuellement.

### Étapes rapides :
1. Démarrer l'app : `npm run start`
2. Ouvrir le dialogue d'ajout de logement
3. Taper une adresse dans le champ (ex: "Tour Eiffel")
4. Cliquer sur une suggestion
5. ✅ L'adresse complète devrait s'afficher dans le champ

## 🔍 Vérification dans la console

Ouvrez la console du navigateur (F12) et vérifiez :
```
✅ Google Maps chargé avec succès
📍 Initialisation de l'autocomplétion Google Places
✅ Autocomplétion initialisée avec succès
📍 Place sélectionné: {formatted_address: "...", ...}
✅ Adresse formatée: Champ de Mars, 5 Av. Anatole France, 75007 Paris, France
```

## 📚 Ressources

- [Google Places Autocomplete Documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete)
- [React Controlled vs Uncontrolled Components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- [Playwright Testing Documentation](https://playwright.dev)

## 🎉 Résultat attendu

Maintenant, quand vous :
1. Tapez une adresse dans le champ
2. Voyez les suggestions Google Maps
3. Cliquez sur une suggestion

➡️ **L'adresse complète s'affiche dans le champ** ✅

## 🐛 Si ça ne fonctionne toujours pas

1. Vérifiez que vous avez bien redémarré l'application après les modifications
2. Videz le cache du navigateur (Cmd+Shift+R ou Ctrl+Shift+R)
3. Vérifiez la console pour des erreurs
4. Suivez le guide de debug dans `tests/manual-test-guide.md`
5. Vérifiez que la clé API Google Maps est bien configurée dans `.env.local`

## 📝 Fichiers modifiés

- ✅ `src/components/ui/address-autocomplete.tsx` - Correction du composant
- ✅ `playwright.config.ts` - Configuration Playwright (nouveau)
- ✅ `tests/google-maps-autocomplete.spec.ts` - Tests E2E (nouveau)
- ✅ `tests/README.md` - Documentation des tests (nouveau)
- ✅ `tests/manual-test-guide.md` - Guide de test manuel (nouveau)
- ✅ `package.json` - Ajout des scripts de test
- ✅ `.gitignore` - Ajout des dossiers de test
- ✅ `GOOGLE_MAPS_AUTOCOMPLETE_FIX.md` - Ce fichier (nouveau)

