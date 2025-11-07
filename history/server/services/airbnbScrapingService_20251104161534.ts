/**
 * Service de scraping Airbnb avec streaming SSE
 *
 * Ce service gère l'intégration complète avec le service de scraping externe :
 * 1. Lance l'extraction
 * 2. Écoute le stream SSE
 * 3. Télécharge et convertit les images en base64
 * 4. Transforme les données en format parcours
 * 5. Envoie le webhook à Bubble.io
 */

import fetch from 'node-fetch';
import { EventSource } from 'eventsource';
import { SCRAPING_CONFIG } from '../config/scrapingConfig';
import { sendWebhookToBubble } from './webhookService';
import type {
  ExtractionStartResponse,
  CollectedStreamData,
  ScrapingResult,
  SSEEvent,
  AIGeneratedTask,
  ScrapeAndCreateParcoursPayload
} from '../types/scraping';

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

    // Récupérer le buffer de l'image
    const buffer = await response.buffer();

    // Déterminer le type MIME depuis les headers ou l'URL
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Convertir en base64
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    const sizeKB = (buffer.length / 1024).toFixed(2);
    const preview = dataUrl.substring(0, 50);
    console.log(`      ✅ [${index + 1}] Converti: ${sizeKB} KB - Preview: ${preview}...`);

    return dataUrl;
  } catch (error: any) {
    console.error(`      ❌ [${index + 1}] Erreur téléchargement image: ${error.message}`);
    console.error(`      ⚠️  [${index + 1}] Retour de l'URL originale: ${imageUrl}`);
    // Retourner l'URL originale en cas d'erreur
    return imageUrl;
  }
}

/**
 * Télécharge et convertit toutes les images d'une pièce en base64
 */
async function downloadRoomImages(roomImages: any[]): Promise<string[]> {
  console.log(`   📸 Téléchargement de ${roomImages.length} images...`);

  const base64Images: string[] = [];

  for (let i = 0; i < roomImages.length; i++) {
    const image = roomImages[i];
    const base64Image = await downloadAndConvertToBase64(image.url);
    base64Images.push(base64Image);
  }

  console.log(`   ✅ ${base64Images.length} images converties en base64`);

  return base64Images;
}

/**
 * Lance une extraction Airbnb
 */
