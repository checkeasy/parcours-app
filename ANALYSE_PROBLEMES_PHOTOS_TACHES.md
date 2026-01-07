# Analyse des Problèmes - Système de Photos de Référence des Tâches

## 📋 Vue d'ensemble

Ce document analyse 3 problèmes critiques identifiés dans le système de gestion des photos de référence des tâches.

---

## 🔴 PROBLÈME 1 : Performance de chargement des images

### Symptôme
Les images des tâches (ex: `https://eb0bcaf95c312d7fe9372017cb5f1835.cdn.bubble.io/...`) sont très lentes à charger dans l'interface.

### Cause racine
Les images Bubble.io CDN ne sont pas optimisées et chargées sans stratégie de cache ou de préchargement.

### Impact
- Mauvaise expérience utilisateur lors de l'édition des tâches
- Temps d'attente prolongé dans `TacheDialog.tsx`
- Pas de feedback visuel pendant le chargement

### Solution proposée

#### Option A : Lazy Loading avec Placeholder (Recommandé)
```tsx
// Dans TacheDialog.tsx
const [imageLoading, setImageLoading] = useState(true);
const [imageError, setImageError] = useState(false);

<div className="relative">
  {imageLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )}
  <img
    src={photoPreview}
    alt="Preview"
    className="w-full h-full object-cover"
    onLoad={() => setImageLoading(false)}
    onError={() => {
      setImageLoading(false);
      setImageError(true);
    }}
  />
  {imageError && (
    <div className="absolute inset-0 flex items-center justify-center bg-muted">
      <p className="text-xs text-muted-foreground">Image non disponible</p>
    </div>
  )}
</div>
```

#### Option B : Compression côté serveur
Ajouter un endpoint backend qui compresse les images avant de les servir :
```typescript
// server/routes/imageProxy.ts
app.get('/api/image-proxy', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url);
  const buffer = await response.buffer();
  
  // Compresser avec sharp
  const compressed = await sharp(buffer)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  
  res.set('Content-Type', 'image/jpeg');
  res.send(compressed);
});
```

---

## 🔴 PROBLÈME 2 : Perte des photos lors de la création du parcours

### Symptôme
Les photos de référence des tâches ne sont pas incluses dans le parcours final créé. Les tâches perdent leurs photos entre l'édition et la sauvegarde finale.

### Cause racine - CRITIQUE ⚠️

**Le problème se situe dans `SelectTasksPerRoomDialog.tsx` et `updateModeleTasks()`** :

1. **Dans `SelectTasksPerRoomDialog.tsx`** :
   - Les tâches personnalisées avec `photoUrl` sont stockées dans `customTasksPerRoom` (Map locale)
   - Mais `handleSave()` ne retourne que `selectedTasksPerRoom` (Map<string, string[]>) - **SEULEMENT LES IDs**
   - Les tâches complètes avec `photoUrl` ne sont **JAMAIS transmises** au parent

```typescript
// SelectTasksPerRoomDialog.tsx - Ligne 125-127
const handleSave = () => {
  onSave(selectedTasksPerRoom); // ❌ Ne retourne que les IDs, pas les tâches complètes
};
```

2. **Dans `AddLogementDialog.tsx` - handleStep5Next()` (ligne 318-338)** :
   - Reçoit seulement `tasksPerRoom: Map<string, string[]>` (IDs)
   - Appelle `updateModeleTasks(conciergerieModele, tasksPerRoom, allTasksSource)`
   - `allTasksSource` = `TACHES_MENAGE` ou `TACHES_VOYAGEUR` (tâches par défaut SANS les customs)

3. **Dans `updateModeleTasks()` (conciergerieModele.ts ligne 130-154)** :
   - Utilise `allTasksSource[nomPiece]` pour récupérer `tachesDisponibles`
   - **Les tâches personnalisées avec photoUrl ne sont PAS dans allTasksSource**
   - Résultat : `tachesDisponibles` ne contient que les tâches par défaut

### Flux de données actuel (CASSÉ) :
```
SelectTasksPerRoomDialog
  ├─ customTasksPerRoom: Map<string, TacheModele[]>  ✅ Contient photoUrl
  ├─ selectedTasksPerRoom: Map<string, string[]>     ❌ Seulement IDs
  └─ handleSave() → onSave(selectedTasksPerRoom)     ❌ PERTE DES DONNÉES

AddLogementDialog.handleStep5Next()
  ├─ Reçoit: tasksPerRoom (IDs seulement)            ❌ Pas de photoUrl
  ├─ allTasksSource = TACHES_MENAGE/VOYAGEUR         ❌ Pas de customs
  └─ updateModeleTasks(modele, tasksPerRoom, allTasksSource)

updateModeleTasks()
  ├─ tachesDisponibles = allTasksSource[nomPiece]    ❌ Pas de customs
  └─ Sauvegarde dans modele.pieces                   ❌ photoUrl perdu
```

### Solution proposée

#### Étape 1 : Modifier l'interface de `SelectTasksPerRoomDialog`
```typescript
// SelectTasksPerRoomDialog.tsx
interface SelectTasksPerRoomDialogProps {
  // ... autres props
  onSave: (
    tasksPerRoom: Map<string, string[]>,
    customTasks: Map<string, TacheModele[]>  // ✅ NOUVEAU
  ) => void;
}

