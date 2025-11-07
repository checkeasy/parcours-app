/**
 * Configuration du service de scraping Airbnb
 * 
 * Ce fichier centralise toutes les URLs et configurations
 * liées au service de scraping externe.
 */

export const SCRAPING_CONFIG = {
  /**
   * URL de base du service de scraping Airbnb
   * Par défaut: http://localhost:5000
   * En production: définir via SCRAPING_SERVICE_URL
   */
  scrapingServiceUrl: process.env.SCRAPING_SERVICE_URL || 'http://localhost:5000',
  
  /**
   * Endpoints du service de scraping
   */
  endpoints: {
    /**
     * POST /api/extract
     * Lance une extraction Airbnb
     * Body: { url: string }
     * Response: { extraction_id: string, status: string, message: string }
     */
    extract: '/api/extract',
    
    /**
     * GET /api/status/{extraction_id}
     * Vérifie le statut d'une extraction
     * Response: { status: string, progress: number, message: string }
     */
    status: '/api/status',
    
    /**
     * GET /api/extraction/stream/{extraction_id}
     * Stream SSE des données d'extraction
     * Query params: user_type=menage|voyageur, delay_ms=100
     */
    stream: '/api/extraction/stream',
    
    /**
     * GET /api/extraction/complete/{extraction_id}
     * Récupère les données complètes (REST)
     * Query params: user_type=menage|voyageur
     */
    complete: '/api/extraction/complete'
  },
  
  /**
   * Configuration du streaming
   */
  streaming: {
    /**
     * Type d'utilisateur par défaut pour le scraping
     */
    defaultUserType: 'menage' as const,
    
    /**
     * Délai entre les événements SSE (en ms)
     */
    delayMs: 100,
    
    /**
     * Timeout pour l'extraction complète (en ms)
     * Par défaut: 2 minutes
     */
    extractionTimeout: 120000,
    
    /**
     * Nombre de tentatives en cas d'échec
     */
    maxRetries: 3,
    
    /**
     * Délai entre les tentatives (en ms)
     */
    retryDelay: 2000
  },
  
  /**
   * Mapping des types de pièces Airbnb vers les pièces CheckEasy
   */
  roomTypeMapping: {
    'salon': 'Salon',
    'cuisine': 'Cuisine',
    'chambre': 'Chambre',
    'salle_de_bain': 'Salle de bain',
    'salle de bain': 'Salle de bain',
    'exterieur': 'Extérieur',
    'photos_supplémentaires': 'Autres',
    'photos supplémentaires': 'Autres',
    'entrée': 'Entrée',
    'couloir': 'Couloir',
    'wc': 'WC',
    'buanderie': 'Buanderie',
    'balcon': 'Balcon',
    'terrasse': 'Terrasse',
    'jardin': 'Jardin'
  } as const
} as const;

/**
 * Type pour les types de pièces Airbnb
 */
export type AirbnbRoomType = keyof typeof SCRAPING_CONFIG.roomTypeMapping;

/**
 * Type pour les types de pièces CheckEasy
 */
export type CheckEasyRoomType = typeof SCRAPING_CONFIG.roomTypeMapping[AirbnbRoomType];

/**
 * Type pour le type d'utilisateur
 */
export type UserType = 'menage' | 'voyageur';

