/**
 * Service de scraping Airbnb V2 - NOUVELLE API PORT 8000
 *
 * Utilise les nouveaux endpoints du service Python (port 8000) :
 * - POST /api/extract : Lance l'extraction avec auto_detect_ai, method, use_ai_classification
 * - GET /api/status/:id : Retourne le statut ET les données complètes directement
 *
 * Workflow V2 (simplifié) :
 * 1. POST /api/extract → extraction_id
 * 2. Polling GET /api/status/:id → données complètes quand status = "completed"
 * 3. Télécharge et convertit les images en base64
 * 4. Retourne les données au frontend pour classification par l'utilisateur
 * 5. Le webhook est envoyé APRÈS validation de la classification par l'utilisateur
 */

import fetch from 'node-fetch';
import { SCRAPING_CONFIG } from '../config/scrapingConfig';
import type {
  ScrapeAndCreateParcoursPayload
} from '../types/scraping';

/**
 * Interface pour la réponse de POST /api/extract
 */
interface ExtractionStartResponse {
  extraction_id: string;
  status: string;
  message: string;
}

/**
 * Interface pour une image dans room_tour_images
 */
interface RoomImage {
  room_name: string;
  room_type: string;
  image_id: string;
  original_url: string;
  accessibility_label?: string;
  filename?: string;
  local_path?: string;
  downloaded?: boolean;
  highlights?: string[];
  source?: string;
}

/**
 * Interface pour une pièce dans room_tour_images
 */
interface RoomTourItem {
  room_name: string;
  room_type: string;
  highlights?: string[];
  images: RoomImage[];
  total_images: number;
}

/**
 * Interface pour la réponse RÉELLE de GET /api/status/:id
 * Basée sur la vraie structure retournée par l'API port 8000
 */
interface StatusResponse {
  id: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
  data?: {
    metadata?: {
      extraction_time?: string;
      source_file?: string;
      page_title?: string;
      [key: string]: any;
    };
    raw_title?: string;
    room_tour_images?: RoomTourItem[];
    download_stats?: {
      total_images: number;
      downloaded: number;
      failed: number;
      by_room: Record<string, number>;
    };
  };
}

/**
 * Télécharge une image depuis une URL et la convertit en base64
 */
async function downloadAndConvertToBase64(imageUrl: string, index: number): Promise<string> {
  try {
    console.log(`      📥 [${index + 1}] Téléchargement: ${imageUrl.substring(0, 80)}...`);

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`      ✅ [${index + 1}] Converti: ${sizeKB} KB`);

    return dataUrl;
  } catch (error: any) {
    console.error(`      ❌ [${index + 1}] Erreur: ${error.message}`);
    return imageUrl; // Retourner l'URL originale en cas d'erreur
  }
}

/**
 * Lance une extraction Airbnb avec les nouveaux paramètres
 */
async function startExtraction(airbnbUrl: string): Promise<string> {
  const url = `${SCRAPING_CONFIG.scrapingServiceUrl}${SCRAPING_CONFIG.endpoints.extract}`;
  
  console.log(`🌐 Lancement extraction Airbnb...`);
  console.log(`   URL: ${airbnbUrl}`);
  console.log(`   Endpoint: ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: airbnbUrl,
      auto_detect_ai: true,
      method: 'intelligent_html_extraction',
      use_ai_classification: false
    })
  });
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json() as ExtractionStartResponse;
  
  console.log(`✅ Extraction lancée: ${data.extraction_id}`);
  console.log(`⏳ Attente de 2 secondes avant de commencer le polling...`);

  await new Promise(resolve => setTimeout(resolve, 2000));

  return data.extraction_id;
}

/**
 * Polling sur /api/status jusqu'à ce que l'extraction soit terminée
 * Retourne directement les données complètes
 */
async function pollStatusUntilComplete(extractionId: string): Promise<StatusResponse> {
  console.log(`📡 Polling du statut de l'extraction...`);
  console.log(`   Extraction ID: ${extractionId}`);

  const maxAttempts = 60; // 60 tentatives max (3 minutes)
  let attempts = 0;

  const statusUrl = `${SCRAPING_CONFIG.scrapingServiceUrl}${SCRAPING_CONFIG.endpoints.status}/${extractionId}`;
  console.log(`   📊 URL: ${statusUrl}`);

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const response = await fetch(statusUrl);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const statusData = await response.json() as StatusResponse;

      // Vérifier si l'extraction existe
      if (statusData.error) {
        throw new Error(`Erreur API: ${statusData.error}`);
      }

      console.log(`   ⏳ Tentative ${attempts}/${maxAttempts}: ${statusData.progress}% - ${statusData.message}`);

      if (statusData.status === 'completed') {
        console.log(`   ✅ Extraction terminée après ${attempts} tentative(s)`);

        // Vérifier que les données sont présentes
        if (!statusData.data) {
          throw new Error('Les données sont manquantes dans la réponse');
        }

        // Vérifier que room_tour_images existe
        if (!statusData.data.room_tour_images || statusData.data.room_tour_images.length === 0) {
          console.warn('   ⚠️ Aucune pièce trouvée dans room_tour_images');
        }

        return statusData;
      }

      if (statusData.status === 'error') {
        throw new Error(`Erreur lors de l'extraction: ${statusData.error || statusData.message}`);
      }

      // Attendre 3 secondes avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`   ❌ Erreur lors du polling:`, error);
      throw error;
    }
  }

  throw new Error(`Timeout: l'extraction n'a pas terminé après ${maxAttempts * 3} secondes`);
}

