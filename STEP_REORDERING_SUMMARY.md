# Réorganisation des étapes - AddLogementDialog

## 📋 Résumé des modifications

Ce document décrit les modifications apportées au composant `AddLogementDialog.tsx` pour réorganiser l'ordre des étapes du flux de création de logement.

## 🎯 Objectif

Déplacer l'étape d'ajout de photos plus tôt dans le processus, juste après la sélection des pièces, afin de suivre un ordre logique plus naturel où l'utilisateur ajoute les photos de référence avant de configurer les tâches spécifiques.

## 📊 Ancien ordre des étapes

1. **Étape 1** : Informations du logement (nom, adresse, lien Airbnb)
2. **Étape 2** : Type de parcours (ménage ou voyageur)
3. **Étape 3** : Sélection des pièces avec quantités
4. **Étape 4** : Sélection des tâches par pièce
5. **Étape 5** : Questions de sortie
6. **Étape 6** : Ajout de photos

## ✅ Nouvel ordre des étapes

1. **Étape 1** : Informations du logement (nom, adresse, lien Airbnb)
2. **Étape 2** : Type de parcours (ménage ou voyageur)
3. **Étape 3** : Sélection des pièces avec quantités
4. **Étape 4** : **Ajout de photos** ⬅️ DÉPLACÉ ICI
5. **Étape 5** : Sélection des tâches par pièce
6. **Étape 6** : Questions de sortie

## 🔧 Modifications techniques

### 1. Handlers réorganisés

#### `handleStep3Next` (Sélection des pièces)
- **Avant** : Passait à l'étape 4 (tâches)
- **Après** : Passe à l'étape 4 (photos)

#### `handleStep4Next` (Nouveau - Ajout de photos)
- **Fonction** : Sauvegarde les photos et passe à l'étape 5 (tâches)
- **Signature** : `async (photos: Record<string, string[]>) => void`

#### `handleStep5Next` (Sélection des tâches)
- **Avant** : `handleStep4Next` - Passait à l'étape 5 (questions)
- **Après** : Passe à l'étape 6 (questions)

#### `handleStep6Next` (Questions de sortie)
- **Avant** : `handleStep5Next` - Passait à l'étape 6 (photos)
- **Après** : Finalise la création du logement (webhook + fermeture)

### 2. Composants de dialogue réorganisés

```tsx
{/* Étape 3 : Sélection des pièces */}
<SelectRoomsWithQuantityDialog onSave={handleStep3Next} onBack={() => setStep(2)} />

{/* Étape 4 : Ajout de photos */}
<AddPhotosDialog onSave={handleStep4Next} onBack={() => setStep(3)} />

{/* Étape 5 : Sélection des tâches */}
<SelectTasksPerRoomDialog onSave={handleStep5Next} onBack={() => setStep(4)} />

{/* Étape 6 : Questions de sortie */}
<SelectExitQuestionsDialog onSave={handleStep6Next} onBack={() => setStep(5)} />
```

### 3. Logique de finalisation déplacée

La logique de création du logement (appel webhook, toast de succès, fermeture du dialog) a été déplacée de `handleSavePhotos` vers `handleStep6Next`.

## 📝 Fichiers modifiés

- ✅ `src/components/logements/AddLogementDialog.tsx`
- ✅ `src/components/logements/AddPhotosDialog.tsx`
- ✅ `src/components/logements/SelectTasksPerRoomDialog.tsx`
- ✅ `src/components/logements/SelectExitQuestionsDialog.tsx`

## 🔄 Corrections des boutons et numéros d'étapes

### Textes des boutons
- **AddPhotosDialog** : "Terminer" → "Continuer" (ce n'est plus la dernière étape)
- **SelectExitQuestionsDialog** : "Continuer" → "Terminer" (c'est maintenant la dernière étape)

### Numéros d'étapes affichés
- **AddPhotosDialog** : "Étape 6/6" → "Étape 4/6"
- **SelectTasksPerRoomDialog** : "Étape 4/6" → "Étape 5/6"
- **SelectExitQuestionsDialog** : "Étape 5/6" → "Étape 6/6"

## 🧪 Tests recommandés

1. **Test du flux complet** : Créer un logement en passant par toutes les étapes
2. **Test de navigation arrière** : Vérifier que le bouton "Retour" fonctionne correctement à chaque étape
3. **Test avec données Airbnb** : Vérifier que les photos Airbnb sont bien pré-remplies à l'étape 4
4. **Test de validation** : Vérifier que les données sont correctement passées entre les étapes

## ✨ Avantages de cette réorganisation

1. **Ordre logique** : L'utilisateur ajoute d'abord les photos de référence des pièces
2. **Contexte visuel** : Les photos sont disponibles avant de configurer les tâches
3. **Expérience utilisateur** : Flux plus naturel et intuitif
4. **Cohérence** : Les photos générales avant les détails spécifiques

## 🔍 Points d'attention

- Les numéros d'étapes affichés restent cohérents (1-6 ou 1-5 selon le contexte)
- La navigation arrière fonctionne correctement avec les nouveaux numéros d'étape
- Les données sont correctement sauvegardées et passées entre les étapes
- Le webhook final est appelé uniquement à la dernière étape (6)

## 📅 Date de modification

29 décembre 2024

