import { ParcoursModele, PieceQuantity } from "@/types/modele";
import { getBubbleEndpoint } from "@/config/bubbleEndpoints";

// Backend server URL - automatically detects environment
const BACKEND_URL = import.meta.env.PROD
  ? window.location.origin  // In production, use the same origin (Railway URL)
  : 'http://localhost:3001'; // In development, use localhost

// Function to detect test mode from URL
export const isTestMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('version-test') === 'true';
};

// Function to get conciergerieID from URL
export const getConciergerieID = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('conciergerieID') || 'conciergerie_demo';
};

// Function to get userID from URL
export const getUserID = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('userID') || 'user_demo';
};

// Function to get logementID from URL
export const getLogementID = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('logementid');
};

// Function to dispatch webhook via backend server
export const dispatchWebhook = async (logementData: {
  nom: string;
  adresse?: string;
  airbnbLink?: string;
  parcoursType: "menage" | "voyageur";
  modele: "menage" | "voyageur" | ParcoursModele;
  pieces: PieceQuantity[];
  piecesPhotos: Record<string, string[]>;
  logementId?: string; // Optional: use existing ID or generate new one
}) => {
  try {
    // Use existing logement ID or generate a new one
    const logementId = logementData.logementId || `logement_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get parameters from URL
    const testMode = isTestMode();
    const conciergerieID = getConciergerieID();
    const userID = getUserID();
    const urlLogementId = getLogementID(); // Get logementid from URL if present

    // Determine parcourmode based on presence of logementid in URL
    const parcourmode = !!urlLogementId; // true if logementid is present, false otherwise

    // Prepare payload for backend
    const payload = {
      conciergerieID,
      userID,
      isTestMode: testMode,
      parcourmode, // Add parcourmode to payload
      logementid: urlLogementId || null, // Add logementid from URL (null if not present)
      logementData: {
        ...logementData,
        logementId,
      },
    };

    console.log('\n' + '='.repeat(60));
    console.log('📤 SENDING WEBHOOK TO BACKEND');
    console.log('='.repeat(60));
    console.log(`   🏠 Logement: ${logementData.nom}`);
    console.log(`   🔍 Paramètre version-test (URL): "${new URLSearchParams(window.location.search).get('version-test')}"`);
    console.log(`   🔧 testMode (isTestMode()): ${testMode}`);
    console.log(`   🔧 testMode (type): ${typeof testMode}`);
    console.log(`   🔧 testMode === true: ${testMode === true}`);
    console.log(`   🔧 testMode === false: ${testMode === false}`);
    console.log(`   🔧 Mode: ${testMode ? 'TEST (version-test)' : 'PRODUCTION (version-live)'}`);
    console.log(`   🏢 ConciergerieID: ${conciergerieID}`);
    console.log(`   👤 UserID: ${userID}`);
    console.log(`   🔗 Logement ID (URL): ${urlLogementId || 'NON PRÉSENT'}`);
    console.log(`   📋 Parcour Mode: ${parcourmode ? 'AVEC LOGEMENT (true)' : 'AUTONOME (false)'}`);
    console.log(`   📍 URL actuelle: ${window.location.href}`);
    console.log(`   📦 Payload.isTestMode: ${payload.isTestMode}`);
    console.log(`   📦 Payload.parcourmode: ${payload.parcourmode}`);
    console.log(`   📦 Payload.logementid: ${payload.logementid || 'null'}`);
    console.log('='.repeat(60) + '\n');

    // Send to backend server instead of directly to Bubble.io
    const response = await fetch(`${BACKEND_URL}/api/send-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Webhook request accepted by backend:', result);

    return { success: true, logementId: result.logementId };
  } catch (error) {
    console.error('❌ Failed to send webhook request to backend:', error);
    return { success: false, error };
  }
};

// Function to dispatch modele webhook via backend server
export const dispatchModeleWebhook = async (modeleData: ParcoursModele) => {
  try {
    // Prepare payload for backend
    const payload = {
      conciergerieID: getConciergerieID(),
      userID: getUserID(),
      isTestMode: isTestMode(),
      modeleData,
    };

    console.log('📤 Sending modele webhook request to backend server...');
    console.log('   Modele:', modeleData.nom);
    console.log('   Type:', modeleData.type);

    // Send to backend server
    const response = await fetch(`${BACKEND_URL}/api/send-modele-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Modele webhook request accepted by backend:', result);

    return { success: true, modeleId: result.modeleId };
  } catch (error) {
    console.error('❌ Failed to send modele webhook request to backend:', error);
    return { success: false, error };
  }
};

// Function to dispatch delete modele webhook via backend server
export const dispatchDeleteModeleWebhook = async (modeleId: string) => {
  try {
    // Prepare payload for backend
    const payload = {
      conciergerieID: getConciergerieID(),
      userID: getUserID(),
      isTestMode: isTestMode(),
      modeleId,
    };

    console.log('🗑️ Sending delete modele webhook request to backend server...');
    console.log('   Modele ID:', modeleId);

    // Send to backend server
    const response = await fetch(`${BACKEND_URL}/api/delete-modele-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Delete modele webhook request accepted by backend:', result);

    return { success: true, modeleId: result.modeleId };
  } catch (error) {
    console.error('❌ Failed to send delete modele webhook request to backend:', error);
    return { success: false, error };
  }
};

/**
 * Charge les informations d'un logement depuis Bubble.io
 *
 * @param logementId - ID du logement à charger
 * @param isTestMode - Mode test ou production (défaut: true)
 * @returns Promise<any> - Données du logement
 */
export const loadLogementFromBubble = async (
  logementId: string,
  testMode: boolean = true
): Promise<any> => {
  try {
    const endpoint = getBubbleEndpoint('getLogement', testMode);
    // Essayer avec logementId (camelCase) au lieu de logementid
    const url = `${endpoint}?logementId=${encodeURIComponent(logementId)}`;

    console.log('\n' + '='.repeat(60));
    console.log('📥 CHARGEMENT DU LOGEMENT DEPUIS BUBBLE.IO');
    console.log('='.repeat(60));
    console.log(`   🏠 Logement ID: ${logementId}`);
    console.log(`   🔧 Mode: ${testMode ? 'TEST (version-test)' : 'PRODUCTION (version-live)'}`);
    console.log(`   🌐 Endpoint: ${endpoint}`);
    console.log(`   📍 URL complète: ${url}`);
    console.log('='.repeat(60));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Essayer de lire le corps de la réponse pour plus de détails
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody;
        console.error('📄 Corps de la réponse d\'erreur:', errorBody);
      } catch (e) {
        // Ignorer si on ne peut pas lire le corps
      }
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }

    const data = await response.json();

    console.log('\n' + '='.repeat(60));
    console.log('✅ RÉPONSE DE BUBBLE.IO');
    console.log('='.repeat(60));
    console.log('📦 Données reçues:');
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(60) + '\n');

    return data;
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERREUR LORS DU CHARGEMENT DU LOGEMENT');
    console.error('='.repeat(60));
    console.error(error);
    console.error('='.repeat(60) + '\n');
    throw error;
  }
};