/**
 * Transforme les données RÉELLES de /api/status en format parcours CheckEasy
 * Utilise room_tour_images qui contient les images BIEN GROUPÉES par pièce
 */
async function transformToParcoursFormat(
  statusData: StatusResponse
) {
  console.log(`🔄 Transformation des données en format parcours...`);

  const data = statusData.data!;
  const roomTourImages = data.room_tour_images || [];
  const rawTitle = data.raw_title || 'Logement Airbnb';

  console.log(`   📊 Titre: ${rawTitle}`);
  console.log(`   🏠 Pièces détectées: ${roomTourImages.length}`);

  // Afficher le détail des pièces
  roomTourImages.forEach(room => {
    console.log(`      - ${room.room_name} (${room.room_type}): ${room.total_images} images`);
  });

  // Transformer chaque pièce
  const pieces = await Promise.all(
    roomTourImages.map(async (room) => {
      // Mapper le nom de la pièce
      const mappedRoomName = SCRAPING_CONFIG.roomTypeMapping[room.room_type as keyof typeof SCRAPING_CONFIG.roomTypeMapping] || room.room_name;

      console.log(`\n   🏠 Traitement: ${mappedRoomName} (${room.total_images} images)`);

      // Télécharger et convertir les photos en base64
      console.log(`   📸 Téléchargement de ${room.images.length} images...`);
      const photosBase64: string[] = [];

      for (let i = 0; i < room.images.length; i++) {
        const image = room.images[i];
        const base64Image = await downloadAndConvertToBase64(image.original_url, i);
        photosBase64.push(base64Image);
      }

      const base64Count = photosBase64.filter(img => img.startsWith('data:image')).length;
      console.log(`   ✅ Conversion: ${base64Count}/${room.images.length} en base64`);

      // Pour l'instant, pas de tâches AI dans cette version de l'API
      // On utilisera les tâches par défaut de CheckEasy
      const tasks: any[] = [];

      return {
        nom: mappedRoomName,
        quantite: 1,
        tasks,
        photos: photosBase64
      };
    })
  );

  const totalImages = pieces.reduce((sum, piece) => sum + piece.photos.length, 0);

  console.log(`\n✅ Transformation terminée: ${pieces.length} pièces, ${totalImages} images`);

  return {
    propertyInfo: {
      name: rawTitle,
      title: rawTitle,
      totalImages: data.download_stats?.total_images || totalImages
    },
    pieces,
    stats: {
      totalRooms: pieces.length,
      totalTasks: 0, // Pas de tâches AI pour l'instant
      totalImages
    }
  };
}

/**
 * Fonction principale : Scrape Airbnb et prépare les données pour classification
 *
 * Note: Cette fonction NE crée PAS le parcours directement.
 * Elle extrait et transforme les données, puis les retourne au frontend.
 * Le parcours sera créé (via webhook) APRÈS que l'utilisateur valide la classification des pièces.
 */
export async function scrapeAndCreateParcoursV2(
  payload: ScrapeAndCreateParcoursPayload
) {
  const { url, conciergerieID, userID, isTestMode, parcoursType: requestedParcoursType } = payload;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 SCRAPING V2 - VERSION SIMPLIFIÉE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   URL Airbnb: ${url}`);
  console.log(`   Conciergerie: ${conciergerieID}`);
  console.log(`   User: ${userID}`);
  console.log(`   Mode test: ${isTestMode ? 'OUI' : 'NON'}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    // 1. Lancer l'extraction
    const extractionId = await startExtraction(url);

    // 2. Polling jusqu'à complétion (les données sont dans la réponse)
    const statusData = await pollStatusUntilComplete(extractionId);
    
    // 3. Déterminer le type de parcours
    const parcoursType = requestedParcoursType || 'menage';
    console.log(`\n📋 Type de parcours: ${parcoursType.toUpperCase()}`);

    // 4. Transformer en format parcours et télécharger les images
    console.log(`\n📥 Téléchargement et conversion des images...`);
    const parcoursData = await transformToParcoursFormat(statusData);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ EXTRACTION ET TRANSFORMATION TERMINÉES`);
    console.log(`   Les données sont prêtes pour la classification par l'utilisateur`);
    console.log(`   Le webhook sera envoyé après validation de la classification`);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
      extractionId,
      parcoursType,
      ...parcoursData
    };
    
  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ ERREUR LORS DU SCRAPING V2`);
    console.error(`${'='.repeat(60)}`);
    console.error(error);
    console.error(`${'='.repeat(60)}\n`);
    throw error;
  }
}

