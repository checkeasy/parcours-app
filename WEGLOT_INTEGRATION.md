# 🌍 Intégration Weglot - Guide Complet

Ce guide explique comment configurer et utiliser Weglot pour traduire automatiquement le contenu dynamique de votre application.

## 📋 Table des matières

1. [Configuration](#configuration)
2. [Obtenir votre clé API Weglot](#obtenir-votre-clé-api-weglot)
3. [Utilisation dans les composants](#utilisation-dans-les-composants)
4. [Exemples pratiques](#exemples-pratiques)
5. [Configuration de l'iframe dans Bubble](#configuration-de-liframe-dans-bubble)

---

## 🔧 Configuration

### 1. Obtenir votre clé API Weglot

1. Connectez-vous à votre compte Weglot : https://dashboard.weglot.com/
2. Allez dans **Settings** → **API**
3. Copiez votre **API Key**
4. Ajoutez-la dans votre fichier `env` :

```bash
VITE_WEGLOT_API_KEY=wg_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Redémarrer le serveur

```bash
npm run dev
```

---

## 🎯 Utilisation dans les composants

### Méthode 1 : Composant `<TranslatedText>`

Pour traduire du texte venant de Bubble.io :

```tsx
import { TranslatedText } from '@/components/ui/translated-text';

function TaskList({ tasks }) {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          {/* Le texte sera automatiquement traduit selon la langue actuelle */}
          <TranslatedText text={task.nom} />
        </div>
      ))}
    </div>
  );
}
```

### Méthode 2 : Hook `useWeglotTranslation()`

Pour plus de contrôle :

```tsx
import { useWeglotTranslation } from '@/components/ui/translated-text';

function MyComponent() {
  const { translate, isLoading, currentLang } = useWeglotTranslation();
  const [translatedName, setTranslatedName] = useState('');

  useEffect(() => {
    const translateData = async () => {
      const result = await translate('Nettoyer la cuisine');
      setTranslatedName(result);
    };
    translateData();
  }, [currentLang]);

  return <h1>{translatedName}</h1>;
}
```

### Méthode 3 : Fonction directe `translateWithWeglot()`

Pour traduire manuellement :

```tsx
import { translateWithWeglot } from '@/utils/weglot';

const translated = await translateWithWeglot(
  'Nettoyer la cuisine',  // Texte à traduire
  'en',                    // Langue cible
  'fr'                     // Langue source (optionnel, défaut: 'fr')
);
// Résultat: "Clean the kitchen"
```

---

## 📝 Exemples pratiques

### Exemple 1 : Traduire les noms de pièces

```tsx
import { TranslatedText } from '@/components/ui/translated-text';

function PiecesList({ pieces }) {
  return (
    <ul>
      {pieces.map(piece => (
        <li key={piece.id}>
          <TranslatedText text={piece.nom} /> - Quantité: {piece.quantite}
        </li>
      ))}
    </ul>
  );
}
```

**Résultat :**
- En français : "Cuisine - Quantité: 1"
- En anglais : "Kitchen - Quantity: 1"

### Exemple 2 : Traduire plusieurs textes en batch (plus efficace)

```tsx
import { translateBatchWithWeglot } from '@/utils/weglot';

const pieces = ['Cuisine', 'Chambre', 'Salle de bain'];
const translated = await translateBatchWithWeglot(pieces, 'en');
// Résultat: ["Kitchen", "Bedroom", "Bathroom"]
```

### Exemple 3 : Traduire avec i18n pour l'interface + Weglot pour les données

```tsx
import { useTranslation } from 'react-i18next';
import { TranslatedText } from '@/components/ui/translated-text';

function TaskCard({ task }) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Texte statique : i18n */}
      <h3>{t('tasks.title')}</h3>
      
      {/* Contenu dynamique de Bubble : Weglot */}
      <p><TranslatedText text={task.nom} /></p>
      <p><TranslatedText text={task.description} /></p>
    </div>
  );
}
```

---

## 🔗 Configuration de l'iframe dans Bubble

### Étape 1 : Détecter la langue Weglot dans Bubble

Dans Bubble, créez un **Custom State** ou utilisez JavaScript pour détecter la langue :

```javascript
// Option 1 : Depuis le sous-domaine
const hostname = window.location.hostname;
const lang = hostname.split('.')[0]; // 'en' ou 'fr'

// Option 2 : Depuis Weglot JavaScript
const lang = Weglot.getCurrentLang(); // 'en' ou 'fr'
```

### Étape 2 : Configurer l'URL de l'iframe

Dans Bubble, configurez l'iframe pour inclure le paramètre `lang` :

```
https://votre-app.railway.app/?lang=<langue>&conciergerieID=<id>&userID=<id>
```

**Exemple dynamique dans Bubble :**
```
https://votre-app.railway.app/?lang=[Current Language]&conciergerieID=[Current User's Conciergerie ID]
```

### Étape 3 : Tester

1. Allez sur `fr.app.checkeasy.co` → L'iframe devrait afficher en français
2. Allez sur `en.app.checkeasy.co` → L'iframe devrait afficher en anglais

---

## 🎨 Combinaison i18n + Weglot

| Type de contenu | Solution | Exemple |
|----------------|----------|---------|
| **Interface statique** | i18n | Boutons, labels, messages d'erreur |
| **Données Bubble** | Weglot API | Noms de pièces, tâches personnalisées |
| **Textes prédéfinis** | i18n | "Créer un logement", "Suivant" |
| **Contenu utilisateur** | Weglot API | "Nettoyer la cuisine", "Chambre principale" |

---

## 💰 Coût Weglot API

L'API Weglot est incluse dans votre abonnement Weglot. Vérifiez votre plan :
- **Starter** : 10 000 mots/mois
- **Business** : 50 000 mots/mois
- **Advanced** : 200 000 mots/mois

**Optimisation :** Le système utilise un cache pour éviter de traduire plusieurs fois le même texte.

---

## 🐛 Dépannage

### La traduction ne fonctionne pas

1. Vérifiez que `VITE_WEGLOT_API_KEY` est bien configurée
2. Vérifiez dans la console : `console.log(import.meta.env.VITE_WEGLOT_API_KEY)`
3. Redémarrez le serveur après avoir modifié le fichier `env`

### Les traductions sont lentes

Utilisez `translateBatchWithWeglot()` pour traduire plusieurs textes en une seule requête.

### Erreur 401 Unauthorized

Votre clé API Weglot est incorrecte. Vérifiez-la sur https://dashboard.weglot.com/settings/api

---

## 📚 Ressources

- [Documentation API Weglot](https://developers.weglot.com/api/)
- [Dashboard Weglot](https://dashboard.weglot.com/)
- [Documentation i18next](https://www.i18next.com/)

