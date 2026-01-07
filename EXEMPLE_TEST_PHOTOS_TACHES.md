# Exemple de Test - Validation des Solutions

## 🧪 Scénario de test complet

### Objectif
Valider que les 3 problèmes sont résolus en testant le flux complet de création d'un logement avec des tâches personnalisées ayant des photos de référence.

---

## 📝 Étapes du test

### Étape 1 : Créer un nouveau logement
1. Ouvrir l'application
2. Cliquer sur "Ajouter un logement"
3. Remplir :
   - Nom : "Appartement Test Photos"
   - Adresse : "123 Rue de Test, Paris"
4. Cliquer sur "Suivant"

### Étape 2 : Sélectionner le type de parcours
1. Choisir "Ménage"
2. Cliquer sur "Continuer"

### Étape 3 : Sélectionner les pièces
1. Sélectionner "Cuisine" (quantité: 1)
2. Sélectionner "Chambre" (quantité: 2)
3. Cliquer sur "Continuer"

### Étape 4 : Ajouter des photos de pièces (optionnel)
1. Cliquer sur "Continuer" (ou ajouter des photos si souhaité)

### Étape 5 : Sélectionner et personnaliser les tâches

#### Test du Problème #2 (Perte des photos)

**5.1 - Créer une tâche personnalisée avec photo de référence**
1. Dans la section "Cuisine", cliquer sur "+ Ajouter une tâche"
2. Remplir :
   - Titre : "Nettoyer le four"
   - Consigne : "Utiliser le produit spécial four, bien rincer"
