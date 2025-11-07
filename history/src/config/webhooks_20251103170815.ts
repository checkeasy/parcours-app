export const webhookConfig = {
  // Étape 1 : Création du logement et du parcours (sans les pièces)
  createLogement: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour',
  },

  // Étape 2 : Création de chaque pièce individuellement
  createPiece: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createpiece/initialize',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createpiece/initialize',
  },
} as const;

export type WebhookConfig = typeof webhookConfig;