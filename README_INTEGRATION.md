# 🚀 Guide d'Intégration Complet - Parcours App avec Weglot

Ce document est le point d'entrée pour intégrer votre application React avec Bubble.io et Weglot.

---

## 📚 Documentation disponible

Voici tous les guides créés pour vous aider :

### 1. **BUBBLE_PLUGIN_INTEGRATION.md** ⭐ (Principal)
Guide complet pour créer et configurer le plugin Bubble
- Création du plugin
- Configuration des propriétés
- Code JavaScript complet
- Tests et validation
- Dépannage

### 2. **BUBBLE_DYNAMIC_VALUES.md** 🎯
Guide pour configurer les valeurs dynamiques dans Bubble
- Configuration étape par étape
- Exemples de valeurs dynamiques
- Astuces et conditions
- Dépannage

### 3. **TEST_URL_EXAMPLES.md** 🧪
Exemples d'URLs pour tester l'application
- URLs locales (développement)
- URLs de production (Railway)
- Toutes les langues (FR, EN, PT, ES, AR, DE)

### 4. **WEGLOT_INTEGRATION.md** 🌍
Guide d'intégration Weglot API
- Configuration i18n
- Utilisation de l'API Weglot
- Traduction du contenu dynamique

### 5. **TEST_TRANSLATION.md** 📝
Guide de test des traductions
- Comment tester localement
- Configuration de l'iframe dans Bubble
- Utilisation dans les composants

---

## 🎯 Parcours d'intégration recommandé

### Phase 1 : Préparation (✅ Terminé)

- [x] Configuration i18n avec 6 langues
- [x] Intégration Weglot API
- [x] Fichiers de traduction créés
- [x] Documentation complète

### Phase 2 : Création du plugin Bubble (À faire)

1. **Lire** : `BUBBLE_PLUGIN_INTEGRATION.md`
2. **Créer** le plugin dans Bubble
3. **Ajouter** les 9 propriétés
4. **Copier** les 3 fonctions JavaScript
5. **Tester** en mode preview

### Phase 3 : Configuration dans Bubble (À faire)

1. **Lire** : `BUBBLE_DYNAMIC_VALUES.md`
2. **Ajouter** l'élément sur votre page
3. **Configurer** les valeurs dynamiques
4. **Tester** avec vos données

### Phase 4 : Tests (À faire)

1. **Lire** : `TEST_URL_EXAMPLES.md`
2. **Tester** localement avec différentes langues
3. **Tester** en production sur Railway
4. **Tester** dans l'iframe Bubble
5. **Tester** le changement de langue Weglot

---

## 🔧 Configuration actuelle

### Application React

**URL de production :**
```
https://app-production-01a1.up.railway.app/api/send-webhook
```

**Langues supportées :**
- 🇫🇷 Français (fr) - Défaut
- 🇬🇧 Anglais (en)
- 🇵🇹 Portugais (pt)
- 🇪🇸 Espagnol (es)
- 🇸🇦 Arabe (ar)
- 🇩🇪 Allemand (de)

**Clé API Weglot :**
```
wg_594771a5b0a8318b805497f9f42ce2c87
```

**Paramètres de l'URL :**
- `lang` - Langue (fr, en, pt, es, ar, de)
- `conciergerieID` - ID de la conciergerie
- `userID` - ID de l'utilisateur
- `logementid` - ID du logement
- `viewmode` - Mode d'affichage (full)
- `version-test` - Mode test (true/false)
- `test` - Valeur de test

---

## 🌍 Architecture finale

```
┌─────────────────────────────────────────────────────┐
│  Bubble.io (app.checkeasy.co)                       │
│  - Weglot détecte la langue (fr/en/pt/es/ar/de)    │
│  ┌───────────────────────────────────────────────┐  │
│  │  Plugin "Parcours Iframe"                     │  │
│  │  - Détecte langue Weglot                      │  │
│  │  - Construit URL avec paramètres              │  │
│  │  - Crée et gère l'iframe                      │  │
│  └───────────────┬───────────────────────────────┘  │
└──────────────────┼──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  App React (Railway)                                │
│  https://app-production-01a1.up.railway.app/        │
│                                                     │
│  - i18n détecte ?lang=XX                           │
│  - Charge traductions (fr.json, en.json...)        │
│  - Weglot API traduit contenu dynamique Bubble     │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Checklist complète

### Configuration React (✅ Terminé)

- [x] i18n configuré avec 6 langues
- [x] Fichiers de traduction créés (fr, en, pt, es, ar, de)
- [x] Weglot API intégrée
- [x] Clé API configurée dans `env`
- [x] Détection de langue depuis URL
- [x] Composants de traduction créés
- [x] Documentation complète

### Configuration Bubble (⏳ À faire)

- [ ] Plugin "Parcours Iframe" créé
- [ ] 9 propriétés ajoutées
- [ ] 3 fonctions JavaScript implémentées
- [ ] État `current_language` exposé
- [ ] Élément ajouté sur la page
- [ ] Valeurs dynamiques configurées
- [ ] Tests en mode preview

### Tests (⏳ À faire)

- [ ] Test local avec `?lang=fr`
- [ ] Test local avec `?lang=en`
- [ ] Test local avec `?lang=pt`
- [ ] Test local avec `?lang=es`
- [ ] Test local avec `?lang=ar`
- [ ] Test local avec `?lang=de`
- [ ] Test production Railway
- [ ] Test iframe dans Bubble
- [ ] Test changement de langue Weglot
- [ ] Test sur tous les sous-domaines

### Déploiement (⏳ À faire)

- [ ] CORS configuré sur Railway
- [ ] Variables d'environnement vérifiées
- [ ] Tests en production validés
- [ ] Documentation partagée avec l'équipe

---

## 🧪 Test rapide

### Test local (maintenant)

Le serveur tourne déjà sur `http://localhost:8080/`

**Testez cette URL dans votre navigateur :**
```
http://localhost:8080/api/send-webhook?lang=en&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

**Vérifiez dans la console (F12) :**
```
🌍 Langue détectée depuis paramètre URL: en
```

### Test production

**Testez cette URL :**
```
https://app-production-01a1.up.railway.app/api/send-webhook?lang=en&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

---

## 🆘 Besoin d'aide ?

### Problème avec le plugin Bubble
→ Consultez `BUBBLE_PLUGIN_INTEGRATION.md` section "Dépannage"

### Problème avec les valeurs dynamiques
→ Consultez `BUBBLE_DYNAMIC_VALUES.md` section "Dépannage"

### Problème avec les traductions
→ Consultez `WEGLOT_INTEGRATION.md` et `TEST_TRANSLATION.md`

### Problème avec les URLs
→ Consultez `TEST_URL_EXAMPLES.md`

---

## 📞 Support

Si vous rencontrez un problème non documenté :

1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs Railway
3. Vérifiez les logs Bubble (debugger)
4. Consultez la documentation Weglot : https://developers.weglot.com/

---

## 🎉 Prochaines étapes

1. **Créer le plugin Bubble** (suivez `BUBBLE_PLUGIN_INTEGRATION.md`)
2. **Configurer les valeurs** (suivez `BUBBLE_DYNAMIC_VALUES.md`)
3. **Tester** (suivez `TEST_URL_EXAMPLES.md`)
4. **Déployer** en production

**Bonne chance !** 🚀

