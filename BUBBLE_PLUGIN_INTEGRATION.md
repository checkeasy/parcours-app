# 🔌 Intégration Plugin Bubble - Guide Complet

Ce guide explique comment créer et configurer un plugin Bubble pour intégrer votre application React avec traduction automatique Weglot.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Création du plugin Bubble](#création-du-plugin-bubble)
3. [Configuration des propriétés](#configuration-des-propriétés)
4. [Code JavaScript du plugin](#code-javascript-du-plugin)
5. [Utilisation dans Bubble](#utilisation-dans-bubble)
6. [Tests et validation](#tests-et-validation)

---

## 🎯 Vue d'ensemble

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Bubble.io (app.checkeasy.co)                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  Plugin "Parcours Iframe"                     │  │
│  │  - Détecte la langue Weglot (fr/en/pt/es...)  │  │
│  │  - Construit l'URL avec paramètres            │  │
│  │  - Crée et gère l'iframe                      │  │
│  └───────────────┬───────────────────────────────┘  │
└──────────────────┼──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  App React (Railway)                                │
│  URL: https://votre-app.railway.app/                │
│       ?lang=fr&conciergerieID=123&userID=456        │
│                                                     │
│  - i18n détecte ?lang=XX                           │
│  - Charge les traductions correspondantes          │
│  - Weglot API traduit le contenu dynamique         │
└─────────────────────────────────────────────────────┘
```

### Langues supportées

- 🇫🇷 Français (fr) - Langue par défaut
- 🇬🇧 Anglais (en)
- 🇵🇹 Portugais (pt)
- 🇪🇸 Espagnol (es)
- 🇸🇦 Arabe (ar)
- 🇩🇪 Allemand (de)

---

## 🔧 Création du plugin Bubble

### Étape 1 : Créer un nouveau plugin

1. Allez dans **Plugins** → **Add plugins**
2. Cliquez sur **"Create a new plugin"**
3. Nom du plugin : **"Parcours Iframe"**
4. Description : **"Iframe pour afficher les parcours avec traduction automatique Weglot"**

### Étape 2 : Créer un élément visuel

1. Dans l'éditeur de plugin, cliquez sur **"Add a new element"**
2. Nom de l'élément : **"Parcours Viewer"**
3. Type : **"Visual element"**

---

## ⚙️ Configuration des propriétés

### Propriétés de l'élément

Ajoutez les propriétés suivantes dans l'onglet **"Fields"** :

#### 1. **base_url** (Text)
- **Label** : Base URL
- **Description** : URL de base de l'application Railway
- **Default value** : `https://votre-app.railway.app/`
- **Optional** : No

#### 2. **conciergerie_id** (Text)
- **Label** : Conciergerie ID
- **Description** : ID de la conciergerie
- **Optional** : No
- **Dynamic** : Yes

#### 3. **user_id** (Text)
- **Label** : User ID
- **Description** : ID de l'utilisateur
- **Optional** : No
- **Dynamic** : Yes

#### 4. **logement_id** (Text)
- **Label** : Logement ID
- **Description** : ID du logement (optionnel)
- **Optional** : Yes
- **Dynamic** : Yes

#### 5. **view_mode** (Text)
- **Label** : View Mode
- **Description** : Mode d'affichage (full, normal)
- **Optional** : Yes
- **Dynamic** : Yes

#### 6. **auto_detect_language** (Boolean)
- **Label** : Auto Detect Language
- **Description** : Détecter automatiquement la langue depuis Weglot
- **Default value** : `true`
- **Optional** : No

#### 7. **manual_language** (Text)
- **Label** : Manual Language
- **Description** : Langue manuelle (si auto_detect_language = false)
- **Optional** : Yes
- **Dynamic** : Yes

#### 8. **version_test** (Boolean)
- **Label** : Version Test
- **Description** : Activer le mode test
- **Default value** : `true`
- **Optional** : Yes

#### 9. **test_value** (Text)
- **Label** : Test Value
- **Description** : Valeur de test personnalisée
- **Optional** : Yes
- **Dynamic** : Yes

---

## 💻 Code JavaScript du plugin

### Initialize function

Dans l'onglet **"Edit"** → **"Initialize function"** :

```javascript
function(instance, context) {
    // Initialiser les données de l'instance
    instance.data = {
        iframe: null,
        currentLang: null
    };
    
    console.log('🔌 Plugin Parcours Iframe initialisé');
    
    // Écouter les changements de langue Weglot
    if (typeof Weglot !== 'undefined') {
        Weglot.on('languageChanged', function(newLang, prevLang) {
            console.log('🌍 Langue Weglot changée:', prevLang, '→', newLang);
            
            // Stocker la nouvelle langue
            instance.data.currentLang = newLang;
            
            // Publier un événement pour notifier le changement
            instance.publishState('current_language', newLang);
            
            // Recharger l'iframe avec la nouvelle langue
            if (instance.data.iframe) {
                const currentUrl = new URL(instance.data.iframe.src);
                currentUrl.searchParams.set('lang', newLang);
                instance.data.iframe.src = currentUrl.toString();
                console.log('🔄 Iframe rechargée avec langue:', newLang);
            }
        });
    }
}
```

### Update function

Dans l'onglet **"Edit"** → **"Update function"** :

```javascript
function(instance, properties, context) {
    // Créer l'iframe si elle n'existe pas encore
    if (!instance.data.iframe) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.allow = 'camera; microphone; geolocation';
        
        instance.data.iframe = iframe;
        instance.canvas.append(iframe);
        
        console.log('📺 Iframe créée');
    }
    
    // Fonction pour détecter la langue Weglot
    function detectWeglotLanguage() {
        // 1. Vérifier si une langue manuelle est définie
        if (!properties.auto_detect_language && properties.manual_language) {
            console.log('🌍 Langue manuelle:', properties.manual_language);
            return properties.manual_language;
        }
        
        // 2. Essayer depuis le sous-domaine
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        const supportedLangs = ['en', 'fr', 'pt', 'es', 'ar', 'de'];
        
        if (supportedLangs.includes(subdomain)) {
            console.log('🌍 Langue détectée depuis sous-domaine:', subdomain);
            return subdomain;
        }
        
        // 3. Essayer avec l'API Weglot
        if (typeof Weglot !== 'undefined' && Weglot.getCurrentLang) {
            const lang = Weglot.getCurrentLang();
            console.log('🌍 Langue détectée depuis Weglot API:', lang);
            return lang;
        }
        
        // 4. Utiliser la langue stockée lors du dernier changement
        if (instance.data.currentLang) {
            console.log('🌍 Langue depuis cache:', instance.data.currentLang);
            return instance.data.currentLang;
        }
        
        // 5. Par défaut : français
        console.log('🌍 Langue par défaut: fr');
        return 'fr';
    }
    
    // Construire l'URL avec tous les paramètres
    const baseUrl = properties.base_url || 'https://app-production-01a1.up.railway.app/api/send-webhook';
    const params = new URLSearchParams();

    // Détecter et ajouter la langue
    const detectedLang = detectWeglotLanguage();
    params.append('lang', detectedLang);
    instance.data.currentLang = detectedLang;
    instance.publishState('current_language', detectedLang);

    // Ajouter les autres paramètres
    if (properties.conciergerie_id) {
        params.append('conciergerieID', properties.conciergerie_id);
    }

    if (properties.user_id) {
        params.append('userID', properties.user_id);
    }

    if (properties.logement_id) {
        params.append('logementid', properties.logement_id);
    }

    if (properties.view_mode) {
        params.append('viewmode', properties.view_mode);
    }

    // Ajouter les paramètres de test
    if (properties.version_test !== undefined) {
        params.append('version-test', properties.version_test.toString());
    }

    if (properties.test_value) {
        params.append('test', properties.test_value);
    }

    // Construire l'URL finale
    const finalUrl = baseUrl + '?' + params.toString();

    // Mettre à jour l'iframe seulement si l'URL a changé
    if (instance.data.iframe.src !== finalUrl) {
        instance.data.iframe.src = finalUrl;
        console.log('📍 Iframe URL mise à jour:', finalUrl);
    }
}
```

### Reset function (optionnel)

Dans l'onglet **"Edit"** → **"Reset function"** :

```javascript
function(instance, context) {
    // Nettoyer l'iframe lors du reset
    if (instance.data.iframe) {
        instance.data.iframe.src = 'about:blank';
        console.log('🔄 Iframe réinitialisée');
    }
}
```

---

## 📊 États exposés (Exposed States)

Ajoutez ces états dans l'onglet **"Exposed states"** pour permettre à Bubble d'accéder aux données du plugin :

### 1. **current_language** (Text)
- **Description** : Langue actuellement détectée
- **Permet aux workflows Bubble de réagir aux changements de langue**

---

## 🎨 Utilisation dans Bubble

### Étape 1 : Ajouter le plugin à votre page

1. Ouvrez votre page Bubble
2. Glissez-déposez l'élément **"Parcours Viewer"** sur votre page
3. Redimensionnez-le selon vos besoins

### Étape 2 : Configurer les propriétés

Dans l'inspecteur de propriétés :

#### **Base URL**
```
https://app-production-01a1.up.railway.app/api/send-webhook
```
*(URL de votre app Railway)*

#### **Conciergerie ID**
```
Current User's Conciergerie's _id
```
*(Ou la source de données appropriée)*

**Exemple de valeur :** `1730741276842x778024514623373300`

#### **User ID**
```
Current User's _id
```

**Exemple de valeur :** `1730741188020x554510837711264200`

#### **Logement ID** (optionnel)
```
Current Page Logement's _id
```
*(Si vous êtes sur une page de détail de logement)*

**Exemple de valeur :** `1746548810037x386469807784722400`

#### **View Mode** (optionnel)
```
full
```
*(Pour afficher en plein écran)*

#### **Version Test** (optionnel)
```
yes
```
*(Activer le mode test)*

#### **Test Value** (optionnel)
```
0104434342
```
*(Valeur de test personnalisée)*

#### **Auto Detect Language**
```
yes
```
*(Coché par défaut)*

### Étape 3 : Exemple de configuration complète

Voici à quoi ressemblent les propriétés configurées :

```
┌──────────────────────────────────────────────────────────────┐
│ Parcours Viewer                                              │
├──────────────────────────────────────────────────────────────┤
│ Base URL: https://app-production-01a1.up.railway.app/       │
│           api/send-webhook                                   │
│                                                              │
│ Conciergerie ID: Current User's Conciergerie's _id          │
│                  (1730741276842x778024514623373300)          │
│                                                              │
│ User ID: Current User's _id                                  │
│          (1730741188020x554510837711264200)                  │
│                                                              │
│ Logement ID: Current Page Logement's _id                     │
│              (1746548810037x386469807784722400)              │
│                                                              │
│ View Mode: full                                              │
│ Version Test: ✓ yes                                          │
│ Test Value: 0104434342                                       │
│ Auto Detect Language: ✓ yes                                  │
│ Manual Language: (empty)                                     │
└──────────────────────────────────────────────────────────────┘
```

**URL générée automatiquement :**
```
https://app-production-01a1.up.railway.app/api/send-webhook?lang=fr&conciergerieID=1730741276842x778024514623373300&userID=1730741188020x554510837711264200&logementid=1746548810037x386469807784722400&viewmode=full&version-test=true&test=0104434342
```

---

## 🔄 Workflows et événements

### Réagir aux changements de langue

Vous pouvez créer des workflows qui réagissent aux changements de langue :

1. **Créer un workflow** : "When Parcours Viewer's current_language changes"
2. **Actions possibles** :
   - Afficher un message de confirmation
   - Logger l'événement
   - Mettre à jour d'autres éléments de la page

### Exemple de workflow

```
Event: When Parcours Viewer's current_language changes

Actions:
  1. Show message "Langue changée en: [Parcours Viewer's current_language]"
  2. Log to console: "New language: [Parcours Viewer's current_language]"
```

---

## 🧪 Tests et validation

### Test 1 : Vérifier la détection de langue

1. Ouvrez votre page Bubble en mode preview
2. Ouvrez la console du navigateur (F12)
3. Vous devriez voir :
   ```
   🔌 Plugin Parcours Iframe initialisé
   🌍 Langue détectée depuis sous-domaine: fr
   📺 Iframe créée
   📍 Iframe URL mise à jour: https://votre-app.railway.app/?lang=fr&conciergerieID=123&userID=456
   ```

### Test 2 : Tester le changement de langue

1. Changez la langue avec Weglot (cliquez sur le sélecteur de langue)
2. Dans la console, vous devriez voir :
   ```
   🌍 Langue Weglot changée: fr → en
   🔄 Iframe rechargée avec langue: en
   ```

### Test 3 : Vérifier les paramètres de l'URL

1. Dans la console, copiez l'URL de l'iframe
2. Vérifiez qu'elle contient tous les paramètres :
   ```
   https://votre-app.railway.app/?lang=fr&conciergerieID=123&userID=456
   ```

### Test 4 : Tester sur différents sous-domaines

Testez sur tous vos sous-domaines Weglot :

- `https://fr.app.checkeasy.co/` → `?lang=fr`
- `https://en.app.checkeasy.co/` → `?lang=en`
- `https://pt.app.checkeasy.co/` → `?lang=pt`
- `https://es.app.checkeasy.co/` → `?lang=es`
- `https://ar.app.checkeasy.co/` → `?lang=ar`
- `https://de.app.checkeasy.co/` → `?lang=de`

---

## 🐛 Dépannage

### L'iframe ne s'affiche pas

**Problème** : L'iframe est vide ou ne charge rien

**Solutions** :
1. Vérifiez que la Base URL est correcte
2. Vérifiez que Railway autorise les iframes (headers CORS)
3. Ouvrez la console et cherchez les erreurs

### La langue n'est pas détectée

**Problème** : L'iframe affiche toujours en français

**Solutions** :
1. Vérifiez que Weglot est bien chargé sur la page Bubble
2. Vérifiez dans la console : `console.log(Weglot.getCurrentLang())`
3. Vérifiez que `auto_detect_language` est bien à `yes`

### L'iframe ne se recharge pas lors du changement de langue

**Problème** : Quand je change de langue, l'iframe reste dans l'ancienne langue

**Solutions** :
1. Vérifiez que la fonction `Initialize` est bien configurée
2. Vérifiez que Weglot est chargé **avant** le plugin
3. Testez manuellement : `Weglot.on('languageChanged', (n, p) => console.log(n, p))`

### Erreur CORS

**Problème** : `Blocked by CORS policy`

**Solution** : Configurez les headers CORS sur Railway (voir section suivante)

---

## 🚀 Configuration Railway (CORS)

Pour que l'iframe fonctionne, Railway doit autoriser les iframes depuis Bubble.

### Option 1 : Ajouter les headers dans votre app React

Créez un fichier `vite.config.ts` ou modifiez-le :

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Frame-Options': 'ALLOW-FROM https://checkeasy.bubbleapps.io',
      'Content-Security-Policy': "frame-ancestors 'self' https://*.checkeasy.co https://checkeasy.bubbleapps.io"
    }
  }
})
```

### Option 2 : Configurer via Railway

Dans Railway, ajoutez ces variables d'environnement :

```bash
VITE_ALLOW_IFRAME=true
VITE_ALLOWED_ORIGINS=https://checkeasy.bubbleapps.io,https://*.checkeasy.co
```

---

## 📚 Ressources

### Documentation

- [Documentation Bubble Plugins](https://manual.bubble.io/core-resources/bubble-made-plugins)
- [Weglot API Documentation](https://developers.weglot.com/api/)
- [Guide i18n React](WEGLOT_INTEGRATION.md)

### Fichiers de référence

- `WEGLOT_INTEGRATION.md` - Guide d'intégration Weglot
- `TEST_TRANSLATION.md` - Guide de test des traductions
- `src/i18n/config.ts` - Configuration i18n
- `src/utils/weglot.ts` - Utilitaires Weglot API

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Plugin Bubble créé et configuré
- [ ] Toutes les propriétés sont bien mappées
- [ ] Initialize et Update functions sont implémentées
- [ ] Tests effectués sur tous les sous-domaines Weglot
- [ ] CORS configuré sur Railway
- [ ] Clé API Weglot configurée dans Railway
- [ ] Tests de changement de langue effectués
- [ ] Documentation partagée avec l'équipe

---

## 🎉 Résultat final

Une fois tout configuré, votre plugin :

✅ Détecte automatiquement la langue Weglot (6 langues)
✅ Construit l'URL de l'iframe avec tous les paramètres
✅ Recharge l'iframe automatiquement lors du changement de langue
✅ Expose la langue actuelle aux workflows Bubble
✅ Fonctionne sur tous vos sous-domaines

**Votre application React sera automatiquement traduite dans la langue de l'utilisateur !** 🌍🎉

