# Solutions pour les Problèmes de Photos de Référence des Tâches

## 🎯 Objectif
Corriger les 3 problèmes identifiés dans le système de gestion des photos de référence des tâches.

---

## 🔴 SOLUTION #2 : Corriger la perte des photos (PRIORITÉ CRITIQUE)

### Fichiers à modifier

#### 1. `src/components/logements/SelectTasksPerRoomDialog.tsx`

**Modification de l'interface :**
```typescript
interface SelectTasksPerRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  parcoursType: "menage" | "voyageur";
  selectedRooms: PieceQuantity[];
  modeleData?: PieceModele[];
  onSave: (
    tasksPerRoom: Map<string, string[]>,
    customTasks: Map<string, TacheModele[]>,           // ✅ NOUVEAU
    modifiedPhotoObligatoire: Map<string, boolean>     // ✅ NOUVEAU
  ) => void;
  onBack?: () => void;
  isFullScreenMode?: boolean;
}
```

**Modification de handleSave (ligne 125-127) :**
```typescript
const handleSave = () => {
  onSave(selectedTasksPerRoom, customTasksPerRoom, modifiedPhotoObligatoire);
};
```

#### 2. `src/components/logements/AddLogementDialog.tsx`

**Modification de handleStep5Next (ligne 318-338) :**
```typescript
const handleStep5Next = async (
  tasksPerRoom: Map<string, string[]>,
  customTasks: Map<string, TacheModele[]>,           // ✅ NOUVEAU
  modifiedPhotoObligatoire: Map<string, boolean>     // ✅ NOUVEAU
) => {
  setSelectedTasksPerRoom(tasksPerRoom);

  if (!conciergerieModele || !parcoursType) return;

  try {
    // Obtenir la source des tâches selon le type de parcours
    const allTasksSource = parcoursType === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;

    // ✅ Fusionner les tâches par défaut avec les customs et les modifications
    const mergedTasksSource = mergeTasksWithCustoms(
      allTasksSource,
      customTasks,
      modifiedPhotoObligatoire
    );

    // Mettre à jour le modèle avec les tâches sélectionnées
    const updatedModele = updateModeleTasks(conciergerieModele, tasksPerRoom, mergedTasksSource);
    await updateConciergerieModele(updatedModele, getConciergerieID(), getIsTestMode());
    setConciergerieModele(updatedModele);

    console.log(`✅ Modèle mis à jour avec les tâches sélectionnées`);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du modèle:", error);
  }

  // Passer à l'étape 6 (questions de sortie)
  setStep(6);
};
```

**Ajouter la fonction helper (avant le return du composant) :**
```typescript
/**
 * Fusionne les tâches par défaut avec les tâches personnalisées et les modifications
 */
function mergeTasksWithCustoms(
  defaultTasks: Record<string, TacheModele[]>,
  customTasks: Map<string, TacheModele[]>,
  modifiedPhotoObligatoire: Map<string, boolean>
): Record<string, TacheModele[]> {
  const merged: Record<string, TacheModele[]> = {};

  // Copier les tâches par défaut et appliquer les modifications de photoObligatoire
  Object.keys(defaultTasks).forEach(roomName => {
    merged[roomName] = defaultTasks[roomName].map(task => {
      const modifiedValue = modifiedPhotoObligatoire.get(task.id);
      if (modifiedValue !== undefined) {
        return { ...task, photoObligatoire: modifiedValue };
      }
      return task;
    });
  });

  // Ajouter les tâches personnalisées
  customTasks.forEach((tasks, roomName) => {
    if (!merged[roomName]) {
      merged[roomName] = [];
    }
    merged[roomName] = [...merged[roomName], ...tasks];
  });

  return merged;
}
```

**Modifier l'appel à SelectTasksPerRoomDialog (ligne 745-764) :**
```typescript
{step === 5 && parcoursType && conciergerieModele && (
  <SelectTasksPerRoomDialog
    open={step === 5}
    onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}
    logementNom={nom}
    parcoursType={parcoursType}
    selectedRooms={selectedRooms}
    modeleData={conciergerieModele.pieces}
    onSave={handleStep5Next}  // ✅ Signature mise à jour automatiquement
    onBack={() => {
      setTimeout(() => setStep(4), 100);
    }}
    isFullScreenMode={isFullScreenMode}
  />
)}
```

---

## 🟡 SOLUTION #3 : Ajouter l'indicateur visuel (PRIORITÉ HAUTE)

### Fichier à modifier : `src/components/logements/SelectTasksPerRoomDialog.tsx`

**Modifier le rendu de chaque tâche (ligne 320-368) :**
```typescript
<Label
  htmlFor={`task-${roomName}-${task.id}`}
  className="flex-1 cursor-pointer min-w-0"
>
  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
    <span className="text-sm sm:text-base">{task.emoji}</span>
    <span className="font-medium text-xs sm:text-sm">{task.titre}</span>
    
    {/* ✅ NOUVEAU : Badge pour photo de référence */}
    {task.photoUrl && (
      <Badge 
        variant="secondary" 
        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
      >
        🖼️ Photo de référence
      </Badge>
    )}
    
    {task.photoObligatoire && (
      <Badge
        variant="default"
        className="text-xs bg-primary hover:bg-primary/90 cursor-pointer transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleTogglePhotoObligatoire(roomName, task);
        }}
      >
        📷 Photo obligatoire
      </Badge>
    )}
    {!task.photoObligatoire && (
      <Badge
        variant="outline"
        className="text-xs cursor-pointer transition-colors hover:bg-accent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleTogglePhotoObligatoire(roomName, task);
        }}
      >
        📷 Ajouter photo
      </Badge>
    )}
  </div>
  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
    {task.description}
  </p>
</Label>
```

