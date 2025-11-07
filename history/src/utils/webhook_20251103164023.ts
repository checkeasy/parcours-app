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

// Function to get tasks for a piece based on the selected model
export const getTasksForPiece = (pieceName: string, selectedModele: "menage" | "voyageur" | ParcoursModele): TacheModele[] => {
  if (typeof selectedModele === 'string') {
    // Predefined model - use default tasks from TACHES_MENAGE or TACHES_VOYAGEUR
    const tasksSource = selectedModele === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;
    return tasksSource[pieceName] || [];
  } else {
    // Custom model - get tasks from the model
    const pieceData = selectedModele.pieces.find(p => p.nom === pieceName);
    return pieceData ? pieceData.tachesDisponibles : [];
  }
};

// Function to dispatch webhook
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
    const endpoint = isTestMode() ? webhookConfig.testEndpoint : webhookConfig.productionEndpoint;

    // Use existing logement ID or generate a new one
    const logementId = logementData.logementId || `logement_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Prepare pieces with tasks and photos included
    const piecesWithTasksAndPhotos = logementData.pieces.map(piece => ({
      ...piece,
      tasks: getTasksForPiece(piece.nom, logementData.modele),
      photos: logementData.piecesPhotos[piece.nom] || [],
    }));

    // Get the parcours name
    const nomParcours = typeof logementData.modele === 'string'
      ? (logementData.modele === 'menage' ? 'Ménage Check Easy' : 'Voyageur Check Easy')
      : logementData.modele.nom;

    // Prepare webhook payload based on webhook.json structure
    const payload = {
      conciergerieID: getConciergerieID(),
      logementID: logementId,
      userID: getUserID(),
      nom: logementData.nom,
      adresse: logementData.adresse,
      airbnbLink: logementData.airbnbLink || undefined,
      parcoursType: logementData.parcoursType,
      nomParcours: nomParcours,
      modele: typeof logementData.modele === 'string'
        ? { type: "predefined", value: logementData.modele }
        : { type: "custom", value: logementData.modele },
      pieces: piecesWithTasksAndPhotos,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('Webhook dispatched successfully:', payload);
    return { success: true, payload };
  } catch (error) {
    console.error('Failed to dispatch webhook:', error);
    return { success: false, error };
  }
};

