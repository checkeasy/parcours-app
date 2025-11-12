# 📊 État de la Traduction

Ce document liste l'état de la traduction de l'application.

**Dernière mise à jour :** $(date)

---

## ✅ Fichiers traduits

### 1. **src/App.tsx** ✅ (Traduit)

**Textes traduits :**
- ✅ Titre de l'application : `t('app.title')`
- ✅ Description : `t('app.description')`
- ✅ Bouton "Ajouter un logement" : `t('logement.createNew')`
- ✅ Bouton "Recharger les modèles" : `t('modele.create')`
- ✅ "Chargement..." : `t('common.loading')`
- ✅ Toast erreur : `t('toast.error')`, `t('toast.modelesLoadError')`
- ✅ Toast succès : `t('toast.logementCreated')`
- ✅ Type de parcours : `t('parcours.menage')`, `t('parcours.voyageur')`
- ✅ Titre des cartes de logements

**Statut :** ✅ **Complet**

---

### 2. **src/components/logements/AddLogementDialog.tsx** ✅ (Partiellement traduit)

**Textes traduits :**

**Étape 1 - Informations du logement :**
- ✅ Titre de l'étape : `t('logement.step')` + `t('logement.createNew')`
- ✅ Description : `t('logement.basicInfo')`
- ✅ Label "Nom du logement" : `t('logement.name')`
- ✅ "Obligatoire" : `t('logement.nameRequired')`
- ✅ Placeholder : `t('logement.namePlaceholder')`
- ✅ Label "Adresse" : `t('logement.address')`
- ✅ Placeholder adresse : `t('logement.addressPlaceholder')`
- ✅ Label "Lien Airbnb" : `t('logement.airbnbLink')`
- ✅ Description Airbnb : `t('logement.airbnbLinkDescription')`
- ✅ Placeholder Airbnb : `t('logement.airbnbLinkPlaceholder')`
- ✅ Bouton "Suivant" : `t('logement.next')`

**Étape 2 - Type de parcours :**
- ✅ Titre de l'étape : `t('logement.step')` + `t('parcours.chooseType')`
- ✅ Description : `t('parcours.chooseTypeDescription')`
- ✅ Carte "Agents de ménage" : `t('parcours.menage')`
- ✅ Description ménage : `t('parcours.menageDescription')`
- ✅ Carte "Voyageur" : `t('parcours.voyageur')`
- ✅ Description voyageur : `t('parcours.voyageurDescription')`

**Étape 3 - Sélection du modèle :**
- ✅ Titre de l'étape : `t('logement.step')` + `t('parcours.selectModel')`
- ✅ Description : `t('parcours.selectModelDescription')`

**Statut :** ✅ **Étapes 1, 2, 3 traduites** | ⏳ **Étapes 4, 5, 6 à traduire**

---

## ⏳ Fichiers à traduire

### 3. **src/components/logements/AddLogementDialog.tsx** (Suite) ⏳

**Textes à traduire :**
- Étapes du formulaire ("Étape 1/5", etc.)
- Labels des champs (Nom, Adresse, Lien Airbnb)
- Boutons (Suivant, Retour, Fermer)
- Messages de validation
- Descriptions

**Estimation :** ~50 chaînes de texte

### 3. **src/components/logements/AddPhotosDialog.tsx** ⏳

**Textes à traduire :**
- Titre du dialog
- Instructions d'upload
- Boutons
- Messages d'erreur

**Estimation :** ~20 chaînes de texte

### 4. **src/components/parcours/dialogs/SelectModeleDialog.tsx** ⏳

**Textes à traduire :**
- Titre
- Descriptions des modèles
- Boutons de sélection

**Estimation :** ~15 chaînes de texte

### 5. **src/components/parcours/dialogs/SelectPiecesDialog.tsx** ⏳

**Textes à traduire :**
- Titre
- Labels des pièces
- Boutons

**Estimation :** ~15 chaînes de texte

### 6. **src/components/parcours/modele/CustomModeleBuilder.tsx** ⏳

**Textes à traduire :**
- Interface de création de modèle
- Boutons d'action
- Messages de validation

**Estimation :** ~30 chaînes de texte

---

## 📋 Clés de traduction disponibles

### **app**
- `app.title` - Titre de l'application
- `app.description` - Description

### **logement**
- `logement.step` - "Étape {{current}}/{{total}}"
- `logement.createNew` - "Créer un nouveau logement"
- `logement.basicInfo` - "Entrez les informations de base"
- `logement.name` - "Nom du logement"
- `logement.nameRequired` - "Requis"
- `logement.namePlaceholder` - "Ex: Appartement Paris Centre"
- `logement.address` - "Adresse postale (facultatif)"
- `logement.addressPlaceholder` - "Ex: 15 Rue de la Paix..."
- `logement.airbnbLink` - "Lien Airbnb (facultatif)"
- `logement.airbnbLinkDescription` - "Nous utiliserons ce lien..."
- `logement.airbnbLinkPlaceholder` - "https://www.airbnb.fr/rooms/..."
- `logement.next` - "Suivant"
- `logement.back` - "Retour"
- `logement.close` - "Fermer"

