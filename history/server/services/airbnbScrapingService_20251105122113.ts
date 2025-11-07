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
import { SCRAPING_CONFIG } from '../config/scrapingConfig';
import { sendWebhookToBubble } from './webhookService';
import type {
  ExtractionStartResponse,
  CollectedStreamData,
  ScrapingResult,
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
    const base64Image = await downloadAndConvertToBase64(image.url, i);
    base64Images.push(base64Image);
  }

  // Compter combien sont en base64 vs URL
  const base64Count = base64Images.filter(img => img.startsWith('data:image')).length;
  const urlCount = base64Images.length - base64Count;

  console.log(`   ✅ Conversion terminée: ${base64Count} en base64, ${urlCount} en URL (erreurs)`);

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
  console.log(`⏳ Attente de 2 secondes avant de se connecter au stream...`);

  // Attendre 2 secondes pour que l'extraction démarre
  await new Promise(resolve => setTimeout(resolve, 2000));

  return data.extraction_id;
}

/**
 * Récupère les données complètes de l'extraction (polling jusqu'à ce que l'extraction soit terminée)
 */
async function getCompleteData(extractionId: string): Promise<CollectedStreamData> {
  console.log(`📡 Récupération des données complètes...`);
  console.log(`   Extraction ID: ${extractionId}`);

  const maxAttempts = 40; // 40 tentatives max (2 minutes avec 3 secondes entre chaque)
  let attempts = 0;

  // ÉTAPE 1 : Polling sur /api/status jusqu'à ce que status === "completed"
  const statusUrl = `${SCRAPING_CONFIG.scrapingServiceUrl}${SCRAPING_CONFIG.endpoints.status}/${extractionId}`;
  console.log(`   📊 Polling du statut: ${statusUrl}`);

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const statusResponse = await fetch(statusUrl);

      if (!statusResponse.ok) {
        throw new Error(`Erreur HTTP ${statusResponse.status}: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();

      // Vérifier si l'extraction existe
      if (statusData.error && statusData.error.includes('non trouvée')) {
        throw new Error(`Extraction introuvable: ${extractionId}`);
      }

      const { status, progress, message } = statusData;

      console.log(`   ⏳ Tentative ${attempts}/${maxAttempts}: ${progress}% - ${message}`);

      if (status === 'completed') {
        console.log(`   ✅ Extraction terminée après ${attempts} tentative(s)`);
        break;
      }

      if (status === 'error') {
        throw new Error(`Erreur lors de l'extraction: ${statusData.error || message}`);
      }

      // Attendre 3 secondes avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`   ❌ Erreur lors du polling:`, error);
      throw error;
    }
  }

  if (attempts >= maxAttempts) {
    throw new Error(`Timeout: l'extraction n'a pas terminé après ${maxAttempts} tentatives (${maxAttempts * 3} secondes)`);
  }

  // ÉTAPE 2 : Récupérer les données complètes
  const completeUrl = `${SCRAPING_CONFIG.scrapingServiceUrl}${SCRAPING_CONFIG.endpoints.complete}/${extractionId}?user_type=${SCRAPING_CONFIG.streaming.defaultUserType}&include_ai_tasks=true&include_preselected_tasks=true`;
  console.log(`   📦 Récupération des données: ${completeUrl}`);

  const response = await fetch(completeUrl);

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  console.log(`✅ Données complètes récupérées`);
  console.log(`   Structure des données:`, JSON.stringify(data, null, 2).substring(0, 1000));

  // Vérifier que les données nécessaires sont présentes
  if (!data.rooms) {
    throw new Error('Données d\'extraction incomplètes: rooms manquant');
  }

  // Transformer les données au format attendu par le reste du code
  const collectedData: CollectedStreamData = {
    metadata: data.metadata || {},
    propertyInfo: data.property_info || {},
    stats: {
      rooms_found: data.stats?.total_rooms || 0,
      total_images: data.stats?.total_images || 0,
      ai_used: true,
      extraction_method: 'rest'
    },
    rooms: data.rooms,
    tasks: Object.entries(data.rooms || {}).reduce((acc: any, [roomType, roomData]: [string, any]) => {
      // Récupérer les tâches pour cette pièce
      const aiTasks = roomData.ai_tasks || [];
      const preselectedTasks = roomData.preselected_tasks || [];

      acc[roomType] = {
        total_tasks: aiTasks.length + preselectedTasks.length,
        ai_generated_tasks: aiTasks,
        preselected_tasks: preselectedTasks
      };
      return acc;
    }, {})
  };

  return collectedData;
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
    Object.entries(data.rooms).map(async ([roomType, roomImages]) => {
      const tasksData = data.tasks?.[roomType];

      // Mapper le nom de la pièce
      const mappedRoomName = SCRAPING_CONFIG.roomTypeMapping[roomType as keyof typeof SCRAPING_CONFIG.roomTypeMapping] || roomType;

      // Transformer les tâches AI
      const tasks = tasksData?.ai_generated_tasks?.map((task: AIGeneratedTask) => ({
        emoji: extractEmoji(task.title),
        titre: cleanTitle(task.title),
        description: task.description,
        photoObligatoire: task.photo_required
      })) || [];

      // roomImages est un tableau d'objets image
      const images = Array.isArray(roomImages) ? roomImages : [];

      console.log(`\n   🏠 ${mappedRoomName}: ${tasks?.length || 0} tâches, ${images.length} photos`);

      // Télécharger et convertir les photos en base64
      const photosBase64 = await downloadRoomImages(images);

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

    // 2. Récupérer les données complètes (polling jusqu'à ce que l'extraction soit terminée)
    const scrapedData = await getCompleteData(extractionId);
    
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

