# 🎯 Configuration des Valeurs Dynamiques dans Bubble

Ce guide explique comment configurer les valeurs dynamiques dans votre plugin Bubble pour passer les bonnes données à votre application React.

---

## 📋 Vue d'ensemble

Votre plugin doit passer ces informations à l'application React :

| Donnée | Source Bubble | Exemple de valeur |
|--------|---------------|-------------------|
| Conciergerie ID | `Current User's Conciergerie's _id` | `1730741276842x778024514623373300` |
| User ID | `Current User's _id` | `1730741188020x554510837711264200` |
| Logement ID | `Current Page Logement's _id` | `1746548810037x386469807784722400` |
| Langue | Détectée automatiquement par Weglot | `fr`, `en`, `pt`, `es`, `ar`, `de` |

---

## 🔧 Configuration étape par étape

### Étape 1 : Ajouter l'élément sur votre page

1. Ouvrez votre page Bubble
2. Dans la palette d'éléments, cherchez **"Parcours Viewer"**
3. Glissez-déposez l'élément sur votre page
4. Redimensionnez-le (par exemple : largeur 100%, hauteur 600px)

### Étape 2 : Configurer la Base URL

Dans l'inspecteur de propriétés, trouvez **"Base URL"** :

**Valeur à entrer :**
```
https://app-production-01a1.up.railway.app/api/send-webhook
```

> ⚠️ **Important** : N'ajoutez PAS de `?` à la fin, le plugin le fera automatiquement

---

### Étape 3 : Configurer Conciergerie ID

**Propriété** : `Conciergerie ID`

**Valeur dynamique** :
```
Current User's Conciergerie's _id
```

**Comment faire :**
1. Cliquez sur le champ "Conciergerie ID"
2. Cliquez sur **"Insert dynamic data"**
3. Sélectionnez **"Current User"**
4. Puis **"'s Conciergerie"**
5. Puis **"'s _id"**

**Résultat dans Bubble :**
```
Current User's Conciergerie's _id
```

---

### Étape 4 : Configurer User ID

**Propriété** : `User ID`

**Valeur dynamique** :
```
Current User's _id
```

**Comment faire :**
1. Cliquez sur le champ "User ID"
2. Cliquez sur **"Insert dynamic data"**
3. Sélectionnez **"Current User"**
4. Puis **"'s _id"**

**Résultat dans Bubble :**
```
Current User's _id
```

---

### Étape 5 : Configurer Logement ID

**Propriété** : `Logement ID`

**Valeur dynamique** :
```
Current Page Logement's _id
```

**Comment faire :**
1. Cliquez sur le champ "Logement ID"
2. Cliquez sur **"Insert dynamic data"**
3. Sélectionnez **"Current Page Logement"** (ou la source de données appropriée)
4. Puis **"'s _id"**

**Alternatives possibles :**
- Si vous êtes sur une page de liste : `RepeatingGroup's Logement's _id`
- Si vous passez un paramètre d'URL : `Get data from page URL > logementID`
- Si vous avez un état personnalisé : `Custom State Logement's _id`

**Résultat dans Bubble :**
```
Current Page Logement's _id
```

---

### Étape 6 : Configurer View Mode

**Propriété** : `View Mode`

**Valeur statique :**
```
full
```

**Comment faire :**
1. Cliquez sur le champ "View Mode"
2. Tapez directement : `full`

**Ou valeur dynamique conditionnelle :**

Si vous voulez changer le mode selon une condition :

```
This Parcours Viewer is visible:yes → full
This Parcours Viewer is visible:no → normal
```

---

### Étape 7 : Configurer Version Test

**Propriété** : `Version Test`

**Valeur :**
```
yes (coché)
```

**Comment faire :**
1. Cochez simplement la case "Version Test"

**Ou valeur dynamique :**

Si vous voulez activer/désactiver selon une condition :

```
Current User's is_admin is "yes" → yes
Current User's is_admin is "no" → no
```

---

### Étape 8 : Configurer Test Value

**Propriété** : `Test Value`

**Valeur statique :**
```
0104434342
```

**Comment faire :**
1. Cliquez sur le champ "Test Value"
2. Tapez directement : `0104434342`

**Ou valeur dynamique :**

Si vous voulez utiliser une valeur de votre base de données :

```
Current User's phone_number
```

---

### Étape 9 : Configurer Auto Detect Language

**Propriété** : `Auto Detect Language`

