import { PIECES_STANDARDS } from "@/types/modele";

/**
 * Utilitaire de mapping intelligent des pièces Airbnb vers les pièces standards
 *
 * Ce module permet de convertir les noms de pièces Airbnb (souvent avec numéros et variations)
 * vers les noms de pièces standards de l'application, tout en regroupant les pièces similaires
 * et en conservant l'association avec les photos.
 *
 * Exemples de mapping :
 * - "Chambre 1", "Chambre 2", "Chambre 3" → "Chambre" (quantité: 3)
 * - "Salle de bains entière 1", "Salle de bains entière 2" → "Salle de bain avec toilettes" (quantité: 2)
 * - "Cuisine entière" → "Cuisine" (quantité: 1)
 * - "Bureau image 1" → "Bureau / Pièce de travail" (quantité: 1)
 * - "Espace repas" → "Salle à manger" (quantité: 1)
 */

export interface PieceQuantity {
  nom: string;
  quantite: number;
  id?: string;
  isCustom?: boolean;
}

export interface AirbnbPiece {
  nom: string;
  quantite: number;
  emoji: string;
  photos: string[];
  tasks?: any[];
}

export interface MappingResult {
  pieces: PieceQuantity[];
  photosMapping: Record<string, string[]>; // Clé = nom de pièce standard, Valeur = photos
  customPieces: string[]; // Pièces non reconnues
}

/**
 * Règles de mapping des noms de pièces Airbnb vers les pièces standards
 * Format: [pattern regex, nom standard]
 * Les règles sont testées dans l'ordre, donc les plus spécifiques doivent être en premier
 */
const ROOM_MAPPING_RULES: Array<[RegExp, string]> = [
  // Cuisine (avec variations)
  [/^cuisine\s*(entière|complète|équipée)?/i, "Cuisine"],
  [/^kitchenette/i, "Cuisine"],
  [/^coin cuisine/i, "Cuisine"],

  // Chambres (avec numéros : "Chambre 1", "Chambre 2", etc.)
  [/^chambre\s*\d*/i, "Chambre"],
  [/^bedroom\s*\d*/i, "Chambre"],
  [/^suite\s*\d*/i, "Chambre"],

  // Salles de bain (avec numéros et variations)
  [/^salle de bains?\s*(entière|complète)\s*\d*/i, "Salle de bain avec toilettes"],
  [/^salle de bains?\s*\d*/i, "Salle de bain (sans toilettes)"],
  [/^salle d'eau\s*\d*/i, "Salle de bain (sans toilettes)"],
  [/^bathroom\s*(full|complete)?\s*\d*/i, "Salle de bain avec toilettes"],

  // Toilettes
  [/^toilettes?\s*\d*/i, "Toilettes séparés"],
  [/^wc\s*\d*/i, "Toilettes séparés"],
  [/^cabinet de toilette\s*\d*/i, "Toilettes séparés"],

  // Salon / Séjour
  [/^salon/i, "Salon / Séjour"],
  [/^séjour/i, "Salon / Séjour"],
  [/^living/i, "Salon / Séjour"],
  [/^espace (de )?vie/i, "Salon / Séjour"],

  // Salle à manger
  [/^salle à manger/i, "Salle à manger"],
  [/^espace repas/i, "Salle à manger"],
  [/^coin repas/i, "Salle à manger"],
  [/^dining/i, "Salle à manger"],

  // Entrée / Couloir / Escaliers
  [/^entrée/i, "Entrée / Couloir / Escaliers"],
  [/^couloir/i, "Entrée / Couloir / Escaliers"],
  [/^hall/i, "Entrée / Couloir / Escaliers"],
  [/^escaliers?/i, "Entrée / Couloir / Escaliers"],

  // Buanderie / Laverie
  [/^buanderie/i, "Buanderie / Laverie"],
  [/^laverie/i, "Buanderie / Laverie"],
  [/^lingerie/i, "Buanderie / Laverie"],
  [/^laundry/i, "Buanderie / Laverie"],

  // Espaces extérieurs
  [/^balcon/i, "Espaces extérieurs"],
  [/^terrasse/i, "Espaces extérieurs"],
  [/^jardin/i, "Espaces extérieurs"],
  [/^patio/i, "Espaces extérieurs"],
  [/^véranda/i, "Espaces extérieurs"],
  [/^extérieur/i, "Espaces extérieurs"],
  [/^outdoor/i, "Espaces extérieurs"],

  // Garage / Parking
  [/^garage/i, "Garage / Parking"],
  [/^parking/i, "Garage / Parking"],
  [/^stationnement/i, "Garage / Parking"],

  // Bureau / Pièce de travail (avec variations comme "Bureau image 1")
  [/^bureau/i, "Bureau / Pièce de travail"],
  [/^espace (de )?travail/i, "Bureau / Pièce de travail"],
  [/^office/i, "Bureau / Pièce de travail"],
];

/**
 * Mappe un nom de pièce Airbnb vers un nom de pièce standard
 */
function mapRoomName(airbnbName: string | null | undefined): string | null {
  if (!airbnbName) return null;
  const cleanName = airbnbName.trim();
  
  for (const [pattern, standardName] of ROOM_MAPPING_RULES) {
    if (pattern.test(cleanName)) {
      return standardName;
    }
  }
  
  return null; // Pièce non reconnue
}

/**
 * Convertit les pièces Airbnb en pièces standards avec mapping intelligent
 */
export function mapAirbnbRoomsToStandard(airbnbPieces: AirbnbPiece[]): MappingResult {
  const roomCounts = new Map<string, number>();
  const roomPhotos = new Map<string, string[]>();
  const customPieces: string[] = [];
  
  // Traiter chaque pièce Airbnb
  for (const airbnbPiece of airbnbPieces) {
    const standardName = mapRoomName(airbnbPiece.nom);
    
    if (standardName) {
      // Pièce reconnue : incrémenter le compteur
      roomCounts.set(standardName, (roomCounts.get(standardName) || 0) + 1);
      
      // Ajouter les photos
      const existingPhotos = roomPhotos.get(standardName) || [];
      roomPhotos.set(standardName, [...existingPhotos, ...airbnbPiece.photos]);
    } else {
      // Pièce non reconnue : ajouter comme pièce personnalisée
      const customName = (airbnbPiece.nom || 'À trier').trim();
      if (!customPieces.includes(customName)) {
        customPieces.push(customName);
        roomCounts.set(customName, 1);
        roomPhotos.set(customName, airbnbPiece.photos || []);
      }
    }
  }
  
  // Convertir en tableau de PieceQuantity
  const pieces: PieceQuantity[] = Array.from(roomCounts.entries()).map(([nom, quantite]) => ({
    nom,
    quantite,
    isCustom: customPieces.includes(nom),
  }));

  // Trier pour que "À trier" soit en premier
  pieces.sort((a, b) => {
    if (a.nom === 'À trier') return -1;
    if (b.nom === 'À trier') return 1;
    return 0;
  });
  
  // Convertir les photos en Record
  const photosMapping: Record<string, string[]> = {};
  roomPhotos.forEach((photos, nom) => {
    photosMapping[nom] = photos;
  });
  
  return {
    pieces,
    photosMapping,
    customPieces,
  };
}

