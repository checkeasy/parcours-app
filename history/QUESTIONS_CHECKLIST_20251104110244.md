# ✅ Questions de Checklist de Sortie

## 🎯 Vue d'ensemble

Les **questions de checklist** permettent aux utilisateurs de configurer des questions personnalisées qui seront posées lors de l'inspection de sortie d'un logement.

Ces questions sont configurées dans les **modèles personnalisés** et envoyées à Bubble.io lors de la création d'un logement.

---

## 📦 Structure d'une question

Chaque question de checklist a la structure suivante :

```typescript
interface QuestionModele {
  id: string;                         // Unique ID (e.g., "q-1")
  intitule: string;                   // Question text
  type: "oui-non" | "ouverte";       // Question type
  photoObligatoire?: boolean;         // Is photo required?
  obligatoire?: boolean;              // Is question mandatory?
}
```

### Types de questions

| Type | Description | Exemple |
|------|-------------|---------|
| `"oui-non"` | Question fermée avec réponse Oui/Non | "Le logement est-il propre ?" |
| `"ouverte"` | Question ouverte avec réponse texte libre | "Commentaires supplémentaires ?" |

---

## 🔄 Flux de données

### 1. Configuration dans le CustomModeleBuilder

Les utilisateurs configurent les questions lors de la création d'un modèle personnalisé :

```tsx
// Dans CustomModeleBuilder.tsx
const [checklistQuestions, setChecklistQuestions] = useState<QuestionModele[]>([]);

// Exemple de question
{
  id: "q-1",
  intitule: "Le logement est-il propre ?",
  type: "oui-non",
  photoObligatoire: true,
  obligatoire: true
}
```

### 2. Stockage dans le ParcoursModele

Les questions sont stockées dans le champ `questionsChecklist` du modèle :

```typescript
interface ParcoursModele {
  id: string;
  nom: string;
  type: "menage" | "voyageur";
  pieces: PieceModele[];
  etatLieuxMoment?: "sortie" | "arrivee-sortie";
  questionsChecklist?: QuestionModele[];  // ✅ Questions de checklist
  createdAt: string;
  updatedAt: string;
}
```

### 3. Extraction dans le webhook de logement

Le backend extrait automatiquement les questions du modèle sélectionné :

<augment_code_snippet path="server/services/webhookService.ts" mode="EXCERPT">
```typescript
// Get the questionsChecklist
const questionsChecklist = typeof logementData.modele === 'string'
  ? [] // Empty array for predefined models
  : (logementData.modele.questionsChecklist || []); // From custom model or empty array
```
</augment_code_snippet>

---

## 📡 Payload envoyé à Bubble.io

### Webhook de logement (ÉTAPE 1)

**Note importante :** Les questions sont automatiquement transformées du format interne vers le format Bubble.io avant l'envoi.

```json
{
  "conciergerieID": "1730741276842x778024514623373300",
  "userID": "1730741188020x554510837711264200",
  "nom": "Appartement Paris 15",
  "adresse": "123 Rue de la Paix, 75015 Paris",
  "parcoursType": "menage",
  "nomParcours": "Ménage Premium Villa",
  "etatLieuxMoment": "sortie",
  "questionsChecklist": [  // ✅ Format Bubble.io
    {
      "id": "q-1",
      "intitule": "Le logement est-il propre ?",
      "reponseType": "boolean",
      "photoIsRequired": true,
      "obligatoire": true
    },
    {
      "id": "q-2",
      "intitule": "Y a-t-il des dégradations ?",
      "reponseType": "boolean",
      "photoIsRequired": true,
      "obligatoire": false
    },
    {
      "id": "q-3",
      "intitule": "Commentaires supplémentaires",
      "reponseType": "open",
      "photoIsRequired": false,
      "obligatoire": false
    }
  ],
  "modele": {
    "type": "custom",
    "value": { ... }
  }
}
```

### Transformation automatique

Le backend transforme automatiquement les questions du format interne vers le format Bubble.io :

| Format interne | Format Bubble.io |
|----------------|------------------|
| `type: "oui-non"` | `reponseType: "boolean"` |
| `type: "ouverte"` | `reponseType: "open"` |
| `photoObligatoire: true` | `photoIsRequired: true` |
| `obligatoire: true` | `obligatoire: true` |

### Webhook de modèle personnalisé

```json
{
  "conciergerieID": "1730741276842x778024514623373300",
  "userID": "1730741188020x554510837711264200",
  "modele": {
    "id": "custom-1730741234567",
    "nom": "Ménage Premium Villa",
    "type": "menage",
    "etatLieuxMoment": "sortie",
    "pieces": [...],
    "questionsChecklist": [  // ✅ Déjà présent
      {
        "id": "q-1",
        "intitule": "Le logement est-il propre ?",
        "type": "oui-non",
        "photoObligatoire": true,
        "obligatoire": true
      }
    ],
    "createdAt": "2025-11-04T10:30:00.000Z",
    "updatedAt": "2025-11-04T10:30:00.000Z"
  }
}
```

---

## 🔍 Logs du serveur

### Webhook de logement

```
📤 ÉTAPE 1/2 : Création du logement et du parcours...
   Endpoint: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour
   Logement: Appartement Paris 15
   État des lieux: sortie
   Questions checklist: 3  // ✅ Nouveau log
```

### Webhook de modèle personnalisé

```
📤 Sending modele webhook to TEST endpoint...
   Endpoint: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createmodeleparcour/initialize
   Modele: Ménage Premium Villa
   Type: menage
   État des lieux: sortie
   Pieces: 5
```

