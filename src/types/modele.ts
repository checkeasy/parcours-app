export interface PieceQuantity {
  nom: string;
  quantite: number;
}

export interface TacheModele {
  id: string;
  emoji: string;
  titre: string;
  description: string;
  photoObligatoire: boolean;
}

export interface QuestionModele {
  id: string;
  intitule: string;
  type: "oui-non" | "ouverte";
  photoObligatoire?: boolean;
  obligatoire?: boolean;
}

export interface PieceModele {
  id: string;
  nom: string;
  tachesDisponibles: TacheModele[];
  tachesSelectionnees: string[]; // IDs des tâches sélectionnées
}

export interface ParcoursModele {
  id: string;
  nom: string;
  type: "menage" | "voyageur";
  pieces: PieceModele[];
  piecesQuantity?: PieceQuantity[];
  etatLieuxMoment?: "sortie" | "arrivee-sortie";
  questionsChecklist?: QuestionModele[];
  createdAt: string;
  updatedAt: string;
}

// Pièces standard d'un logement
export const PIECES_STANDARDS = [
  "Cuisine",
  "Salle de bain (sans toilettes)",
  "Salle de bain avec toilettes",
  "Toilettes séparés",
  "Chambre",
  "Salon / Séjour",
  "Salle à manger",
  "Entrée / Couloir / Escaliers",
  "Buanderie / Laverie",
  "Espaces extérieurs",
  "Garage / Parking",
  "Bureau / Pièce de travail"
];

// Pièces disponibles par modèle Check Easy
export const PIECES_CHECK_EASY = {
  menage: [
    "Cuisine",
    "Salle de bain (sans toilettes)",
    "Salle de bain avec toilettes",
    "Toilettes séparés",
    "Chambre",
    "Salon / Séjour",
    "Salle à manger",
    "Entrée / Couloir / Escaliers",
    "Buanderie / Laverie",
    "Espaces extérieurs"
  ],
  voyageur: [
    "Cuisine",
    "Salle de bain (sans toilettes)",
    "Salle de bain avec toilettes",
    "Toilettes séparés",
    "Chambre",
    "Salon / Séjour",
    "Espaces extérieurs"
  ]
};

// Tâches standard par type de pièce
export const TACHES_PAR_PIECE: Record<string, TacheModele[]> = {
  "Cuisine": [
    { id: "t-cuisine-1", emoji: "🍽️", titre: "Vaisselle propre", description: "Vérifier que toute la vaisselle est propre et rangée", photoObligatoire: true },
    { id: "t-cuisine-2", emoji: "🧽", titre: "Plan de travail", description: "Nettoyer et désinfecter les plans de travail", photoObligatoire: true },
    { id: "t-cuisine-3", emoji: "🗑️", titre: "Poubelle vidée", description: "Vider et nettoyer la poubelle", photoObligatoire: false },
    { id: "t-cuisine-4", emoji: "❄️", titre: "Réfrigérateur", description: "Vérifier la propreté du réfrigérateur", photoObligatoire: true },
  ],
  "Salle de bain et toilettes": [
    { id: "t-sdb-1", emoji: "🚿", titre: "Douche/Baignoire", description: "Nettoyer et détartrer la douche ou baignoire", photoObligatoire: true },
    { id: "t-sdb-2", emoji: "🚽", titre: "Toilettes", description: "Nettoyer et désinfecter les toilettes", photoObligatoire: true },
    { id: "t-sdb-3", emoji: "🪞", titre: "Miroir", description: "Nettoyer le miroir sans traces", photoObligatoire: false },
    { id: "t-sdb-4", emoji: "🧴", titre: "Produits fournis", description: "Vérifier la présence des produits (savon, shampoing)", photoObligatoire: false },
  ],
  "Salon": [
    { id: "t-salon-1", emoji: "🛋️", titre: "Canapé", description: "Aspirer et nettoyer le canapé", photoObligatoire: true },
    { id: "t-salon-2", emoji: "📺", titre: "Écran TV", description: "Nettoyer l'écran de télévision", photoObligatoire: false },
    { id: "t-salon-3", emoji: "🪟", titre: "Fenêtres", description: "Nettoyer les vitres", photoObligatoire: false },
    { id: "t-salon-4", emoji: "🧹", titre: "Sol aspiré", description: "Aspirer ou laver le sol", photoObligatoire: true },
  ],
  "Espace commun": [
    { id: "t-commun-1", emoji: "🚪", titre: "Entrée", description: "Nettoyer l'entrée et le hall", photoObligatoire: true },
    { id: "t-commun-2", emoji: "🧹", titre: "Couloirs", description: "Aspirer les couloirs", photoObligatoire: false },
    { id: "t-commun-3", emoji: "💡", titre: "Éclairages", description: "Vérifier le fonctionnement des éclairages", photoObligatoire: false },
  ],
  "Chambre": [
    { id: "t-chambre-1", emoji: "🛏️", titre: "Lit fait", description: "Faire le lit avec des draps propres", photoObligatoire: true },
    { id: "t-chambre-2", emoji: "🧹", titre: "Sol aspiré", description: "Aspirer ou laver le sol", photoObligatoire: true },
    { id: "t-chambre-3", emoji: "🪟", titre: "Fenêtres", description: "Nettoyer les vitres", photoObligatoire: false },
    { id: "t-chambre-4", emoji: "🗄️", titre: "Rangements", description: "Vérifier la propreté des armoires et rangements", photoObligatoire: false },
  ],
  "Bureau": [
    { id: "t-bureau-1", emoji: "🖥️", titre: "Bureau rangé", description: "Nettoyer et ranger le bureau", photoObligatoire: true },
    { id: "t-bureau-2", emoji: "🪑", titre: "Chaise", description: "Nettoyer la chaise de bureau", photoObligatoire: false },
    { id: "t-bureau-3", emoji: "🧹", titre: "Sol aspiré", description: "Aspirer le sol", photoObligatoire: true },
  ],
  "Jardin": [
    { id: "t-jardin-1", emoji: "🌿", titre: "Pelouse tondue", description: "Tondre la pelouse si nécessaire", photoObligatoire: true },
    { id: "t-jardin-2", emoji: "🪴", titre: "Plantes arrosées", description: "Arroser les plantes", photoObligatoire: false },
    { id: "t-jardin-3", emoji: "🧹", titre: "Terrasse propre", description: "Balayer la terrasse", photoObligatoire: true },
  ],
};

// Modèles prédéfinis Check Easy
export const MODELES_CHECK_EASY: ParcoursModele[] = [
  {
    id: "check-easy-menage",
    nom: "Ménage Check Easy",
    type: "menage",
    pieces: [],
    etatLieuxMoment: "arrivee-sortie",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "check-easy-voyageur",
    nom: "Voyageur Check Easy",
    type: "voyageur",
    pieces: [],
    etatLieuxMoment: "arrivee-sortie",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
