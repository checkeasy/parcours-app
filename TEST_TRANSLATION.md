# 🧪 Test de Traduction - Guide

## ✅ Configuration terminée !

Votre système de traduction est maintenant configuré avec :
- ✅ **6 langues** : FR, EN, PT, ES, AR, DE
- ✅ **i18n** pour l'interface statique
- ✅ **Weglot API** pour le contenu dynamique de Bubble
- ✅ **Détection automatique** de la langue depuis l'URL

---

## 🧪 Comment tester

### 1. Tester la détection de langue depuis l'URL

Ouvrez votre navigateur et testez ces URLs :

**Français (défaut) :**
```
http://localhost:8080/
```

**Anglais :**
```
http://localhost:8080/?lang=en
```

**Portugais :**
```
http://localhost:8080/?lang=pt
```

**Espagnol :**
```
http://localhost:8080/?lang=es
```

**Arabe :**
```
http://localhost:8080/?lang=ar
```

**Allemand :**
```
http://localhost:8080/?lang=de
```

### 2. Vérifier dans la console

Ouvrez la console du navigateur (F12) et vous devriez voir :
```
🌍 Langue détectée depuis paramètre URL: en
```

### 3. Tester avec un sous-domaine (simulation)

Pour simuler le comportement avec Weglot, vous pouvez modifier temporairement votre fichier `/etc/hosts` :

```bash
# Ajouter ces lignes dans /etc/hosts
127.0.0.1 en.localhost
127.0.0.1 fr.localhost
127.0.0.1 pt.localhost
```

Puis accéder à :
```
http://en.localhost:8080/
http://fr.localhost:8080/
http://pt.localhost:8080/
```

---

## 🔗 Configuration de l'iframe dans Bubble

### Étape 1 : Détecter la langue Weglot

Dans Bubble, ajoutez un élément **HTML** avec ce code :

```html
<script>
  // Détecter la langue depuis le sous-domaine Weglot
  function detectWeglotLanguage() {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Liste des langues supportées
    const supportedLangs = ['en', 'fr', 'pt', 'es', 'ar', 'de'];
    
    // Si le sous-domaine est une langue, retourner cette langue
    if (supportedLangs.includes(subdomain)) {
      return subdomain;
    }
    
    // Sinon, essayer avec l'API Weglot
    if (typeof Weglot !== 'undefined') {
      return Weglot.getCurrentLang();
    }
    
    // Par défaut : français
    return 'fr';
  }
  
  // Stocker la langue dans un attribut data
  document.body.setAttribute('data-current-lang', detectWeglotLanguage());
  
  console.log('Langue détectée:', detectWeglotLanguage());
</script>
```

### Étape 2 : Configurer l'URL de l'iframe

Dans Bubble, configurez votre iframe avec une URL dynamique :

**Option A - URL statique avec paramètre dynamique :**

Dans les propriétés de l'iframe, utilisez :
```
https://votre-app.railway.app/?lang=<insert dynamic data>&conciergerieID=<insert dynamic data>&userID=<insert dynamic data>
```

**Option B - JavaScript pour mettre à jour l'iframe :**

Ajoutez un élément HTML après l'iframe :
```html
<script>
  // Attendre que la page soit chargée
  window.addEventListener('load', function() {
    // Récupérer la langue
    const lang = document.body.getAttribute('data-current-lang') || 'fr';
    
    // Récupérer l'iframe (ajustez le sélecteur selon votre structure)
    const iframe = document.querySelector('iframe[src*="railway.app"]');
    
    if (iframe) {
      // Construire l'URL avec la langue
      const baseUrl = 'https://votre-app.railway.app/';
      const params = new URLSearchParams({
        lang: lang,
        conciergerieID: 'VOTRE_ID', // À remplacer par la valeur dynamique de Bubble
        userID: 'VOTRE_USER_ID'     // À remplacer par la valeur dynamique de Bubble
      });
      
      iframe.src = baseUrl + '?' + params.toString();
      console.log('Iframe URL mise à jour:', iframe.src);
    }
  });
</script>
```

---

## 🎨 Utilisation dans vos composants

### Pour l'interface statique (boutons, labels, etc.)

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('logement.createNew')}</h1>
      <button>{t('common.next')}</button>
    </div>
  );
}
```

### Pour le contenu dynamique de Bubble (noms de pièces, tâches, etc.)

```tsx
import { TranslatedText } from '@/components/ui/translated-text';

function TaskList({ tasks }) {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <TranslatedText text={task.nom} />
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Résumé de l'architecture

```
┌─────────────────────────────────────────────────────┐
│  Bubble.io (app.checkeasy.co)                       │
│  - Weglot détecte la langue (fr/en/pt/es/ar/de)    │
│  - JavaScript récupère la langue                    │
│  - Passe ?lang=XX à l'iframe                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Iframe (votre-app.railway.app)                     │
│  - Détecte ?lang=XX depuis l'URL                    │
│  - i18n charge les traductions correspondantes      │
│  - Interface traduite automatiquement               │
│  - Weglot API traduit le contenu dynamique Bubble   │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Dépannage

### La langue ne change pas

1. Vérifiez la console : `console.log(import.meta.env.VITE_WEGLOT_API_KEY)`
2. Vérifiez que l'URL contient bien `?lang=XX`
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Erreur "VITE_WEGLOT_API_KEY is undefined"

1. Vérifiez que le fichier `env` contient bien la clé
2. Redémarrez le serveur : `npm run dev`
3. La clé doit commencer par `VITE_` pour être accessible côté client

### Les traductions Weglot API ne fonctionnent pas

1. Vérifiez votre quota Weglot sur https://dashboard.weglot.com/
2. Vérifiez la console pour les erreurs API
3. Testez avec `?lang=fr` (pas besoin de traduction, devrait afficher le texte original)

---

## 📚 Prochaines étapes

1. ✅ Tester localement avec `?lang=XX`
2. ⏳ Configurer l'iframe dans Bubble
3. ⏳ Déployer sur Railway
4. ⏳ Tester en production avec les vrais sous-domaines Weglot

---

**Besoin d'aide ?** Consultez le fichier `WEGLOT_INTEGRATION.md` pour plus de détails !