const handleSave = () => {
  onSave(selectedTasksPerRoom, customTasksPerRoom); // ✅ Passer les deux
};
```

#### Étape 2 : Modifier `handleStep5Next` dans `AddLogementDialog`
```typescript
const handleStep5Next = async (
  tasksPerRoom: Map<string, string[]>,
  customTasks: Map<string, TacheModele[]>  // ✅ NOUVEAU
) => {
  setSelectedTasksPerRoom(tasksPerRoom);

  if (!conciergerieModele || !parcoursType) return;

  try {
    const allTasksSource = parcoursType === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;
    
    // ✅ Fusionner les tâches par défaut avec les customs
    const mergedTasksSource = mergeTasks(allTasksSource, customTasks);
    
    const updatedModele = updateModeleTasks(conciergerieModele, tasksPerRoom, mergedTasksSource);
    await updateConciergerieModele(updatedModele, getConciergerieID(), getIsTestMode());
    
    // ... reste du code
  }
};

// ✅ Nouvelle fonction helper
function mergeTasks(
  defaultTasks: Record<string, TacheModele[]>,
  customTasks: Map<string, TacheModele[]>
): Record<string, TacheModele[]> {
  const merged = { ...defaultTasks };

  customTasks.forEach((tasks, roomName) => {
    merged[roomName] = [...(merged[roomName] || []), ...tasks];
  });

  return merged;
}
```

---

## 🔴 PROBLÈME 3 : Indicateur visuel manquant pour les photos

### Symptôme
Dans "Étape 5/6 - Sélectionnez les tâches pour chaque pièce" (`SelectTasksPerRoomDialog.tsx`), il n'y a aucun indicateur visuel pour montrer qu'une tâche possède une photo de référence.

### Cause racine
L'interface affiche seulement :
- Emoji de la tâche
- Titre
- Badge "📷 Photo obligatoire" (si `photoObligatoire === true`)
- Description

Mais **aucun indicateur** pour `photoUrl` (photo de référence uploadée).

### Impact
- L'utilisateur ne peut pas savoir quelles tâches ont des photos de référence
- Doit ouvrir chaque tâche individuellement pour vérifier
- Mauvaise UX, perte de temps

### Solution proposée

#### Option A : Badge "Photo de référence" (Recommandé)
```tsx
// SelectTasksPerRoomDialog.tsx - Dans le rendu de chaque tâche
<Label htmlFor={`task-${roomName}-${task.id}`} className="flex-1 cursor-pointer min-w-0">
  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
    <span className="text-sm sm:text-base">{task.emoji}</span>
    <span className="font-medium text-xs sm:text-sm">{task.titre}</span>

    {/* ✅ NOUVEAU : Badge pour photo de référence */}
    {task.photoUrl && (
      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
        🖼️ Photo de référence
      </Badge>
    )}

    {task.photoObligatoire && (
      <Badge variant="default" className="text-xs bg-primary hover:bg-primary/90">
        📷 Photo obligatoire
      </Badge>
    )}
  </div>
  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
    {task.description}
  </p>
</Label>
```

#### Option B : Icône cliquable avec preview
```tsx
{task.photoUrl && (
  <div className="relative group">
    <Image className="h-4 w-4 text-blue-600 cursor-pointer" />
    {/* Tooltip avec preview au hover */}
    <div className="absolute hidden group-hover:block z-50 bottom-full left-0 mb-2">
      <img
        src={task.photoUrl}
        alt="Preview"
        className="w-32 h-32 object-cover rounded border-2 border-blue-600 shadow-lg"
      />
    </div>
  </div>
)}
```

---

## 📊 Résumé des priorités

| Problème | Priorité | Complexité | Impact |
|----------|----------|------------|--------|
| **#2 - Perte des photos** | 🔴 CRITIQUE | Moyenne | Bloquant |
| **#3 - Indicateur visuel** | 🟡 Haute | Faible | UX |
| **#1 - Performance** | 🟢 Moyenne | Moyenne | UX |

### Ordre de résolution recommandé :
1. **Problème #2** (CRITIQUE) - Corriger la perte de données
2. **Problème #3** (Haute) - Améliorer la visibilité
3. **Problème #1** (Moyenne) - Optimiser les performances

---

## 🔧 Plan d'implémentation

### Phase 1 : Correction du problème #2 (CRITIQUE)
1. Modifier `SelectTasksPerRoomDialog.tsx` - interface et handleSave
2. Modifier `AddLogementDialog.tsx` - handleStep5Next
3. Créer fonction helper `mergeTasks()`
4. Tester le flux complet de bout en bout

### Phase 2 : Ajout de l'indicateur visuel (#3)
1. Ajouter le badge "Photo de référence" dans `SelectTasksPerRoomDialog.tsx`
2. Tester l'affichage avec différentes combinaisons de badges

### Phase 3 : Optimisation des performances (#1)
1. Implémenter lazy loading avec placeholder
2. Ajouter gestion d'erreur pour images cassées
3. (Optionnel) Ajouter proxy de compression côté serveur

---

## 🧪 Tests à effectuer

### Test #2 - Persistance des photos
- [ ] Créer une tâche personnalisée avec photo de référence
- [ ] Sélectionner cette tâche dans l'étape 5
- [ ] Finaliser la création du logement/parcours
- [ ] Vérifier que la photo est présente dans le parcours créé
- [ ] Vérifier dans Bubble.io que `photoUrl` est bien sauvegardé

### Test #3 - Indicateur visuel
- [ ] Créer plusieurs tâches : avec/sans photo de référence, avec/sans photo obligatoire
- [ ] Vérifier que les badges s'affichent correctement
- [ ] Vérifier la lisibilité sur mobile et desktop

### Test #1 - Performance
- [ ] Tester le chargement d'images lourdes (>1MB)
- [ ] Vérifier que le placeholder s'affiche pendant le chargement
- [ ] Vérifier la gestion d'erreur pour URLs cassées

