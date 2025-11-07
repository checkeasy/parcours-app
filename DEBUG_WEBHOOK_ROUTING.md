# 🔍 DEBUG : Routage des webhooks version-test vs version-live

## ❌ Problème rapporté

Vous voyez les données de `version-test` dans Bubble.io même quand vous utilisez `version-test=false` dans l'URL.

## ✅ Vérifications à faire

### 1. Vérifier les logs du frontend (Console du navigateur)

Quand vous envoyez un webhook, vous devriez voir dans la console :

```
=============================================================
📤 SENDING WEBHOOK TO BACKEND
=============================================================
   🏠 Logement: [nom du logement]
   🔍 Paramètre version-test (URL): "false"  ← DOIT ÊTRE "false" ou null
   🔧 testMode (isTestMode()): false         ← DOIT ÊTRE false
   🔧 testMode (type): boolean
   🔧 testMode === true: false
   🔧 testMode === false: true               ← DOIT ÊTRE true
   🔧 Mode: PRODUCTION (version-live)        ← DOIT DIRE "PRODUCTION"
   🏢 ConciergerieID: [votre ID]
   👤 UserID: [votre ID]
   📍 URL actuelle: [URL complète]
   📦 Payload.isTestMode: false              ← DOIT ÊTRE false
=============================================================
```

**Si vous voyez `testMode: true` alors que l'URL contient `version-test=false`, il y a un problème !**

### 2. Vérifier les logs du backend (Railway logs)

Dans les logs Railway, vous devriez voir :

```
=============================================================
📨 WEBHOOK REQUEST RECEIVED
=============================================================
   🏠 Logement: [nom du logement]
   🔧 isTestMode (raw): false                ← DOIT ÊTRE false
   🔧 isTestMode (type): boolean
   🔧 isTestMode (boolean): false
   🔧 isTestMode === true: false
   🔧 isTestMode === false: true             ← DOIT ÊTRE true
   🔧 Test mode: NO (version-live)           ← DOIT DIRE "NO (version-live)"
   🏢 ConciergerieID: [votre ID]
   👤 UserID: [votre ID]
=============================================================

🎯 ENDPOINTS SÉLECTIONNÉS:
   📍 Logement: https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour
   📍 Pièces: https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createpiece
   🔧 Mode: PRODUCTION (version-live)
```

**Si vous voyez `version-test` dans les endpoints alors que `isTestMode` est `false`, il y a un BUG !**

### 3. Vérifier que le code est déployé sur Railway

**IMPORTANT** : Les modifications que nous venons de faire ne seront effectives que si :

1. ✅ Le code est commité dans Git
2. ✅ Le code est pushé sur le repository
3. ✅ Railway a redéployé l'application avec les dernières modifications

**Comment vérifier :**

1. Allez sur Railway Dashboard
2. Vérifiez la date du dernier déploiement
3. Vérifiez que le déploiement est réussi (status: SUCCESS)
4. Vérifiez les logs pour voir si les nouveaux messages de log apparaissent

### 4. Vider le cache du navigateur

Le frontend peut être en cache. Pour être sûr d'avoir la dernière version :

1. **Chrome/Edge** : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
2. **Firefox** : `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)
3. Ou ouvrez les DevTools → Network → Cochez "Disable cache"

## 🐛 Scénarios de bug possibles

### Scénario 1 : Le paramètre `isTestMode` est toujours `true`

**Symptôme** : Les logs montrent `isTestMode: true` même avec `version-test=false`

**Cause possible** :
- La fonction `isTestMode()` ne lit pas correctement l'URL
- Il y a un autre endroit dans le code qui force `isTestMode = true`

**Solution** :
- Vérifier que l'URL contient bien `version-test=false`
- Vérifier qu'il n'y a pas de code qui override `isTestMode`

### Scénario 2 : Le backend reçoit `isTestMode: false` mais utilise quand même `version-test`

**Symptôme** : Les logs backend montrent `isTestMode: false` mais les endpoints utilisent `version-test`

**Cause possible** :
- Bug dans la logique de sélection des endpoints
- Les constantes `WEBHOOK_CONFIG` sont incorrectes

**Solution** :
- Vérifier `server/services/webhookService.ts` ligne 546-552
- Vérifier que `WEBHOOK_CONFIG.createLogement.production` contient bien `version-live`

### Scénario 3 : Le code n'est pas déployé

**Symptôme** : Les nouveaux logs n'apparaissent pas

**Cause** : Le code n'est pas déployé sur Railway

**Solution** :
1. Commit et push le code
2. Attendre que Railway redéploie
3. Vérifier les logs Railway

## 📋 Checklist de débogage

- [ ] Ouvrir l'application avec `?version-test=false` dans l'URL
- [ ] Ouvrir la console du navigateur (F12)
- [ ] Créer un logement via scraping Airbnb
- [ ] Valider les pièces
- [ ] **Vérifier les logs du frontend** (console navigateur)
  - [ ] `Paramètre version-test (URL)` doit être `"false"` ou `null`
  - [ ] `testMode (isTestMode())` doit être `false`
  - [ ] `Mode` doit être `PRODUCTION (version-live)`
- [ ] **Vérifier les logs du backend** (Railway)
  - [ ] `isTestMode (raw)` doit être `false`
  - [ ] `Test mode` doit être `NO (version-live)`
  - [ ] `Logement:` doit contenir `version-live`
  - [ ] `Pièces:` doit contenir `version-live`
- [ ] **Vérifier dans Bubble.io**
  - [ ] Les données doivent apparaître dans `version-live`
  - [ ] Les données NE doivent PAS apparaître dans `version-test`

## 🚀 Actions à faire MAINTENANT

1. **Redéployer sur Railway** (si pas déjà fait)
   ```bash
   git add .
   git commit -m "Add detailed webhook routing logs"
   git push
   ```

2. **Vider le cache du navigateur**
   - `Ctrl+Shift+R` ou `Cmd+Shift+R`

3. **Tester avec les logs**
   - Ouvrir la console (F12)
   - Créer un logement
   - **Copier-coller les logs ici** pour analyse

4. **Vérifier les logs Railway**
   - Aller sur Railway Dashboard
   - Ouvrir les logs
   - **Copier-coller les logs ici** pour analyse

## 📊 Résumé du flux attendu

```
URL: ?version-test=false
    ↓
Frontend: isTestMode() → false
    ↓
Frontend: dispatchWebhook({ isTestMode: false })
    ↓
Backend: /api/send-webhook reçoit { isTestMode: false }
    ↓
Backend: sendWebhookToBubble({ isTestMode: false })
    ↓
Backend: Sélectionne WEBHOOK_CONFIG.createLogement.production
    ↓
Backend: Envoie vers https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour
    ↓
Bubble.io: Données créées dans version-live ✅
```

## 🔧 Si le problème persiste

Si après toutes ces vérifications le problème persiste, partagez :

1. **Les logs du frontend** (console navigateur)
2. **Les logs du backend** (Railway)
3. **L'URL exacte** que vous utilisez
4. **Une capture d'écran** de Bubble.io montrant où les données apparaissent

Cela nous permettra d'identifier exactement où le problème se situe.

