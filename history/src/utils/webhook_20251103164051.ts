import { ParcoursModele, PieceQuantity } from "@/types/modele";

// Backend server URL
const BACKEND_URL = 'http://localhost:3001';

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

    // Prepare payload for backend
    const payload = {
      conciergerieID: getConciergerieID(),
      userID: getUserID(),
      isTestMode: isTestMode(),
      logementData: {
        ...logementData,
        logementId,
      },
    };

    console.log('📤 Sending webhook request to backend server...');

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

