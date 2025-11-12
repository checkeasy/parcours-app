# 🧪 Exemples d'URLs de Test

Ce document contient des exemples d'URLs pour tester votre application avec différentes configurations.

---

## 🌍 URLs de test avec différentes langues

### Français (défaut)
```
http://localhost:8080/api/send-webhook?lang=fr&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Anglais
```
http://localhost:8080/api/send-webhook?lang=en&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Portugais
```
http://localhost:8080/api/send-webhook?lang=pt&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Espagnol
```
http://localhost:8080/api/send-webhook?lang=es&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Arabe
```
http://localhost:8080/api/send-webhook?lang=ar&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Allemand
```
http://localhost:8080/api/send-webhook?lang=de&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

---

## 🔗 URLs de production (Railway)

### Français
```
https://app-production-01a1.up.railway.app/api/send-webhook?lang=fr&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Anglais
```
https://app-production-01a1.up.railway.app/api/send-webhook?lang=en&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

### Portugais
```
https://app-production-01a1.up.railway.app/api/send-webhook?lang=pt&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

---

## 📊 Paramètres de l'URL

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `lang` | `fr`, `en`, `pt`, `es`, `ar`, `de` | Langue de l'interface |
| `conciergerieID` | `1730741276842x778024514623373300` | ID de la conciergerie |
| `userID` | `1730741188020x554510837711264200` | ID de l'utilisateur |
| `logementid` | `1746548810037x386469807784722400` | ID du logement |
| `viewmode` | `full` | Mode d'affichage |
| `version-test` | `true` | Mode test activé |
| `test` | `0104434342` | Valeur de test |

---

## 🧪 Comment tester

### 1. Test local (serveur de développement)

Le serveur tourne déjà sur `http://localhost:8080/`

**Copiez-collez une URL ci-dessus dans votre navigateur** et vérifiez :

✅ La langue est correctement détectée (console : `🌍 Langue détectée depuis paramètre URL: en`)  
✅ L'interface est traduite dans la bonne langue  
✅ Les paramètres sont bien passés à l'application  

### 2. Test en production (Railway)

**Ouvrez une URL de production** et vérifiez :

✅ L'application se charge correctement  
✅ La langue est détectée  
✅ Pas d'erreur CORS  

### 3. Test dans l'iframe Bubble

**Dans Bubble**, configurez l'iframe avec ces paramètres et vérifiez :

✅ L'iframe se charge  
✅ La langue change automatiquement selon le sous-domaine Weglot  
✅ Les données de Bubble sont bien passées  

---

## 🔍 Vérifications dans la console

Ouvrez la console du navigateur (F12) et vérifiez ces logs :

### Détection de langue
```
🌍 Langue détectée depuis paramètre URL: en
```

### Initialisation i18n
```
i18next: languageChanged en
```

### Chargement des traductions
```
i18next: loaded namespace translation for language en
```

---

## 🐛 Dépannage

### L'URL ne fonctionne pas

**Problème** : Erreur 404 ou page blanche

**Solution** : Vérifiez que le chemin `/api/send-webhook` existe dans votre app React. Si ce n'est pas le cas, utilisez simplement `/` :

```
http://localhost:8080/?lang=en&conciergerieID=...
```

### La langue ne change pas

**Problème** : L'interface reste en français

**Solution** :
1. Vérifiez que le paramètre `?lang=XX` est bien dans l'URL
2. Videz le cache du navigateur (Ctrl+Shift+R)
3. Vérifiez la console pour les erreurs

### Erreur CORS en production

**Problème** : `Blocked by CORS policy`

**Solution** : Configurez les headers CORS sur Railway (voir `BUBBLE_PLUGIN_INTEGRATION.md`)

---

## 📝 Notes

- **Développement** : Utilisez `http://localhost:8080/`
- **Production** : Utilisez `https://app-production-01a1.up.railway.app/`
- **Bubble iframe** : Le plugin construira automatiquement l'URL avec la bonne langue

---

## ✅ Checklist de test

- [ ] Test local avec `?lang=fr`
- [ ] Test local avec `?lang=en`
- [ ] Test local avec `?lang=pt`
- [ ] Test local avec `?lang=es`
- [ ] Test local avec `?lang=ar`
- [ ] Test local avec `?lang=de`
- [ ] Test production avec `?lang=en`
- [ ] Test dans iframe Bubble
- [ ] Test changement de langue dans Bubble
- [ ] Vérification console (pas d'erreurs)

---

**Prêt à tester !** 🚀

Copiez une URL ci-dessus et testez dans votre navigateur !