**Valeur :**
```
yes (coché)
```

**Comment faire :**
1. Cochez simplement la case "Auto Detect Language"

> ✅ **Recommandé** : Laissez cette option cochée pour que le plugin détecte automatiquement la langue Weglot

---

## 📊 Résumé de la configuration

Voici à quoi devrait ressembler votre configuration finale :

```
┌──────────────────────────────────────────────────────────────┐
│ Parcours Viewer                                              │
├──────────────────────────────────────────────────────────────┤
│ Base URL:                                                    │
│   https://app-production-01a1.up.railway.app/api/send-webhook│
│                                                              │
│ Conciergerie ID:                                             │
│   Current User's Conciergerie's _id                          │
│                                                              │
│ User ID:                                                     │
│   Current User's _id                                         │
│                                                              │
│ Logement ID:                                                 │
│   Current Page Logement's _id                                │
│                                                              │
│ View Mode:                                                   │
│   full                                                       │
│                                                              │
│ Version Test:                                                │
│   ✓ yes                                                      │
│                                                              │
│ Test Value:                                                  │
│   0104434342                                                 │
│                                                              │
│ Auto Detect Language:                                        │
│   ✓ yes                                                      │
│                                                              │
│ Manual Language:                                             │
│   (vide)                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Tester la configuration

### Test 1 : Vérifier les valeurs dans la console

1. Ouvrez votre page en mode **Preview**
2. Ouvrez la console du navigateur (F12)
3. Vous devriez voir :

```
🔌 Plugin Parcours Iframe initialisé
🌍 Langue détectée depuis sous-domaine: fr
📺 Iframe créée
📍 Iframe URL mise à jour: https://app-production-01a1.up.railway.app/api/send-webhook?lang=fr&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Test 2 : Vérifier que les IDs sont corrects

Dans la console, copiez l'URL de l'iframe et vérifiez que :

✅ `conciergerieID` correspond à l'ID de la conciergerie de l'utilisateur  
✅ `userID` correspond à l'ID de l'utilisateur connecté  
✅ `logementid` correspond à l'ID du logement affiché  

---

## 🐛 Dépannage

### Les IDs sont vides ou "undefined"

**Problème** : L'URL contient `conciergerieID=undefined`

**Solutions** :
1. Vérifiez que l'utilisateur est bien connecté
2. Vérifiez que l'utilisateur a bien une conciergerie associée
3. Vérifiez que le champ "Conciergerie" existe dans votre type de données "User"

### Le Logement ID est vide

**Problème** : L'URL contient `logementid=` (vide)

**Solutions** :
1. Vérifiez que vous êtes sur une page qui a un logement en contexte
2. Vérifiez que la source de données est correcte (Current Page Logement, RepeatingGroup, etc.)
3. Si le logement est optionnel, c'est normal qu'il soit vide sur certaines pages

### L'iframe ne se charge pas

**Problème** : L'iframe est vide

**Solutions** :
1. Vérifiez que la Base URL est correcte
2. Vérifiez qu'il n'y a pas d'erreur dans la console
3. Vérifiez que Railway est bien déployé et accessible

---

## 💡 Astuces

### Utiliser des conditions

Vous pouvez rendre certains paramètres conditionnels :

**Exemple** : N'afficher le plugin que si l'utilisateur a une conciergerie

1. Sélectionnez l'élément "Parcours Viewer"
2. Dans l'onglet **"Conditional"**, ajoutez :
   ```
   When Current User's Conciergerie is empty
   → This element is visible: no
   ```

### Déboguer les valeurs

Pour voir les valeurs avant qu'elles soient passées au plugin :

1. Ajoutez un élément **Text** sur votre page
2. Configurez-le avec :
   ```
   Current User's Conciergerie's _id
   ```
3. Vérifiez que la valeur s'affiche correctement

---

## ✅ Checklist de configuration

- [ ] Base URL configurée
- [ ] Conciergerie ID configuré avec valeur dynamique
- [ ] User ID configuré avec valeur dynamique
- [ ] Logement ID configuré (si applicable)
- [ ] View Mode configuré
- [ ] Version Test activé
- [ ] Test Value configuré
- [ ] Auto Detect Language activé
- [ ] Test en mode Preview effectué
- [ ] Vérification console effectuée
- [ ] URL générée vérifiée

---

**Votre plugin est maintenant configuré !** 🎉

Passez à l'étape suivante : tester avec différentes langues Weglot !