async function startExtraction(airbnbUrl: string): Promise<string> {
  const url = `${SCRAPING_CONFIG.scrapingServiceUrl}${SCRAPING_CONFIG.endpoints.extract}`;
  
  console.log(`🌐 Lancement extraction Airbnb...`);
  console.log(`   URL: ${airbnbUrl}`);
  console.log(`   Endpoint: ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: airbnbUrl })
  });
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json() as ExtractionStartResponse;
  
  console.log(`✅ Extraction lancée: ${data.extraction_id}`);
  
  return data.extraction_id;
}

/**
 * Écoute le stream SSE et collecte les données
 */
async function listenToStream(extractionId: string): Promise<CollectedStreamData> {
  return new Promise((resolve, reject) => {
    const streamUrl = `${SCRAPING_CONFIG.scrapingServiceUrl}${SCRAPING_CONFIG.endpoints.stream}/${extractionId}?user_type=${SCRAPING_CONFIG.streaming.defaultUserType}&delay_ms=${SCRAPING_CONFIG.streaming.delayMs}`;
    
    console.log(`📡 Connexion au stream SSE...`);
    console.log(`   URL: ${streamUrl}`);
    
    const eventSource = new EventSource(streamUrl);
    
    const collectedData: CollectedStreamData = {
      metadata: null,
      propertyInfo: null,
      stats: null,
      rooms: {},
      tasks: {}
    };
    
    let eventCount = 0;
    
    // Timeout de sécurité
    const timeout = setTimeout(() => {
      eventSource.close();
      reject(new Error(`Timeout: extraction trop longue (>${SCRAPING_CONFIG.streaming.extractionTimeout}ms)`));
    }, SCRAPING_CONFIG.streaming.extractionTimeout);
    
    eventSource.onmessage = (event: any) => {
      try {
        const message = JSON.parse(event.data) as SSEEvent;
        eventCount++;
        
        console.log(`   📨 Événement ${eventCount}: ${message.type}`);
        
        switch (message.type) {
          case 'metadata':
            collectedData.metadata = message.data;
            break;
            
          case 'property_info':
            collectedData.propertyInfo = message.data;
            console.log(`      Propriété: ${message.data.name}`);
            break;
            
          case 'stats':
            collectedData.stats = message.data;
            console.log(`      Stats: ${message.data.rooms_found} pièces, ${message.data.total_images} images`);
            break;
            
          case 'room':
            collectedData.rooms[message.room_type] = message.data;
            console.log(`      Pièce: ${message.room_type} (${message.data.images_count} images)`);
            break;
            
          case 'tasks':
            collectedData.tasks[message.room_type] = message.data;
            console.log(`      Tâches: ${message.room_type} (${message.data.total_tasks} tâches)`);
            break;
            
          case 'complete':
            clearTimeout(timeout);
            eventSource.close();
            console.log(`✅ Stream terminé: ${eventCount} événements reçus`);
            resolve(collectedData);
            break;
            
          case 'error':
            clearTimeout(timeout);
            eventSource.close();
            reject(new Error(message.error));
            break;
        }
      } catch (err) {
        console.error('❌ Erreur parsing SSE:', err);
      }
    };
    
    eventSource.onerror = (error: any) => {
      clearTimeout(timeout);
      eventSource.close();
      console.error('❌ Erreur connexion SSE:', error);
      reject(new Error('Erreur de connexion au stream'));
    };
  });
}

/**
 * Détermine le type de parcours basé sur les données scrapées
 * Par défaut: 'menage' (peut être étendu avec de la logique plus complexe)
 */
function determineParcoursType(data: CollectedStreamData): 'menage' | 'voyageur' {
  // Pour l'instant, on retourne toujours 'menage'
  // Cette fonction peut être étendue pour analyser les données et déterminer le type
  // Par exemple: si beaucoup de tâches liées au check-in/check-out → 'voyageur'
  
  return 'menage';
}

/**
 * Extrait l'emoji d'un titre de tâche
 */
function extractEmoji(title: string): string {
  const emojiMatch = title.match(/^([\u{1F300}-\u{1F9FF}])/u);
  return emojiMatch ? emojiMatch[1] : '✓';
}

/**
 * Nettoie le titre en retirant l'emoji
 */
function cleanTitle(title: string): string {
  return title.replace(/^[\u{1F300}-\u{1F9FF}\s]+/u, '').trim();
}

/**
 * Transforme les données scrapées en format parcours CheckEasy
 * Télécharge et convertit les images en base64
 */
async function transformToParcoursFormat(
  data: CollectedStreamData,
  parcoursType: 'menage' | 'voyageur'
): Promise<Omit<ScrapingResult, 'extractionId' | 'parcoursType'>> {

  console.log(`🔄 Transformation des données en format parcours...`);

  const pieces = await Promise.all(
    Object.entries(data.rooms).map(async ([roomType, roomData]) => {
      const tasksData = data.tasks[roomType];

      // Mapper le nom de la pièce
      const mappedRoomName = SCRAPING_CONFIG.roomTypeMapping[roomType as keyof typeof SCRAPING_CONFIG.roomTypeMapping] || roomType;

      // Transformer les tâches AI
      const tasks = tasksData?.ai_generated_tasks.map((task: AIGeneratedTask) => ({
        emoji: extractEmoji(task.title),
        titre: cleanTitle(task.title),
        description: task.description,
        photoObligatoire: task.photo_required
      })) || [];

      console.log(`\n   🏠 ${mappedRoomName}: ${tasks.length} tâches, ${roomData.images.length} photos`);

      // Télécharger et convertir les photos en base64
      const photosBase64 = await downloadRoomImages(roomData.images);

      return {
        nom: mappedRoomName,
        quantite: 1,
        tasks,
        photos: photosBase64 // Maintenant ce sont des strings base64
      };
    })
  );

  const totalTasks = pieces.reduce((sum, piece) => sum + piece.tasks.length, 0);
  const totalImages = pieces.reduce((sum, piece) => sum + piece.photos.length, 0);

  console.log(`\n✅ Transformation terminée: ${pieces.length} pièces, ${totalTasks} tâches, ${totalImages} images`);

  return {
    propertyInfo: {
      name: data.propertyInfo?.name || 'Propriété Airbnb',
      title: data.propertyInfo?.title || 'Propriété Airbnb',
      totalImages: data.stats?.total_images || 0
    },
    pieces,
    stats: {
      totalRooms: pieces.length,
      totalTasks,
      totalImages
    }
  };
}

/**
 * Fonction principale : Scrape et crée le parcours
 */
export async function scrapeAndCreateParcours(
  payload: ScrapeAndCreateParcoursPayload
): Promise<ScrapingResult> {
  
  const { url, conciergerieID, userID, isTestMode, parcoursType: requestedParcoursType } = payload;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 SCRAPING ET CRÉATION DE PARCOURS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   URL Airbnb: ${url}`);
  console.log(`   Conciergerie: ${conciergerieID}`);
  console.log(`   User: ${userID}`);
  console.log(`   Mode test: ${isTestMode ? 'OUI' : 'NON'}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    // 1. Lancer l'extraction
    const extractionId = await startExtraction(url);
    
    // 2. Écouter le stream et collecter les données
    const scrapedData = await listenToStream(extractionId);
    
    // 3. Déterminer le type de parcours (ÉTAPE 2 OBLIGATOIRE)
    const parcoursType = requestedParcoursType || determineParcoursType(scrapedData);
    console.log(`\n📋 Type de parcours déterminé: ${parcoursType.toUpperCase()}`);

    // 4. Transformer en format parcours et télécharger les images en base64
    console.log(`\n📥 Téléchargement et conversion des images en base64...`);
    const parcoursData = await transformToParcoursFormat(scrapedData, parcoursType);
    
    // 5. Préparer les données pour le webhook
    const logementData = {
      nom: parcoursData.propertyInfo.name,
      logementId: extractionId,
      modele: parcoursType,
      pieces: parcoursData.pieces,
      piecesPhotos: parcoursData.pieces.reduce((acc, piece) => {
        acc[piece.nom] = piece.photos;
        return acc;
      }, {} as Record<string, any[]>)
    };
    
    // 6. Envoyer webhook à Bubble.io
    console.log(`\n📤 Envoi du webhook à Bubble.io...`);
    await sendWebhookToBubble({
      conciergerieID,
      userID,
      isTestMode,
      logementData
    });
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ PARCOURS CRÉÉ AVEC SUCCÈS`);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
      extractionId,
      parcoursType,
      ...parcoursData
    };
    
  } catch (error) {
    console.error(`\n${'='.repeat(60)}`);
    console.error(`❌ ERREUR LORS DU SCRAPING`);
    console.error(`${'='.repeat(60)}`);
    console.error(error);
    console.error(`${'='.repeat(60)}\n`);
    throw error;
  }
}

