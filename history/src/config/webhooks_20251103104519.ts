export const webhookConfig = {
  productionEndpoint: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour/initialize',
  testEndpoint: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour/initialize',
} as const;

export type WebhookConfig = typeof webhookConfig;