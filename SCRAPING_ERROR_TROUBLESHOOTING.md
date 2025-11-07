# 🔧 Dépannage des erreurs de scraping Airbnb

## ❌ Erreur : `'NoneType' object has no attribute 'lower'`

### 📋 Description

Cette erreur provient du **service Python de scraping Airbnb** (hébergé sur Railway).

```
Error: Erreur lors de l'extraction: Erreur: 'NoneType' object has no attribute 'lower'
```

### 🔍 Cause

Le service Python essaie d'appeler la méthode `.lower()` sur une variable qui est `None` (équivalent de `null` en JavaScript).

Cela arrive généralement quand :

1. **Nom de pièce manquant** : Une pièce dans l'annonce Airbnb n'a pas de nom (`room_name` est `None`)
2. **Type de pièce manquant** : Une pièce n'a pas de type défini (`room_type` est `None`)
3. **Données incomplètes** : L'annonce Airbnb ne contient pas toutes les informations attendues
4. **Format d'annonce non supporté** : L'annonce Airbnb a un format différent de celui attendu

### 🛠️ Solutions

#### 1. Vérifier l'URL Airbnb

Assurez-vous que :
- ✅ L'URL est une URL Airbnb valide (contient `airbnb.com` ou `airbnb.fr`)
- ✅ L'annonce existe et est accessible publiquement
- ✅ L'annonce contient des informations sur les pièces (room tour)

#### 2. Tester avec une autre annonce

Essayez avec une annonce Airbnb différente pour voir si le problème persiste.

#### 3. Vérifier les logs du service Python

Le service Python est hébergé sur Railway : `https://scraping-airbnb-production.up.railway.app`

Consultez les logs Railway pour voir l'erreur exacte côté Python.

#### 4. Corriger le service Python

Le problème doit être corrigé dans le **code Python** du service de scraping.

**Exemple de correction Python :**

```python
# ❌ Code qui cause l'erreur
room_name = data.get('room_name')
room_name_lower = room_name.lower()  # Erreur si room_name est None

# ✅ Code corrigé
room_name = data.get('room_name')
if room_name:
    room_name_lower = room_name.lower()
else:
    room_name_lower = 'pièce sans nom'
```

### 📊 Améliorations apportées côté Node.js

Les améliorations suivantes ont été ajoutées dans `server/services/airbnbScrapingServiceV2.ts` :

1. **Validation de l'URL** avant envoi au service Python
2. **Message d'erreur explicite** pour l'utilisateur
3. **Logs détaillés** pour faciliter le débogage

### 🔗 Fichiers concernés

- **Node.js** :
  - `server/services/airbnbScrapingServiceV2.ts` - Service de scraping
  - `server/routes/scraping.ts` - Routes API
  - `server/config/scrapingConfig.ts` - Configuration

- **Python** (service séparé) :
  - Repository : `scraping-airbnb` (non inclus dans ce projet)
  - URL : `https://scraping-airbnb-production.up.railway.app`

### 📝 Prochaines étapes

1. **Identifier l'annonce problématique** : Quelle URL Airbnb cause l'erreur ?
2. **Analyser la structure** : Qu'est-ce qui manque dans cette annonce ?
3. **Corriger le service Python** : Ajouter la gestion des valeurs `None`
4. **Tester** : Vérifier que l'erreur ne se reproduit plus

### 💡 Workaround temporaire

En attendant la correction du service Python, vous pouvez :

1. **Utiliser une autre annonce Airbnb** qui contient toutes les informations
2. **Créer le parcours manuellement** sans utiliser le scraping
3. **Contacter l'équipe Python** pour corriger le bug

---

## 📞 Support

Si le problème persiste, vérifiez :
- Les logs Railway du service Python
- La structure de l'annonce Airbnb (inspect element)
- Les paramètres envoyés au service Python

