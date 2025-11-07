/**
 * Routes pour le scraping Airbnb
 * 
 * Endpoints:
 * - POST /api/scrape-and-create-parcours : Scrape une annonce et crée le parcours
 */

import express, { Request, Response } from 'express';
import { scrapeAndCreateParcoursV2 } from '../services/airbnbScrapingServiceV2';
import type {
  ScrapeAndCreateParcoursPayload,
  ScrapeAndCreateParcoursResponse
} from '../types/scraping';

export const scrapingRouter = express.Router();

/**
 * POST /api/scrape-and-create-parcours
 * 
 * Scrape une annonce Airbnb et crée automatiquement le parcours
 * 
 * Body:
 * {
 *   url: string,                    // URL de l'annonce Airbnb
 *   conciergerieID: string,         // ID de la conciergerie
 *   userID: string,                 // ID de l'utilisateur
 *   isTestMode: boolean,            // Mode test ou production
 *   parcoursType?: 'menage' | 'voyageur'  // Optionnel, sera déterminé automatiquement
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   extractionId: string,
 *   parcoursType: 'menage' | 'voyageur',  // ÉTAPE 2 OBLIGATOIRE
 *   message: string,
 *   data: ScrapingResult
 * }
 */
scrapingRouter.post('/scrape-and-create-parcours', async (req: Request, res: Response) => {
  try {
    console.log('\n🔥 ROUTE /scrape-and-create-parcours APPELÉE !');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { url, conciergerieID, userID, isTestMode, parcoursType } = req.body;
    
    // Validation des champs requis
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Le champ "url" est requis'
      });
    }
    
    if (!url.includes('airbnb')) {
      return res.status(400).json({
        success: false,
        error: 'URL Airbnb invalide. L\'URL doit contenir "airbnb"'
      });
    }
    
    if (!conciergerieID) {
      return res.status(400).json({
        success: false,
        error: 'Le champ "conciergerieID" est requis'
      });
    }
    
    if (!userID) {
      return res.status(400).json({
        success: false,
        error: 'Le champ "userID" est requis'
      });
    }
    
    if (typeof isTestMode !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Le champ "isTestMode" doit être un boolean'
      });
    }
    
    // Validation optionnelle du type de parcours
    if (parcoursType && !['menage', 'voyageur'].includes(parcoursType)) {
      return res.status(400).json({
        success: false,
        error: 'Le champ "parcoursType" doit être "menage" ou "voyageur"'
      });
    }
    
    console.log(`\n📨 Requête de scraping reçue:`);
    console.log(`   URL: ${url}`);
    console.log(`   Conciergerie: ${conciergerieID}`);
    console.log(`   User: ${userID}`);
    console.log(`   Mode test: ${isTestMode ? 'OUI' : 'NON'}`);
    console.log(`   Type parcours: ${parcoursType || 'auto'}\n`);
    
    // Préparer le payload
    const payload: ScrapeAndCreateParcoursPayload = {
      url,
      conciergerieID,
      userID,
      isTestMode,
      parcoursType
    };
    
    // Lancer le scraping et la création (asynchrone)
    const result = await scrapeAndCreateParcours(payload);
    
    // Préparer la réponse avec le type de parcours (ÉTAPE 2 OBLIGATOIRE)
    const response: ScrapeAndCreateParcoursResponse = {
      success: true,
      extractionId: result.extractionId,
      parcoursType: result.parcoursType, // ← ÉTAPE 2 OBLIGATOIRE
      message: 'Parcours créé avec succès depuis l\'annonce Airbnb',
      data: result
    };
    
    console.log(`\n✅ Réponse envoyée au client:`);
    console.log(`   Extraction ID: ${result.extractionId}`);
    console.log(`   Type parcours: ${result.parcoursType}`);
    console.log(`   Pièces: ${result.stats.totalRooms}`);
    console.log(`   Tâches: ${result.stats.totalTasks}`);
    console.log(`   Images: ${result.stats.totalImages}\n`);
    
    res.json(response);
    
  } catch (error: any) {
    console.error('\n❌ Erreur lors du scraping:', error);
    
    // Déterminer le code d'erreur approprié
    let statusCode = 500;
    let errorMessage = error.message || 'Erreur interne du serveur';
    
    if (error.message?.includes('Timeout')) {
      statusCode = 504;
      errorMessage = 'Le scraping a pris trop de temps. Veuillez réessayer.';
    } else if (error.message?.includes('HTTP')) {
      statusCode = 502;
      errorMessage = 'Erreur de communication avec le service de scraping.';
    } else if (error.message?.includes('connexion')) {
      statusCode = 503;
      errorMessage = 'Le service de scraping est indisponible.';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/scraping/health
 * 
 * Vérifie la santé du service de scraping
 */
scrapingRouter.get('/scraping/health', async (req: Request, res: Response) => {
  try {
    const { SCRAPING_CONFIG } = await import('../config/scrapingConfig');
    const fetch = (await import('node-fetch')).default;
    
    const healthUrl = `${SCRAPING_CONFIG.scrapingServiceUrl}/health`;
    
    console.log(`🏥 Vérification santé du service de scraping: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Service de scraping opérationnel`);
      
      res.json({
        success: true,
        message: 'Service de scraping opérationnel',
        scrapingService: {
          url: SCRAPING_CONFIG.scrapingServiceUrl,
          status: 'healthy',
          data
        }
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
    
  } catch (error: any) {
    console.error(`❌ Service de scraping indisponible:`, error.message);
    
    res.status(503).json({
      success: false,
      message: 'Service de scraping indisponible',
      error: error.message
    });
  }
});

/**
 * GET /api/scraping/config
 * 
 * Retourne la configuration du scraping (pour debug)
 */
scrapingRouter.get('/scraping/config', (req: Request, res: Response) => {
  const { SCRAPING_CONFIG } = require('../config/scrapingConfig');
  
  res.json({
    scrapingServiceUrl: SCRAPING_CONFIG.scrapingServiceUrl,
    endpoints: SCRAPING_CONFIG.endpoints,
    streaming: SCRAPING_CONFIG.streaming,
    roomTypeMapping: SCRAPING_CONFIG.roomTypeMapping
  });
});