### **parcours**
- `parcours.chooseType` - "Choisir le type de parcours"
- `parcours.chooseTypeDescription` - "Sélectionnez le type..."
- `parcours.menage` - "Parcours de ménage"
- `parcours.menageDescription` - "Pour les équipes de ménage"
- `parcours.voyageur` - "Parcours voyageur"
- `parcours.voyageurDescription` - "Pour les voyageurs et invités"
- `parcours.selectModel` - "Sélection du modèle"
- `parcours.selectModelDescription` - "Choisissez un modèle..."

### **pieces**
- `pieces.title` - "Pièces"
- `pieces.selectPieces` - "Sélectionner les pièces"
- `pieces.addPhotos` - "Ajouter des photos"

### **airbnb**
- `airbnb.analyzing` - "Analyse en cours..."
- `airbnb.loading` - "Chargement..."
- `airbnb.extracting` - "Extraction des données Airbnb"
- `airbnb.results` - "Résultats de l'analyse Airbnb"
- `airbnb.confirm` - "Confirmer"
- `airbnb.cancel` - "Annuler"

### **modele**
- `modele.custom` - "Modèle personnalisé"
- `modele.predefined` - "Modèle prédéfini"
- `modele.create` - "Recharger les modèles"
- `modele.edit` - "Modifier le modèle"
- `modele.delete` - "Supprimer le modèle"
- `modele.save` - "Enregistrer"
- `modele.cancel` - "Annuler"

### **common**
- `common.loading` - "Chargement..."
- `common.error` - "Erreur"
- `common.success` - "Succès"
- `common.confirm` - "Confirmer"
- `common.cancel` - "Annuler"
- `common.save` - "Enregistrer"
- `common.delete` - "Supprimer"
- `common.edit` - "Modifier"
- `common.close` - "Fermer"
- `common.next` - "Suivant"
- `common.back` - "Retour"
- `common.required` - "Requis"
- `common.optional` - "Facultatif"

### **toast**
- `toast.logementCreated` - "Logement créé avec succès"
- `toast.logementUpdated` - "Logement mis à jour"
- `toast.modeleCreated` - "Modèle créé avec succès"
- `toast.modeleUpdated` - "Modèle mis à jour"
- `toast.modeleDeleted` - "Modèle supprimé"
- `toast.error` - "Une erreur est survenue"
- `toast.loadingModeles` - "Chargement des modèles..."
- `toast.modelesLoaded` - "Modèles chargés avec succès"
- `toast.modelesLoadError` - "Impossible de charger les modèles..."

---

## 🎯 Prochaines étapes

### Priorité 1 : Composants principaux
1. ✅ `src/App.tsx` - **Fait partiellement**
2. ⏳ `src/components/logements/AddLogementDialog.tsx` - **À faire**
3. ⏳ `src/components/logements/AddPhotosDialog.tsx` - **À faire**

### Priorité 2 : Dialogs de parcours
4. ⏳ `src/components/parcours/dialogs/SelectModeleDialog.tsx`
5. ⏳ `src/components/parcours/dialogs/SelectPiecesDialog.tsx`

### Priorité 3 : Autres composants
6. ⏳ `src/components/parcours/modele/CustomModeleBuilder.tsx`
7. ⏳ Autres composants UI

---

## 📝 Comment traduire un composant

### Étape 1 : Importer useTranslation

```tsx
import { useTranslation } from 'react-i18next';
```

### Étape 2 : Utiliser le hook

```tsx
function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('logement.createNew')}</h1>
    </div>
  );
}
```

### Étape 3 : Remplacer les textes en dur

**Avant :**
```tsx
<Button>Ajouter un logement</Button>
```

**Après :**
```tsx
<Button>{t('logement.createNew')}</Button>
```

### Étape 4 : Ajouter les clés manquantes

Si une clé n'existe pas dans les fichiers de traduction, ajoutez-la dans tous les fichiers :
- `src/i18n/locales/fr.json`
- `src/i18n/locales/en.json`
- `src/i18n/locales/pt.json`
- `src/i18n/locales/es.json`
- `src/i18n/locales/ar.json`
- `src/i18n/locales/de.json`

---

## ✅ Checklist

- [x] Configuration i18n
- [x] Fichiers de traduction (6 langues)
- [x] Traduction partielle de App.tsx
- [ ] Traduction de AddLogementDialog.tsx
- [ ] Traduction de AddPhotosDialog.tsx
- [ ] Traduction des dialogs de parcours
- [ ] Traduction du CustomModeleBuilder
- [ ] Tests de toutes les langues

---

**Voulez-vous que je continue la traduction des autres composants ?** 🚀