---

## 🎨 Interface utilisateur

### Configuration dans CustomModeleBuilder

Les utilisateurs peuvent ajouter des questions de checklist lors de la création d'un modèle personnalisé :

```
┌─────────────────────────────────────────┐
│  Questions de checklist de sortie       │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ ✅ Le logement est-il propre ?    │  │
│  │    Type: Oui/Non                  │  │
│  │    📷 Photo obligatoire           │  │
│  │    ⚠️ Question obligatoire        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ✅ Y a-t-il des dégradations ?    │  │
│  │    Type: Oui/Non                  │  │
│  │    📷 Photo obligatoire           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📝 Commentaires supplémentaires   │  │
│  │    Type: Réponse ouverte          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [+ Ajouter une question]               │
└─────────────────────────────────────────┘
```

---

## 🧪 Cas d'usage

### Cas 1 : Modèle prédéfini (sans questions)

**Scénario** : Utilisation d'un modèle Check Easy standard ("Ménage" ou "Voyageur")

**Configuration** :
- `questionsChecklist: []` (tableau vide)
- Pas de questions personnalisées

**Payload envoyé** :
```json
{
  "questionsChecklist": []
}
```

---

### Cas 2 : Modèle personnalisé avec questions

**Scénario** : Modèle personnalisé avec 3 questions de checklist

**Configuration** :
- Question 1 : "Le logement est-il propre ?" (Oui/Non, photo obligatoire)
- Question 2 : "Y a-t-il des dégradations ?" (Oui/Non, photo obligatoire)
- Question 3 : "Commentaires supplémentaires" (Ouverte, pas de photo)

**Payload envoyé** :
```json
{
  "questionsChecklist": [
    {
      "id": "q-1",
      "intitule": "Le logement est-il propre ?",
      "type": "oui-non",
      "photoObligatoire": true,
      "obligatoire": true
    },
    {
      "id": "q-2",
      "intitule": "Y a-t-il des dégradations ?",
      "type": "oui-non",
      "photoObligatoire": true,
      "obligatoire": false
    },
    {
      "id": "q-3",
      "intitule": "Commentaires supplémentaires",
      "type": "ouverte",
      "photoObligatoire": false,
      "obligatoire": false
    }
  ]
}
```

---

## 🔧 Logique de fallback

Si `questionsChecklist` n'est pas défini, le système utilise **toujours** un tableau vide `[]` :

```typescript
const questionsChecklist = typeof logementData.modele === 'string'
  ? [] // ✅ Tableau vide pour modèles prédéfinis
  : (logementData.modele.questionsChecklist || []); // ✅ Tableau vide si non défini
```

Cela garantit que :
- Aucun webhook n'est envoyé avec `undefined` ou `null`
- Le comportement par défaut est un tableau vide (pas de questions)
- Pas de risque d'erreur côté Bubble.io

---

## 📁 Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `src/types/modele.ts` | Définition de l'interface `QuestionModele` |
| `src/components/parcours/modele/CustomModeleBuilder.tsx` | Interface de configuration des questions |
| `server/services/webhookService.ts` | Extraction et envoi des questions dans les webhooks |

---

## ✅ Checklist de vérification

Lors de la création d'un logement avec un modèle personnalisé, vérifiez que :

- [ ] Le paramètre `questionsChecklist` est présent dans les logs du serveur
- [ ] Le nombre de questions affiché correspond au nombre configuré dans le modèle
- [ ] Pour les modèles prédéfinis, le nombre de questions est 0
- [ ] Pour les modèles personnalisés, les questions sont correctement extraites
- [ ] Le payload envoyé à Bubble.io contient bien le tableau de questions

---

## 🐛 Débogage

### Vérifier le nombre de questions dans les logs

**Backend** :
```bash
npm run server
```

Cherchez dans les logs :
```
Questions checklist: 3
```

### Vérifier le payload envoyé

Ajoutez un `console.log` temporaire dans `webhookService.ts` :

```typescript
console.log('📦 Questions checklist:', JSON.stringify(questionsChecklist, null, 2));
```

### Tester manuellement

```bash
curl -X POST http://localhost:3001/api/send-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "conciergerieID": "test123",
    "userID": "user456",
    "isTestMode": true,
    "logementData": {
      "nom": "Test Logement",
      "parcoursType": "menage",
      "modele": {
        "id": "custom-test",
        "nom": "Test Modele",
        "type": "menage",
        "pieces": [],
        "questionsChecklist": [
          {
            "id": "q-1",
            "intitule": "Test question",
            "type": "oui-non",
            "photoObligatoire": true,
            "obligatoire": true
          }
        ]
      },
      "pieces": [],
      "piecesPhotos": {}
    }
  }'
```

Vérifiez que le log affiche :
```
Questions checklist: 1
```

---

## 📊 Impact sur Bubble.io

Ce paramètre permet à Bubble.io de :

1. **Créer les questions de checklist** dans le parcours d'inspection
2. **Configurer les types de questions** (Oui/Non ou Ouverte)
3. **Définir les obligations** (photo obligatoire, question obligatoire)
4. **Personnaliser l'expérience** d'inspection selon les besoins du client

---

## 🚀 Prochaines étapes

Si vous souhaitez ajouter d'autres types de questions, vous pouvez étendre les valeurs possibles :

```typescript
type QuestionType = "oui-non" | "ouverte" | "choix-multiple" | "notation";
```

Mais pour l'instant, seuls `"oui-non"` et `"ouverte"` sont supportés.