3. Cliquer sur "Photo facultative"
4. Uploader une image (ex: photo d'un four propre)
5. **✅ VALIDATION PROBLÈME #1** : Vérifier que :
   - Un spinner "Upload en cours..." s'affiche
   - Puis un message "✅ Photo uploadée" apparaît
   - L'image s'affiche dans le preview
6. Cocher "Demander une photo pour valider la tâche"
7. Cliquer sur "Ajouter To Do"

**5.2 - Vérifier l'indicateur visuel**
1. **✅ VALIDATION PROBLÈME #3** : Dans la liste des tâches de "Cuisine", vérifier que la tâche "Nettoyer le four" affiche :
   - 🖼️ Badge "Photo de référence" (bleu)
   - 📷 Badge "Photo obligatoire" (primary)

**5.3 - Modifier une tâche par défaut**
1. Cliquer sur l'icône crayon ✏️ de la tâche "Vaisselle propre"
2. Ajouter une photo de référence (ex: photo de vaisselle rangée)
3. **✅ VALIDATION PROBLÈME #1** : Vérifier le feedback de chargement
4. Cliquer sur "Enregistrer"
5. **✅ VALIDATION PROBLÈME #3** : Vérifier que le badge "🖼️ Photo de référence" apparaît

**5.4 - Sélectionner les tâches**
1. Cocher les tâches :
   - ✅ Nettoyer le four (custom avec photo)
   - ✅ Vaisselle propre (modifiée avec photo)
   - ✅ Plan de travail
2. Dans "Chambre", sélectionner quelques tâches par défaut
3. Cliquer sur "Continuer"

### Étape 6 : Questions de sortie
1. Sélectionner quelques questions (optionnel)
2. Cliquer sur "Créer le logement"

---

## ✅ Validations à effectuer

### Validation dans l'interface

**Immédiatement après la création :**
1. Le logement apparaît dans la liste
2. Un message de succès s'affiche

### Validation dans Bubble.io

**Ouvrir Bubble.io et vérifier :**

1. **Vérifier le modèle de conciergerie** :
   - Aller dans Data → Modèles personnalisés
   - Trouver "Modèle Conciergerie Ménage"
   - Ouvrir les "pieces"
   - Trouver la pièce "Cuisine"
   - Vérifier "tachesDisponibles"
   - **✅ VALIDATION PROBLÈME #2** : Vérifier que les tâches contiennent :
     ```json
     {
       "id": "custom-...",
       "titre": "Nettoyer le four",
       "photoUrl": "https://eb0bcaf95c312d7fe9372017cb5f1835.cdn.bubble.io/...",
       "photoObligatoire": true
     }
     ```

2. **Vérifier le parcours créé** :
   - Aller dans Data → Parcours
   - Trouver le parcours "Appartement Test Photos - Ménage"
   - Ouvrir les "pieces"
   - Vérifier que les tâches ont bien leurs `photoUrl`

---

## 🔍 Points de contrôle détaillés

### Problème #1 - Performance
- [ ] Spinner visible pendant l'upload
- [ ] Message de succès après upload
- [ ] Placeholder "Chargement..." visible lors de l'ouverture d'une tâche avec photo
- [ ] Image s'affiche correctement après chargement
- [ ] Message d'erreur si URL cassée (tester avec URL invalide)

### Problème #2 - Perte des photos
- [ ] `photoUrl` présent dans `customTasksPerRoom` (vérifier dans console)
- [ ] `photoUrl` présent dans le modèle de conciergerie (Bubble.io)
- [ ] `photoUrl` présent dans le parcours créé (Bubble.io)
- [ ] Les modifications de tâches par défaut sont sauvegardées
- [ ] Les tâches personnalisées sont sauvegardées

### Problème #3 - Indicateur visuel
- [ ] Badge "🖼️ Photo de référence" visible pour tâches avec photo
- [ ] Badge "📷 Photo obligatoire" visible pour tâches avec photoObligatoire
- [ ] Les deux badges peuvent coexister
- [ ] Pas de badge si pas de photo
- [ ] Responsive : badges visibles sur mobile et desktop

---

## 🐛 Tests de régression

### Vérifier que le reste fonctionne toujours

1. **Tâches par défaut sans modification** :
   - [ ] Les tâches par défaut s'affichent correctement
   - [ ] Peuvent être sélectionnées/désélectionnées
   - [ ] Sont sauvegardées correctement

2. **Flux Airbnb** :
   - [ ] Le scraping Airbnb fonctionne toujours
   - [ ] Les photos de pièces Airbnb sont récupérées
   - [ ] Les pièces Airbnb sont mappées correctement

3. **Modèles personnalisés** :
   - [ ] Les modèles personnalisés se chargent correctement
   - [ ] Peuvent être édités
   - [ ] Peuvent être supprimés

---

## 📊 Résultats attendus

### ✅ Succès si :
1. Toutes les validations sont passées
2. Les `photoUrl` sont présents dans Bubble.io
3. Les badges s'affichent correctement
4. Le feedback de chargement fonctionne
5. Aucune régression détectée

### ❌ Échec si :
1. `photoUrl` manquant dans Bubble.io
2. Badges ne s'affichent pas
3. Pas de feedback pendant le chargement
4. Erreurs dans la console
5. Régression sur fonctionnalités existantes

---

## 🔧 Debugging

### Si le test échoue

**Problème #2 - photoUrl manquant :**
1. Ouvrir la console du navigateur
2. Chercher les logs :
   - `🔄 Converting task photos...`
   - `✅ Converted: [nom de la tâche]`
3. Vérifier le payload envoyé à `/api/send-modele-webhook`
4. Vérifier que `mergeTasksWithCustoms` est appelé

**Problème #3 - Badge manquant :**
1. Inspecter l'élément de la tâche
2. Vérifier que `task.photoUrl` existe
3. Vérifier la condition `{task.photoUrl && ...}`

**Problème #1 - Pas de feedback :**
1. Vérifier que les états `isLoadingImage` et `imageLoadError` sont définis
2. Vérifier que `onLoad` et `onError` sont appelés
3. Vérifier dans la console les événements de chargement

---

## 📝 Rapport de test

### Template de rapport

```markdown
# Rapport de Test - Photos de Référence des Tâches

**Date** : [Date du test]
**Testeur** : [Nom]
**Version** : [Version de l'app]

## Résultats

### Problème #1 - Performance
- [ ] ✅ / ❌ Feedback de chargement
- [ ] ✅ / ❌ Gestion d'erreur
- **Notes** : 

### Problème #2 - Perte des photos
- [ ] ✅ / ❌ photoUrl dans Bubble.io (modèle)
- [ ] ✅ / ❌ photoUrl dans Bubble.io (parcours)
- **Notes** : 

### Problème #3 - Indicateur visuel
- [ ] ✅ / ❌ Badge "Photo de référence"
- [ ] ✅ / ❌ Responsive
- **Notes** : 

## Conclusion
- [ ] ✅ Tous les tests passés
- [ ] ❌ Échecs détectés (voir notes)
```

