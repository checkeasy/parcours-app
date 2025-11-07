/**
 * Configuration centralisée des endpoints Bubble.io
 *
 * Tous les endpoints de l'API Bubble.io côté frontend sont définis ici avec leurs versions
 * test et production.
 *
 * ⚠️ Note: Les endpoints côté backend sont définis dans `server/services/webhookService.ts`
 *
 * 📝 Convention de nommage:
 * - test: https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/...
 * - production: https://checkeasy-57905.bubbleapps.io/api/1.1/wf/...
 *
 * 🔧 Utilisation:
 * ```typescript
 * import { getBubbleEndpoint } from '@/config/bubbleEndpoints';
 *
 * const endpoint = getBubbleEndpoint('loadModeles', isTestMode);
 * ```
 */

export const BUBBLE_ENDPOINTS = {
  /**
   * Endpoint pour charger les modèles personnalisés depuis Bubble.io
   *
   * Méthode: GET
   * Paramètre: conciergerie (ID de la conciergerie)
   *
   * Exemple: GET /apireturnmodeleforapp?conciergerie=1730741276842x778024514623373300
   */
  loadModeles: {
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/apireturnmodeleforapp',
    production: 'https://checkeasy-57905.bubbleapps.io/api/1.1/wf/apireturnmodeleforapp',
  },
};

/**
 * Récupère l'endpoint approprié selon le mode (test ou production)
 * 
 * @param endpointKey - Clé de l'endpoint dans BUBBLE_ENDPOINTS
 * @param isTestMode - Mode test (true) ou production (false)
 * @returns URL de l'endpoint
 */
export const getBubbleEndpoint = (
  endpointKey: keyof typeof BUBBLE_ENDPOINTS,
  isTestMode: boolean = true
): string => {
  const endpoint = BUBBLE_ENDPOINTS[endpointKey];
  return isTestMode ? endpoint.test : endpoint.production;
};

