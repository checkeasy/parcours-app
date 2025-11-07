export const webhookConfig = {
  // Étape 1 : Création du logement et du parcours (sans les pièces)
  createLogement: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour/initialize',
  },

  // Étape 2 : Création de chaque pièce individuellement
  createPiece: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createpiece/',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createpiece',
  },

  // Suppression d'un modèle personnalisé (parcours modèle)
  deleteModele: {
    production: 'https://checkeasy-57905.bubbleapps.io/api/1.1/wf/apideletemodele',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/apideletemodele',
  },
} as const;

export type WebhookConfig = typeof webhookConfig;