---

## 🟢 SOLUTION #1 : Améliorer les performances de chargement (PRIORITÉ MOYENNE)

### Fichier à modifier : `src/components/parcours/dialogs/TacheDialog.tsx`

**Ajouter les états pour le chargement (après ligne 50) :**
```typescript
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
const [isLoadingImage, setIsLoadingImage] = useState(false);      // ✅ NOUVEAU
const [imageLoadError, setImageLoadError] = useState(false);      // ✅ NOUVEAU
const fileInputRef = useRef<HTMLInputElement>(null);
const { toast } = useToast();
```

**Réinitialiser les états lors de l'ouverture (modifier useEffect ligne 55-73) :**
```typescript
useEffect(() => {
  if (tache) {
    setFormData({
      emoji: tache.emoji,
      titre: tache.titre,
      description: tache.description,
      photoObligatoire: tache.photoObligatoire
    });
    setPhotoPreview(tache.photoUrl || null);
    setIsLoadingImage(!!tache.photoUrl);  // ✅ NOUVEAU
    setImageLoadError(false);             // ✅ NOUVEAU
  } else {
    setFormData({
      emoji: "",
      titre: "",
      description: "",
      photoObligatoire: false
    });
    setPhotoPreview(null);
    setIsLoadingImage(false);             // ✅ NOUVEAU
    setImageLoadError(false);             // ✅ NOUVEAU
  }
}, [tache, open]);
```

**Modifier le rendu de l'image (ligne 195-233) :**
```typescript
<div
  onClick={handlePhotoClick}
  className="mt-1.5 flex aspect-video items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer overflow-hidden relative"
>
  {photoPreview ? (
    <>
      {/* ✅ NOUVEAU : Placeholder pendant le chargement */}
      {isLoadingImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 text-muted-foreground animate-spin" />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Chargement...
            </p>
          </div>
        </div>
      )}

      {/* ✅ NOUVEAU : Message d'erreur si l'image ne charge pas */}
      {imageLoadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="text-center p-2">
            <p className="text-xs text-destructive">
              ⚠️ Image non disponible
            </p>
          </div>
        </div>
      )}

      <img
        src={photoPreview}
        alt="Preview"
        className="w-full h-full object-cover"
        onLoad={() => setIsLoadingImage(false)}           // ✅ NOUVEAU
        onError={() => {                                   // ✅ NOUVEAU
          setIsLoadingImage(false);
          setImageLoadError(true);
        }}
      />

      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 z-20"
        onClick={(e) => {
          e.stopPropagation();
          handleRemovePhoto();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </>
  ) : isUploadingPhoto ? (
    <div className="text-center p-2">
      <Loader2 className="mx-auto h-6 w-6 text-muted-foreground/50 animate-spin" />
      <p className="mt-1 text-[10px] text-muted-foreground">
        Upload en cours...
      </p>
    </div>
  ) : (
    <div className="text-center p-2">
      <Upload className="mx-auto h-6 w-6 text-muted-foreground/50" />
      <p className="mt-1 text-[10px] text-muted-foreground">
        Ajouter une image
      </p>
    </div>
  )}
</div>
```

**Modifier handleRemovePhoto (ligne 123-128) :**
```typescript
const handleRemovePhoto = () => {
  setPhotoPreview(null);
  setIsLoadingImage(false);      // ✅ NOUVEAU
  setImageLoadError(false);      // ✅ NOUVEAU
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
```

---

## 📋 Checklist d'implémentation

### Phase 1 : Problème #2 (CRITIQUE)
- [ ] Modifier `SelectTasksPerRoomDialog.tsx` - interface
- [ ] Modifier `SelectTasksPerRoomDialog.tsx` - handleSave
- [ ] Modifier `AddLogementDialog.tsx` - handleStep5Next signature
- [ ] Ajouter fonction `mergeTasksWithCustoms` dans `AddLogementDialog.tsx`
- [ ] Tester : créer tâche avec photo → vérifier sauvegarde dans Bubble.io

### Phase 2 : Problème #3 (HAUTE)
- [ ] Ajouter badge "Photo de référence" dans `SelectTasksPerRoomDialog.tsx`
- [ ] Tester affichage avec différentes combinaisons de badges
- [ ] Vérifier responsive mobile/desktop

### Phase 3 : Problème #1 (MOYENNE)
- [ ] Ajouter états `isLoadingImage` et `imageLoadError` dans `TacheDialog.tsx`
- [ ] Modifier useEffect pour réinitialiser les états
- [ ] Ajouter placeholder de chargement dans le rendu
- [ ] Ajouter gestion d'erreur pour images cassées
- [ ] Tester avec images lourdes et URLs cassées

---

## 🧪 Tests de validation

### Test complet du flux
1. Créer un nouveau logement/parcours
2. À l'étape 5, créer une tâche personnalisée avec photo de référence
3. Vérifier que le badge "🖼️ Photo de référence" s'affiche
4. Sélectionner cette tâche
5. Finaliser la création
6. Vérifier dans Bubble.io que la tâche contient bien `photoUrl`
7. Vérifier que l'image se charge correctement avec le placeholder

### Test de performance
1. Uploader une image lourde (>2MB)
2. Vérifier que le placeholder "Chargement..." s'affiche
3. Vérifier que l'image se charge correctement
4. Tester avec une URL cassée → vérifier message d'erreur

### Test de régression
1. Vérifier que les tâches par défaut fonctionnent toujours
2. Vérifier que les modifications de `photoObligatoire` sont sauvegardées
3. Vérifier que le flux Airbnb fonctionne toujours

