import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Calendar, MoreVertical, Info, GripVertical, ArrowLeft, X, Pencil } from "lucide-react";
import { PIECES_STANDARDS, TacheModele, PieceModele, QuestionModele } from "@/types/modele";
import { toast } from "@/hooks/use-toast";
import { QuestionDialog } from "@/components/parcours/dialogs/QuestionDialog";
import { TacheDialog } from "@/components/parcours/dialogs/TacheDialog";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useTranslation } from "react-i18next";

// Task definitions for predefined models
export const TACHES_MENAGE: Record<string, any[]> = {
  "Cuisine": [
    {
      id: "m-cuisine-1",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac ; nettoyer couvercle & bac.",
      photoObligatoire: true
    },
    {
      id: "m-cuisine-2",
      emoji: "🧽",
      titre: "Nettoyer plan de travail",
      description: "Désinfecter surfaces ; ranger ustensiles.",
      photoObligatoire: false
    },
    {
      id: "m-cuisine-3",
      emoji: "🍽️",
      titre: "Nettoyer évier",
      description: "Dégraisser ; faire briller robinetterie.",
      photoObligatoire: false
    },
    {
      id: "m-cuisine-4",
      emoji: "🔥",
      titre: "Nettoyer plaques de cuisson",
      description: "Dégraisser ; enlever résidus brûlés.",
      photoObligatoire: true
    },
    {
      id: "m-cuisine-5",
      emoji: "❄️",
      titre: "Nettoyer l'intérieur et l'extérieur du frigo",
      description: "Essuyer portes ; nettoyer poignées.",
      photoObligatoire: false
    },
    {
      id: "m-cuisine-6",
      emoji: "🧹",
      titre: "Balayer et laver le sol",
      description: "Aspirer miettes ; passer serpillière.",
      photoObligatoire: false
    }
  ],
  "Chambre": [
    {
      id: "m-chambre-1",
      emoji: "🛏️",
      titre: "Refaire le lit",
      description: "Draps propres ; oreillers gonflés.",
      photoObligatoire: true
    },
    {
      id: "m-chambre-2",
      emoji: "🧹",
      titre: "Aspirer le sol",
      description: "Sous le lit ; coins de la pièce.",
      photoObligatoire: false
    },
    {
      id: "m-chambre-3",
      emoji: "🪟",
      titre: "Dépoussiérer surfaces",
      description: "Tables de nuit ; étagères ; rebords.",
      photoObligatoire: false
    },
    {
      id: "m-chambre-4",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac si nécessaire.",
      photoObligatoire: false
    }
  ],
  "Salle de bain avec toilettes": [
    {
      id: "m-sdb-1",
      emoji: "🚽",
      titre: "Nettoyer les toilettes",
      description: "Cuvette ; abattant ; extérieur.",
      photoObligatoire: true
    },
    {
      id: "m-sdb-2",
      emoji: "🚿",
      titre: "Nettoyer douche/baignoire",
      description: "Parois ; robinetterie ; évacuation.",
      photoObligatoire: true
    },
    {
      id: "m-sdb-3",
      emoji: "🪞",
      titre: "Nettoyer lavabo et miroir",
      description: "Désinfecter ; faire briller.",
      photoObligatoire: false
    },
    {
      id: "m-sdb-4",
      emoji: "🧹",
      titre: "Laver le sol",
      description: "Aspirer puis serpillière.",
      photoObligatoire: false
    },
    {
      id: "m-sdb-5",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac ; nettoyer bac.",
      photoObligatoire: false
    }
  ],
  "Salon / Séjour": [
    {
      id: "m-salon-1",
      emoji: "🛋️",
      titre: "Aspirer canapé",
      description: "Coussins ; recoins ; sous les coussins.",
      photoObligatoire: false
    },
    {
      id: "m-salon-2",
      emoji: "🧹",
      titre: "Aspirer le sol",
      description: "Sous les meubles ; coins.",
      photoObligatoire: false
    },
    {
      id: "m-salon-3",
      emoji: "🪟",
      titre: "Dépoussiérer surfaces",
      description: "Tables ; étagères ; TV.",
      photoObligatoire: false
    },
    {
      id: "m-salon-4",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac si nécessaire.",
      photoObligatoire: false
    }
  ],
  "Salle de bain (sans toilettes)": [
    {
      id: "m-sdb-nt-1",
      emoji: "🚿",
      titre: "Nettoyer douche/baignoire",
      description: "Parois ; robinetterie ; évacuation.",
      photoObligatoire: true
    },
    {
      id: "m-sdb-nt-2",
      emoji: "🪞",
      titre: "Nettoyer lavabo et miroir",
      description: "Désinfecter ; faire briller.",
      photoObligatoire: false
    },
    {
      id: "m-sdb-nt-3",
      emoji: "🧹",
      titre: "Laver le sol",
      description: "Aspirer puis serpillière.",
      photoObligatoire: false
    },
    {
      id: "m-sdb-nt-4",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac ; nettoyer bac.",
      photoObligatoire: false
    }
  ],
  "Toilettes séparés": [
    {
      id: "m-wc-1",
      emoji: "🚽",
      titre: "Nettoyer les toilettes",
      description: "Cuvette ; abattant ; extérieur.",
      photoObligatoire: true
    },
    {
      id: "m-wc-2",
      emoji: "🪞",
      titre: "Nettoyer lavabo (si présent)",
      description: "Désinfecter ; faire briller.",
      photoObligatoire: false
    },
    {
      id: "m-wc-3",
      emoji: "🧹",
      titre: "Laver le sol",
      description: "Aspirer puis serpillière.",
      photoObligatoire: false
    },
    {
      id: "m-wc-4",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac ; nettoyer bac.",
      photoObligatoire: false
    }
  ],
  "Salle à manger": [
    {
      id: "m-salle-manger-1",
      emoji: "🧹",
      titre: "Aspirer/balayer le sol",
      description: "Sous la table ; coins.",
      photoObligatoire: false
    },
    {
      id: "m-salle-manger-2",
      emoji: "🪟",
      titre: "Dépoussiérer surfaces",
      description: "Table ; chaises ; buffet.",
      photoObligatoire: false
    },
    {
      id: "m-salle-manger-3",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Si présentes.",
      photoObligatoire: false
    }
  ],
  "Entrée / Couloir / Escaliers": [
    {
      id: "m-entree-1",
      emoji: "🧹",
      titre: "Aspirer/balayer le sol",
      description: "Tapis ; coins ; sous les meubles.",
      photoObligatoire: false
    },
    {
      id: "m-entree-2",
      emoji: "🪟",
      titre: "Dépoussiérer surfaces",
      description: "Console ; miroir ; porte-manteau.",
      photoObligatoire: false
    },
    {
      id: "m-entree-3",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Si présentes.",
      photoObligatoire: false
    }
  ],
  "Buanderie / Laverie": [
    {
      id: "m-buanderie-1",
      emoji: "🧺",
      titre: "Vérifier lave-linge",
      description: "Vide ; propre ; porte ouverte.",
      photoObligatoire: false
    },
    {
      id: "m-buanderie-2",
      emoji: "🧹",
      titre: "Balayer le sol",
      description: "Enlever poussière ; peluches.",
      photoObligatoire: false
    },
    {
      id: "m-buanderie-3",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Si présentes.",
      photoObligatoire: false
    }
  ],
  "Espaces extérieurs": [
    {
      id: "m-ext-1",
      emoji: "🧹",
      titre: "Balayer le sol",
      description: "Enlever feuilles ; poussière.",
      photoObligatoire: false
    },
    {
      id: "m-ext-2",
      emoji: "🪑",
      titre: "Nettoyer mobilier",
      description: "Essuyer table ; chaises.",
      photoObligatoire: false
    },
    {
      id: "m-ext-3",
      emoji: "🗑️",
      titre: "Vider cendriers",
      description: "Jeter mégots ; nettoyer.",
      photoObligatoire: false
    },
    {
      id: "m-ext-4",
      emoji: "🌿",
      titre: "Ranger espaces verts",
      description: "Ramasser déchets ; arroser plantes si besoin.",
      photoObligatoire: false
    }
  ],
  "Garage / Parking": [
    {
      id: "m-garage-1",
      emoji: "🧹",
      titre: "Balayer le sol",
      description: "Enlever poussière ; feuilles.",
      photoObligatoire: false
    },
    {
      id: "m-garage-2",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Si présentes.",
      photoObligatoire: false
    },
    {
      id: "m-garage-3",
      emoji: "🚪",
      titre: "Vérifier fermeture",
      description: "Porte fermée ; verrouillée.",
      photoObligatoire: false
    }
  ],
  "Bureau / Pièce de travail": [
    {
      id: "m-bureau-1",
      emoji: "🪟",
      titre: "Dépoussiérer bureau",
      description: "Surface ; écran ; clavier.",
      photoObligatoire: false
    },
    {
      id: "m-bureau-2",
      emoji: "🧹",
      titre: "Aspirer le sol",
      description: "Sous le bureau ; coins.",
      photoObligatoire: false
    },
    {
      id: "m-bureau-3",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Remplacer sac si nécessaire.",
      photoObligatoire: false
    }
  ]
};

export const TACHES_VOYAGEUR: Record<string, any[]> = {
  "Cuisine": [
    {
      id: "v-cuisine-1",
      emoji: "🗑️",
      titre: "Vider les poubelles",
      description: "Sortir tous les sacs, remettre un sac propre, fermer le couvercle.",
      photoObligatoire: true
    },
    {
      id: "v-cuisine-2",
      emoji: "🍽️",
      titre: "Ranger la vaisselle",
      description: "Laver ou lancer le lave-vaisselle puis ranger toute la vaisselle propre.",
      photoObligatoire: false
    },
    {
      id: "v-cuisine-3",
      emoji: "❄️",
      titre: "Vider le réfrigérateur",
      description: "Retirer tous les aliments entamés, jeter ou emporter.",
      photoObligatoire: true
    }
  ],
  "Chambre": [
    {
      id: "v-chambre-1",
      emoji: "🛏️",
      titre: "Défaire le linge de lit",
      description: "Retirer draps & taies, les placer où indiqué (panier, sac…).",
      photoObligatoire: true
    },
    {
      id: "v-chambre-2",
      emoji: "🚪",
      titre: "Vérifier placards/tiroirs",
      description: "Rien d'oublié ni de déchets à l'intérieur.",
      photoObligatoire: true
    }
  ],
  "Salle de bain avec toilettes": [
    {
      id: "v-sdb-1",
      emoji: "🚽",
      titre: "Tirer chasse & abaisser lunette",
      description: "Laisser la cuvette propre et fermée.",
      photoObligatoire: true
    },
    {
      id: "v-sdb-2",
      emoji: "🗑️",
      titre: "Vider la poubelle",
      description: "Sac retiré ou contenu jeté dans la grande poubelle.",
      photoObligatoire: false
    },
    {
      id: "v-sdb-3",
      emoji: "🧺",
      titre: "Regrouper serviettes",
      description: "Mettre linge humide au même endroit (panier ou sol prévu).",
      photoObligatoire: false
    }
  ],
  "Salon / Séjour": [
    {
      id: "v-salon-1",
      emoji: "🛋️",
      titre: "Ranger canapé & coussins",
      description: "Coussins tapotés, plaid plié, canapé dégagé.",
      photoObligatoire: true
    },
    {
      id: "v-salon-2",
      emoji: "📺",
      titre: "Éteindre TV & appareils",
      description: "Télécommande posée à sa place, TV et console éteintes.",
      photoObligatoire: false
    }
  ],
  "Salle de bain (sans toilettes)": [
    {
      id: "v-sdb-nt-1",
      emoji: "🧺",
      titre: "Rassembler serviettes",
      description: "Déposer toutes les serviettes utilisées dans le panier ou sur le sol prévu.",
      photoObligatoire: true
    },
    {
      id: "v-sdb-nt-2",
      emoji: "🗑️",
      titre: "Vider la poubelle",
      description: "Jeter mouchoirs ou produits usagés, remettre un sac propre si fourni.",
      photoObligatoire: false
    },
    {
      id: "v-sdb-nt-3",
      emoji: "🔍",
      titre: "Vérifier effets personnels",
      description: "Aucun produit ou accessoire oublié dans la douche ou sur la vasque.",
      photoObligatoire: false
    }
  ],
  "Toilettes séparés": [
    {
      id: "v-wc-1",
      emoji: "🚽",
      titre: "Tirer chasse & fermer abattant",
      description: "Laisser cuvette et abattant propres.",
      photoObligatoire: false
    },
    {
      id: "v-wc-2",
      emoji: "🗑️",
      titre: "Vider la poubelle",
      description: "Retirer le sac ou son contenu.",
      photoObligatoire: false
    }
  ],
  "Salle à manger": [
    {
      id: "v-salle-manger-1",
      emoji: "🎒",
      titre: "Récupérer vos affaires sur la table",
      description: "Sacs, jouets, livres, bouteilles perso, etc.",
      photoObligatoire: false
    },
    {
      id: "v-salle-manger-2",
      emoji: "🪑",
      titre: "Remettre les chaises autour de la table",
      description: "Les chaises sont simplement replacées autour de la table.",
      photoObligatoire: false
    }
  ],
  "Entrée / Couloir / Escaliers": [
    {
      id: "v-entree-couloir-1",
      emoji: "🔍",
      titre: "Vérifier que vous n'avez rien oublié",
      description: "Manteaux, chaussures, sacs, chargeurs…",
      photoObligatoire: false
    },
    {
      id: "v-entree-couloir-2",
      emoji: "👟",
      titre: "Récupérer vos chaussures",
      description: "Si vous en avez laissé dans l'entrée, les reprendre avant de partir.",
      photoObligatoire: false
    }
  ],
  "Buanderie / Laverie": [
    {
      id: "v-buanderie-1",
      emoji: "🧺",
      titre: "Vérifier les machines",
      description: "Ne laisser aucun vêtement dans le lave-linge ou le sèche-linge.",
      photoObligatoire: false
    },
    {
      id: "v-buanderie-2",
      emoji: "🧴",
      titre: "Récupérer vos produits",
      description: "Si vous avez apporté votre lessive ou autres produits, les reprendre.",
      photoObligatoire: false
    }
  ],
  "Espaces extérieurs": [
    {
      id: "v-ext-1",
      emoji: "🪑",
      titre: "Ranger mobilier",
      description: "Chaises repoussées ; coussins rentrés ou empilés.",
      photoObligatoire: true
    },
    {
      id: "v-ext-2",
      emoji: "🚬",
      titre: "Vider cendriers",
      description: "Jeter mégots ; nettoyer cendrier si besoin.",
      photoObligatoire: false
    },
    {
      id: "v-ext-3",
      emoji: "☂️",
      titre: "Fermer parasol / BBQ",
      description: "Parasol fermé ; BBQ éteint & couvercle remis.",
      photoObligatoire: false
    },
    {
      id: "v-ext-4",
      emoji: "🚪",
      titre: "Vérifier portail / portillon",
      description: "Fermé ou verrouillé selon consigne.",
      photoObligatoire: false
    }
  ],
  "Garage / Parking": [
    {
      id: "v-garage-1",
      emoji: "🚗",
      titre: "Vérifier l'espace",
      description: "Rien oublié dans le garage ; espace propre.",
      photoObligatoire: false
    },
    {
      id: "v-garage-2",
      emoji: "🚪",
      titre: "Fermer la porte",
      description: "Porte de garage fermée ; verrouillée si nécessaire.",
      photoObligatoire: false
    }
  ],
  "Bureau / Pièce de travail": [
    {
      id: "v-bureau-1",
      emoji: "🎒",
      titre: "Récupérer vos affaires",
      description: "Ordinateur ; documents ; fournitures personnelles.",
      photoObligatoire: false
    }
  ]
};

// Helper function to load tasks from translations
const loadTasksFromTranslations = (t: any, parcoursType: "menage" | "voyageur", roomName: string): TacheModele[] => {
  // Get the French key for this room (used in JSON)
  const frenchKey = getFrenchRoomKey(roomName, parcoursType, t);
  const tasks = t(`defaultTasks.${parcoursType}.${frenchKey}`, { returnObjects: true });
  if (!Array.isArray(tasks)) return [];

  // Map emoji based on room and task index (using French keys)
  // For menage, these are longer lists; for voyageur, shorter lists
  const emojiMap: Record<string, string[]> = {
    "Cuisine": parcoursType === "menage"
      ? ["🗑️", "🍽️", "🧽", "📡", "❄️", "🧊", "🔥", "🍳", "💨", "☕", "🧼", "🧴", "🧹"]
      : ["🍽️", "❄️", "🔥", "☕"],
    "Salle de bain (sans toilettes)": parcoursType === "menage"
      ? ["💈", "🚿", "🧱", "🪞", "🚪", "🧺", "🗑️", "🛁"]
      : ["🧴", "🚿", "🧻"],
    "Salle de bain avec toilettes": parcoursType === "menage"
      ? ["🚽", "🧻", "💈", "🚿", "🧱", "🪞", "🚪", "🧺", "🗑️", "🛁"]
      : ["🧴", "🚿", "🧻", "🚽"],
    "Toilettes séparés": ["🚽", "🧻"],
    "Chambre": parcoursType === "menage"
      ? ["🛏️", "🧹", "🛌", "🪵", "🧹", "💡", "🚪", "🪟"]
      : ["🛏️", "🚪", "💡"],
    "Salon / Séjour": parcoursType === "menage"
      ? ["🧹", "🛋️", "🧺", "📺", "📐"]
      : ["📺", "🛋️", "🌡️"],
    "Salle à manger": parcoursType === "menage"
      ? ["🪑", "🍽️", "🚪", "🧹"]
      : ["🎒", "🪑"],
    "Entrée / Couloir / Escaliers": parcoursType === "menage"
      ? ["🚪", "🪞", "🪜"]
      : ["🔍", "👟"],
    "Buanderie / Laverie": parcoursType === "menage"
      ? ["🧺", "🌪️", "🧼", "🧴"]
      : ["🧺", "🧴"],
    "Espaces extérieurs": parcoursType === "menage"
      ? ["🧹", "🪑", "🗑️", "🌿"]
      : ["🪑", "🚬", "☂️", "🚪"],
    "Garage / Parking": parcoursType === "menage"
      ? ["🧹", "🗑️", "🚪"]
      : ["🚗", "🚪"],
    "Bureau / Pièce de travail": parcoursType === "menage"
      ? ["🪟", "🧹", "🗑️"]
      : ["💻", "🔌", "🎒"]
  };

  const photoRequiredMap: Record<string, boolean[]> = {
    "Cuisine": parcoursType === "menage"
      ? [true, false, false, true, true, true, true, true, false, true, true, false, false]
      : [true, false, false, false],
    "Salle de bain (sans toilettes)": parcoursType === "menage"
      ? [true, true, false, false, false, false, false, false]
      : [true, true, false],
    "Salle de bain avec toilettes": parcoursType === "menage"
      ? [true, false, true, false, false, false, false, false, false, false]
      : [true, true, false, true],
    "Toilettes séparés": [true, false],
    "Chambre": parcoursType === "menage"
      ? [true, false, false, false, false, false, true, false]
      : [true, false, false],
    "Salon / Séjour": parcoursType === "menage"
      ? [false, false, false, true, false]
      : [false, false, false],
    "Salle à manger": parcoursType === "menage"
      ? [true, false, false, false]
      : [false, false],
    "Entrée / Couloir / Escaliers": parcoursType === "menage"
      ? [false, false, false]
      : [false, false],
    "Buanderie / Laverie": parcoursType === "menage"
      ? [false, false, false, false]
      : [false, false],
    "Espaces extérieurs": parcoursType === "menage"
      ? [false, false, false, false]
      : [true, false, false, false],
    "Garage / Parking": parcoursType === "menage"
      ? [false, false, false]
      : [false, false],
    "Bureau / Pièce de travail": parcoursType === "menage"
      ? [false, false, false]
      : [false, false, false]
  };

  const emojis = emojiMap[frenchKey] || [];
  const photoRequired = photoRequiredMap[frenchKey] || [];

  return tasks.map((task: any, index: number) => ({
    id: `${parcoursType}-${frenchKey}-${index}`,
    emoji: emojis[index] || "📋",
    titre: task.titre,
    description: task.description,
    photoObligatoire: photoRequired[index] || false
  }));
};

// Helper function to load room names from translations
const loadRoomsFromTranslations = (t: any, parcoursType: "menage" | "voyageur"): string[] => {
  const rooms = t(`defaultRooms.${parcoursType}`, { returnObjects: true });
  if (!Array.isArray(rooms)) return [];
  return rooms;
};

// French room keys (used as keys in defaultTasks JSON)
const FRENCH_ROOM_KEYS_MENAGE = [
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
];

const FRENCH_ROOM_KEYS_VOYAGEUR = [
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
];

// Helper function to get French room key from translated room name
const getFrenchRoomKey = (translatedRoomName: string, parcoursType: "menage" | "voyageur", t: any): string => {
  const translatedRooms = loadRoomsFromTranslations(t, parcoursType);
  const frenchKeys = parcoursType === "menage" ? FRENCH_ROOM_KEYS_MENAGE : FRENCH_ROOM_KEYS_VOYAGEUR;

  const index = translatedRooms.indexOf(translatedRoomName);
  if (index !== -1 && index < frenchKeys.length) {
    return frenchKeys[index];
  }

  // Fallback: return the translated name (for custom rooms)
  return translatedRoomName;
};

// Helper function to load questions from translations
const loadQuestionsFromTranslations = (t: any, parcoursType: "menage" | "voyageur"): QuestionModele[] => {
  const questionIds = ["q1", "q2", "q3", "q4", "q5", "q6"];
  const questions: QuestionModele[] = [];

  // Question metadata (type, obligatoire, photoObligatoire)
  const questionMetadata: Record<string, Record<string, { type: "oui-non" | "ouverte", obligatoire: boolean, photoObligatoire?: boolean }>> = {
    "menage": {
      "q1": { type: "oui-non", obligatoire: true },
      "q2": { type: "oui-non", obligatoire: true },
      "q3": { type: "ouverte", obligatoire: false },
      "q4": { type: "ouverte", obligatoire: false },
      "q5": { type: "oui-non", obligatoire: true, photoObligatoire: true },
      "q6": { type: "oui-non", obligatoire: true }
    },
    "voyageur": {
      "q1": { type: "oui-non", obligatoire: true },
      "q2": { type: "oui-non", obligatoire: true },
      "q3": { type: "oui-non", obligatoire: true },
      "q4": { type: "ouverte", obligatoire: false },
      "q5": { type: "oui-non", obligatoire: true, photoObligatoire: true },
      "q6": { type: "oui-non", obligatoire: true }
    }
  };

  questionIds.forEach(id => {
    const intitule = t(`defaultQuestions.${parcoursType}.${id}`);
    const metadata = questionMetadata[parcoursType][id];

    if (intitule && metadata) {
      questions.push({
        id,
        intitule,
        type: metadata.type,
        obligatoire: metadata.obligatoire,
        ...(metadata.photoObligatoire && { photoObligatoire: metadata.photoObligatoire })
      });
    }
  });

  return questions;
};

interface CustomModeleBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (modele: any) => void;
  onBack?: () => void;
  parcoursType?: "menage" | "voyageur";
  editingModele?: any;
  isFullScreenMode?: boolean;
}





export function CustomModeleBuilder({
  open,
  onOpenChange,
  onSave,
  onBack,
  parcoursType: initialParcoursType,
  editingModele,
  isFullScreenMode = false,
}: CustomModeleBuilderProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [modeleName, setModeleName] = useState("");
  const [modeleType, setModeleType] = useState<"menage" | "voyageur">(initialParcoursType || "menage");
  const [etatLieuxMoment, setEtatLieuxMoment] = useState<"sortie" | "arrivee-sortie">("arrivee-sortie");
  const [selectedPieces, setSelectedPieces] = useState<Map<string, string[]>>(new Map());
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [currentPiece, setCurrentPiece] = useState<string>("");
  const [newTask, setNewTask] = useState({ emoji: "", titre: "", description: "", photoObligatoire: false });
  const [customTasks, setCustomTasks] = useState<Map<string, TacheModele[]>>(new Map());
  const [editedDefaultTasks, setEditedDefaultTasks] = useState<Map<string, Map<string, TacheModele>>>(new Map());
  const [editingTask, setEditingTask] = useState<{ piece: string; task: TacheModele } | null>(null);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [customPieces, setCustomPieces] = useState<string[]>([]);
  const [newPieceDialogOpen, setNewPieceDialogOpen] = useState(false);
  const [newPieceName, setNewPieceName] = useState("");

  // Determine the active parcours type: use initialParcoursType if defined (from parent), otherwise use modeleType
  const activeParcoursType = initialParcoursType || modeleType;

  // Wrapper pour les toasts : ne rien afficher en mode fullscreen (viewmode)
  const showToast = (options: Parameters<typeof toast>[0]) => {
    if (!isFullScreenMode) {
      toast(options);
    }
  };

  // Questions checklist state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [customQuestions, setCustomQuestions] = useState<QuestionModele[]>([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionModele | undefined>();

  // Pré-remplir les données si on édite un modèle existant
  useEffect(() => {
    if (editingModele && open) {
      setCurrentStep(1);
      setModeleName(editingModele.nom);
      setModeleType(editingModele.type);
      setEtatLieuxMoment(editingModele.etatLieuxMoment || "arrivee-sortie");

      // Reconstituer selectedPieces avec les tâches sélectionnées
      const piecesMap = new Map<string, string[]>();
      const customPiecesArray: string[] = [];
      const customTasksMap = new Map<string, TacheModele[]>();

      const defaultPieces = loadRoomsFromTranslations(t, editingModele.type);

      editingModele.pieces.forEach((piece: PieceModele) => {
        piecesMap.set(piece.nom, piece.tachesSelectionnees);

        // Identifier les pièces personnalisées (qui ne sont pas dans les pièces par défaut)
        if (!defaultPieces.includes(piece.nom)) {
          customPiecesArray.push(piece.nom);
        }

        // Identifier les tâches personnalisées pour cette pièce
        const defaultTasksForPiece = loadTasksFromTranslations(t, editingModele.type, piece.nom);
        const defaultTaskIds = new Set(defaultTasksForPiece.map(t => t.id));

        const customTasksForPiece = piece.tachesDisponibles.filter(
          (task: TacheModele) => !defaultTaskIds.has(task.id)
        );

        if (customTasksForPiece.length > 0) {
          customTasksMap.set(piece.nom, customTasksForPiece);
        }
      });

      setSelectedPieces(piecesMap);
      setCustomPieces(customPiecesArray);
      setCustomTasks(customTasksMap);

      // Restaurer les questions
      const defaultQuestions = loadQuestionsFromTranslations(t, editingModele.type);

      const selectedQuestionsSet = new Set<string>();
      const customQs: QuestionModele[] = [];

      editingModele.questionsChecklist?.forEach((q: QuestionModele) => {
        const isDefault = defaultQuestions.find(dq => dq.id === q.id);
        if (isDefault) {
          selectedQuestionsSet.add(q.id);
        } else {
          customQs.push(q);
        }
      });

      setSelectedQuestions(selectedQuestionsSet);
      setCustomQuestions(customQs);
    } else if (!editingModele && open) {
      // Réinitialiser pour création
      setCurrentStep(1);
      setModeleName("");
      setSelectedPieces(new Map());
      setSelectedQuestions(new Set());
      setCustomQuestions([]);
      setCustomPieces([]);
      setCustomTasks(new Map());
      setEditedDefaultTasks(new Map());
    }
  }, [editingModele, open]);

  const getAllPieces = (): string[] => {
    const defaultPieces = loadRoomsFromTranslations(t, activeParcoursType);
    return [...defaultPieces, ...customPieces];
  };

  const getAllAvailableQuestions = (): QuestionModele[] => {
    return loadQuestionsFromTranslations(t, activeParcoursType);
  };

  const getSelectedQuestionsData = (): QuestionModele[] => {
    const defaultQuestions = getAllAvailableQuestions();
    const selectedDefaults = defaultQuestions.filter(q => selectedQuestions.has(q.id));
    return [...selectedDefaults, ...customQuestions];
  };

  const handleTogglePiece = (piece: string) => {
    const newMap = new Map(selectedPieces);
    if (newMap.has(piece)) {
      newMap.delete(piece);
    } else {
      newMap.set(piece, []);
    }
    setSelectedPieces(newMap);
  };

  const handleAddCustomPiece = () => {
    if (!newPieceName.trim()) {
      showToast({
        title: t('customModeleBuilder.errorTitle'),
        description: t('customModeleBuilder.roomNameRequired'),
        variant: "destructive",
      });
      return;
    }

    // Vérifier si la pièce existe déjà
    const allPieces = getAllPieces();
    if (allPieces.includes(newPieceName.trim())) {
      showToast({
        title: t('customModeleBuilder.errorTitle'),
        description: t('customModeleBuilder.roomAlreadyExists'),
        variant: "destructive",
      });
      return;
    }

    setCustomPieces([...customPieces, newPieceName.trim()]);

    // Sélectionner automatiquement la nouvelle pièce
    const newSelectedPieces = new Map(selectedPieces);
    newSelectedPieces.set(newPieceName.trim(), []);
    setSelectedPieces(newSelectedPieces);

    showToast({
      title: t('customModeleBuilder.roomAdded'),
      description: t('customModeleBuilder.roomAddedDesc', { roomName: newPieceName.trim() }),
    });

    setNewPieceDialogOpen(false);
    setNewPieceName("");
  };

  const handleDeleteCustomPiece = (piece: string) => {
    setCustomPieces(customPieces.filter(p => p !== piece));
    
    // Retirer la pièce des pièces sélectionnées
    const newSelectedPieces = new Map(selectedPieces);
    newSelectedPieces.delete(piece);
    setSelectedPieces(newSelectedPieces);

    // Retirer les tâches custom de cette pièce
    const newCustomTasks = new Map(customTasks);
    newCustomTasks.delete(piece);
    setCustomTasks(newCustomTasks);

    // Retirer les tâches modifiées de cette pièce
    const newEditedTasks = new Map(editedDefaultTasks);
    newEditedTasks.delete(piece);
    setEditedDefaultTasks(newEditedTasks);

    toast({
      title: t('customModeleBuilder.roomDeleted'),
      description: t('customModeleBuilder.roomDeletedDesc', { roomName: piece }),
    });
  };

  const handleToggleTask = (piece: string, taskId: string) => {
    const newMap = new Map(selectedPieces);
    const tasks = newMap.get(piece) || [];
    if (tasks.includes(taskId)) {
      newMap.set(piece, tasks.filter(t => t !== taskId));
    } else {
      newMap.set(piece, [...tasks, taskId]);
    }
    setSelectedPieces(newMap);
  };

  const handleAddCustomTask = () => {
    if (!newTask.titre || !currentPiece) return;

    const customId = `custom-${Date.now()}`;
    const task: TacheModele = {
      id: customId,
      emoji: newTask.emoji || "📝",
      titre: newTask.titre,
      description: newTask.description,
      photoObligatoire: newTask.photoObligatoire,
    };

    const newCustomTasks = new Map(customTasks);
    const pieceTasks = newCustomTasks.get(currentPiece) || [];
    newCustomTasks.set(currentPiece, [...pieceTasks, task]);
    setCustomTasks(newCustomTasks);

    // Auto-select the new task
    const newMap = new Map(selectedPieces);
    const tasks = newMap.get(currentPiece) || [];
    newMap.set(currentPiece, [...tasks, customId]);
    setSelectedPieces(newMap);

    setNewTask({ emoji: "", titre: "", description: "", photoObligatoire: false });
    setNewTaskDialogOpen(false);

    showToast({
      title: t('customModeleBuilder.taskCreated'),
      description: t('customModeleBuilder.taskCreatedDesc', { taskTitle: task.titre, roomName: currentPiece }),
    });
  };

  const handleDeleteCustomTask = (piece: string, taskId: string) => {
    const newCustomTasks = new Map(customTasks);
    const pieceTasks = newCustomTasks.get(piece) || [];
    newCustomTasks.set(piece, pieceTasks.filter(t => t.id !== taskId));
    setCustomTasks(newCustomTasks);

    // Remove from selected tasks
    const newSelectedPieces = new Map(selectedPieces);
    const selectedTasks = newSelectedPieces.get(piece) || [];
    newSelectedPieces.set(piece, selectedTasks.filter(t => t !== taskId));
    setSelectedPieces(newSelectedPieces);

    showToast({
      title: t('customModeleBuilder.taskDeleted'),
      description: t('customModeleBuilder.taskDeletedDesc'),
    });
  };

  const getAllTasksForPiece = (piece: string): TacheModele[] => {
    let defaultTasks = loadTasksFromTranslations(t, activeParcoursType, piece);

    // Remplacer les tâches par défaut qui ont été modifiées
    const pieceEdited = editedDefaultTasks.get(piece);
    if (pieceEdited) {
      defaultTasks = defaultTasks.map(task =>
        pieceEdited.has(task.id) ? pieceEdited.get(task.id)! : task
      );
    }

    const custom = customTasks.get(piece) || [];
    return [...defaultTasks, ...custom];
  };

  const handleEditTask = (piece: string, task: TacheModele) => {
    setEditingTask({ piece, task });
    setEditTaskDialogOpen(true);
  };

  const handleSaveEditedTask = (updatedTask: TacheModele) => {
    if (!editingTask) return;

    const { piece, task: originalTask } = editingTask;

    // Check if it's a custom task
    const pieceTasks = customTasks.get(piece) || [];
    const customTaskIndex = pieceTasks.findIndex(t => t.id === originalTask.id);

    if (customTaskIndex !== -1) {
      // Update custom task - KEEP ORIGINAL ID
      const newCustomTasks = new Map(customTasks);
      pieceTasks[customTaskIndex] = { ...updatedTask, id: originalTask.id };
      newCustomTasks.set(piece, pieceTasks);
      setCustomTasks(newCustomTasks);
    } else {
      // It's a default task being edited
      // Check if we're adding a photo or making significant changes
      const hasPhotoChange = updatedTask.photoUrl !== originalTask.photoUrl;
      const hasContentChange =
        updatedTask.titre !== originalTask.titre ||
        updatedTask.description !== originalTask.description ||
        updatedTask.emoji !== originalTask.emoji ||
        updatedTask.photoObligatoire !== originalTask.photoObligatoire;

      if (hasPhotoChange || hasContentChange) {
        // Create a NEW custom task with a unique ID to avoid sharing between models
        const newTaskId = `custom-edited-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newTask: TacheModele = {
          ...updatedTask,
          id: newTaskId,
        };

        // Add to custom tasks
        const newCustomTasks = new Map(customTasks);
        const existingPieceTasks = newCustomTasks.get(piece) || [];
        newCustomTasks.set(piece, [...existingPieceTasks, newTask]);
        setCustomTasks(newCustomTasks);

        // Update selection: replace old task ID with new task ID
        const newSelectedPieces = new Map(selectedPieces);
        const selectedTasks = newSelectedPieces.get(piece) || [];
        const updatedSelection = selectedTasks.map(taskId =>
          taskId === originalTask.id ? newTaskId : taskId
        );
        newSelectedPieces.set(piece, updatedSelection);
        setSelectedPieces(newSelectedPieces);

        // Remove from edited default tasks if it was there
        const newEditedTasks = new Map(editedDefaultTasks);
        const pieceEdited = newEditedTasks.get(piece);
        if (pieceEdited) {
          pieceEdited.delete(originalTask.id);
          if (pieceEdited.size === 0) {
            newEditedTasks.delete(piece);
          } else {
            newEditedTasks.set(piece, pieceEdited);
          }
          setEditedDefaultTasks(newEditedTasks);
        }
      } else {
        // No significant changes, just update in place
        const newEditedTasks = new Map(editedDefaultTasks);
        const pieceEdited = newEditedTasks.get(piece) || new Map();
        pieceEdited.set(originalTask.id, { ...updatedTask, id: originalTask.id });
        newEditedTasks.set(piece, pieceEdited);
        setEditedDefaultTasks(newEditedTasks);
      }
    }

    setEditTaskDialogOpen(false);
    setEditingTask(null);

    showToast({
      title: t('customModeleBuilder.taskModified'),
      description: t('customModeleBuilder.taskModifiedDesc', { taskTitle: updatedTask.titre }),
    });
  };

  // Question handlers
  const handleAjouterQuestion = () => {
    setCurrentQuestion(undefined);
    setQuestionDialogOpen(true);
  };

  const handleModifierQuestion = (question: QuestionModele) => {
    setCurrentQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleToggleQuestion = (questionId: string) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(questionId)) {
      newSet.delete(questionId);
    } else {
      newSet.add(questionId);
    }
    setSelectedQuestions(newSet);
  };

  const handleSupprimerQuestion = (questionId: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== questionId));
    showToast({
      title: t('customModeleBuilder.questionDeleted'),
      description: t('customModeleBuilder.questionDeletedDesc'),
    });
  };

  const handleDupliquerQuestion = (question: QuestionModele) => {
    const newQuestion: QuestionModele = {
      ...question,
      id: `q-${Date.now()}`,
      intitule: `${question.intitule} (copie)`
    };
    setCustomQuestions([...customQuestions, newQuestion]);
    showToast({
      title: t('customModeleBuilder.questionDuplicated'),
      description: t('customModeleBuilder.questionDuplicatedDesc'),
    });
  };

  const handleSauvegarderQuestion = (questionData: Omit<QuestionModele, "id">) => {
    if (currentQuestion) {
      // Check if it's a custom question
      const isCustom = customQuestions.some(q => q.id === currentQuestion.id);
      if (isCustom) {
        setCustomQuestions(customQuestions.map(q =>
          q.id === currentQuestion.id
            ? { ...questionData, id: currentQuestion.id }
            : q
        ));
      }
      toast({
        title: t('customModeleBuilder.questionModified'),
        description: t('customModeleBuilder.questionModifiedDesc'),
      });
    } else {
      // Ajouter
      const newQuestion: QuestionModele = {
        ...questionData,
        id: `q-${Date.now()}`
      };
      setCustomQuestions([...customQuestions, newQuestion]);
      toast({
        title: t('customModeleBuilder.questionAdded'),
        description: t('customModeleBuilder.questionAddedDesc'),
      });
    }
  };

  const handleSave = () => {
    if (!modeleName.trim()) {
      showToast({
        title: t('customModeleBuilder.nameRequired'),
        description: t('customModeleBuilder.nameRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    const pieces: PieceModele[] = Array.from(selectedPieces.entries()).map(([nom, tachesSelectionnees]) => ({
      id: `piece-${Date.now()}-${nom}`,
      nom,
      tachesDisponibles: getAllTasksForPiece(nom),
      tachesSelectionnees,
    }));

    const now = new Date().toISOString();
    const modele = {
      id: editingModele ? editingModele.id : `custom-${Date.now()}`,
      nom: modeleName,
      type: activeParcoursType,
      etatLieuxMoment: etatLieuxMoment,
      pieces,
      questionsChecklist: getSelectedQuestionsData(),
      createdAt: editingModele ? editingModele.createdAt : now,
      updatedAt: now,
    };

    onSave(modele);
    onOpenChange(false);

    showToast({
      title: editingModele ? t('customModeleBuilder.modelModified') : t('customModeleBuilder.modelCreated'),
      description: editingModele
        ? t('customModeleBuilder.modelModifiedDesc', { modelName: modeleName })
        : t('customModeleBuilder.modelCreatedDesc', { modelName: modeleName }),
    });
  };

  const updatedAt = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleNextStep = () => {
    if (currentStep === 1 && !modeleName.trim()) {
      showToast({
        title: t('customModeleBuilder.nameRequired'),
        description: t('customModeleBuilder.nameRequiredDesc'),
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
              step === currentStep
                ? "bg-primary text-primary-foreground"
                : step < currentStep
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                step < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto p-3 sm:p-4 md:p-6 gap-1 sm:gap-2" : "max-w-4xl w-[calc(100vw-2rem)] max-w-[95vw] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"}
          hideCloseButton={isFullScreenMode}
        >
          <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8"
              onClick={() => {
                if (currentStep > 1) {
                  handlePreviousStep();
                } else {
                  onBack ? onBack() : onOpenChange(false);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {!isFullScreenMode && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className={isFullScreenMode ? "text-center pl-8 sm:pl-10 pr-8" : "text-center px-8 sm:px-12"}>
              <DialogTitle className={isFullScreenMode ? "text-sm sm:text-base md:text-lg" : "text-base sm:text-lg md:text-xl"}>
                {editingModele ? t('customModeleBuilder.editTitle') : t('customModeleBuilder.createTitle')} {initialParcoursType === "menage" ? t('parcours.menage') : t('parcours.voyageur')}
              </DialogTitle>
              <DialogDescription className="flex items-center justify-center gap-2 text-xs mt-1">
                <Calendar className="h-3 w-3" />
                {t('customModeleBuilder.lastUpdate')} {updatedAt}
              </DialogDescription>
            </div>
          </DialogHeader>

          {renderStepIndicator()}

          <div className={isFullScreenMode ? "space-y-3 sm:space-y-4 md:space-y-6" : "space-y-4 sm:space-y-6"}>
            {/* STEP 1: Model Name */}
            {currentStep === 1 && (
              <Card>
                <CardHeader className={isFullScreenMode ? "p-3 sm:p-4 md:p-6" : "p-4 sm:p-6"}>
                  <CardTitle className="text-lg sm:text-xl">Étape 1 : Nom du modèle</CardTitle>
                  <CardDescription>Donnez un nom à votre modèle de parcours</CardDescription>
                </CardHeader>
                <CardContent className={isFullScreenMode ? "space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-6" : "space-y-3 sm:space-y-4 p-4 sm:p-6"}>
                  <div className="space-y-2">
                    <Label>{t('customModeleBuilder.modelName')}</Label>
                    <Input
                      placeholder={t('customModeleBuilder.modelNamePlaceholder')}
                      value={modeleName}
                      onChange={(e) => setModeleName(e.target.value)}
                      className="text-base"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 2: Choose Type of Inspection */}
            {currentStep === 2 && (
              <Card>
                <CardHeader className={isFullScreenMode ? "p-3 sm:p-4 md:p-6" : "p-4 sm:p-6"}>
                  <CardTitle className="text-lg sm:text-xl">
                    Étape 2 : Choisir le type d'inspection
                  </CardTitle>
                  <CardDescription>
                    Que demanderez-vous au {activeParcoursType === "menage" ? "service de ménage" : "voyageur"} ?
                  </CardDescription>
                </CardHeader>
                <CardContent className={isFullScreenMode ? "space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-6" : "space-y-3 sm:space-y-4 p-4 sm:p-6"}>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('customModeleBuilder.inventoryMoment')}</Label>
                    <div className="grid gap-3">
                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          etatLieuxMoment === "arrivee-sortie"
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setEtatLieuxMoment("arrivee-sortie")}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5 ${
                            etatLieuxMoment === "arrivee-sortie"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}>
                            {etatLieuxMoment === "arrivee-sortie" && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">
                              {activeParcoursType === "menage"
                                ? "Contrôle de l'état du logement et validation du ménage"
                                : "État des lieux à l'entrée et à la sortie"}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              📷 Photos à l'arrivée et à la sortie
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          etatLieuxMoment === "sortie"
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setEtatLieuxMoment("sortie")}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5 ${
                            etatLieuxMoment === "sortie"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}>
                            {etatLieuxMoment === "sortie" && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">
                              {activeParcoursType === "menage"
                                ? "Validation du ménage"
                                : "État des lieux à la sortie uniquement"}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              📷 Photos à la sortie uniquement
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {t('customModeleBuilder.inventoryInfo')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 3: Create Tasks for Each Room */}
            {currentStep === 3 && (
              <Card>
                <CardHeader className={isFullScreenMode ? "p-3 sm:p-4 md:p-6" : "p-4 sm:p-6"}>
                  <CardTitle className="text-lg sm:text-xl">Étape 3 : Créer les tâches pour chaque pièce</CardTitle>
                  <CardDescription>
                    Ajoutez ici les actions à effectuer par {activeParcoursType === "menage" ? "le service de ménage" : "le voyageur"}. Si besoin, demandez une photo pour vérifier qu'une tâche a bien été réalisée. Notre IA analysera la photo pour valider que la tâche a bien été effectuée. Une photo de référence peut être ajoutée pour expliquer davantage ce que {activeParcoursType === "menage" ? "l'agent de ménage" : "le voyageur"} doit faire.
                  </CardDescription>
                </CardHeader>
                <CardContent className={isFullScreenMode ? "space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-6" : "space-y-3 sm:space-y-4 p-4 sm:p-6"}>
                  {getAllPieces().map((piece) => (
                  <div key={piece} className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Checkbox
                          id={`piece-${piece}`}
                          checked={selectedPieces.has(piece)}
                          onCheckedChange={() => handleTogglePiece(piece)}
                          className="shrink-0"
                        />
                        <Label
                          htmlFor={`piece-${piece}`}
                          className="text-sm sm:text-base font-semibold cursor-pointer truncate"
                        >
                          {piece}
                        </Label>
                        {selectedPieces.has(piece) && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {selectedPieces.get(piece)?.length || 0}
                          </Badge>
                        )}
                        {customPieces.includes(piece) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleDeleteCustomPiece(piece)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {selectedPieces.has(piece) && (
                      <div className="ml-4 sm:ml-6 space-y-2">
                        {getAllTasksForPiece(piece).map((tache) => {
                          const isCustomTask = customTasks.get(piece)?.some(t => t.id === tache.id);
                          return (
                            <div key={tache.id} className="flex items-start space-x-2 p-2 hover:bg-accent/50 rounded group">
                              <Checkbox
                                id={`task-${piece}-${tache.id}`}
                                checked={selectedPieces.get(piece)?.includes(tache.id)}
                                onCheckedChange={() => handleToggleTask(piece, tache.id)}
                                className="mt-0.5 shrink-0"
                              />
                              <Label
                                htmlFor={`task-${piece}-${tache.id}`}
                                className="flex-1 cursor-pointer min-w-0"
                              >
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <span className="text-sm sm:text-base">{tache.emoji}</span>
                                  <span className="font-medium text-xs sm:text-sm">{tache.titre}</span>
                                  {isCustomTask && (
                                    <Badge variant="outline" className="text-xs">{t('customModeleBuilder.customLabel')}</Badge>
                                  )}
                                  {tache.photoObligatoire && (
                                    <Badge variant="secondary" className="text-xs">
                                      📷 <span className="hidden xs:inline">{t('customModeleBuilder.photoRequired')}</span>
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                  {tache.description}
                                </p>
                                {tache.photoUrl && (
                                  <div className="mt-2">
                                    <img
                                      src={tache.photoUrl}
                                      alt={`Photo de référence - ${tache.titre}`}
                                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-border"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      📷 Photo de référence
                                    </p>
                                  </div>
                                )}
                              </Label>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleEditTask(piece, tache)}
                                >
                                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                {isCustomTask && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteCustomTask(piece, tache.id)}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs sm:text-sm mt-2"
                          onClick={() => {
                            setCurrentPiece(piece);
                            setNewTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">{t('customModeleBuilder.addTask')}</span>
                          <span className="sm:hidden">{t('customModeleBuilder.addTaskShort')}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                  <Button
                    variant="outline"
                    className="w-full mt-3 sm:mt-4 text-xs sm:text-sm"
                    onClick={() => setNewPieceDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t('customModeleBuilder.addCustomRoom')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* STEP 4: Pre-Departure Checklist */}
            {currentStep === 4 && (
              <Card className={isFullScreenMode ? "p-2 sm:p-3 md:p-4" : "p-3 sm:p-4 md:p-6"}>
              <CardHeader className="px-0 pt-0">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg sm:text-xl">Étape 4 : Check-list avant le départ</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {getSelectedQuestionsData().length}
                    </Badge>
                  </div>
                  <CardDescription>
                    Ajoutez ici les points à vérifier avant de quitter le logement. Formulez-les sous forme de phrases affirmatives, par exemple : "J'ai éteint tous les radiateurs." Cela aide à s'assurer que chaque étape a bien été réalisée avant le départ.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-0">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                    {t('customModeleBuilder.checklistInfo')}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Questions par défaut */}
                  {getAllAvailableQuestions().map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-2 p-2 sm:p-3 border rounded-lg"
                    >
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={() => handleToggleQuestion(question.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm">{question.intitule}</div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {question.photoObligatoire && (
                            <Badge variant="secondary" className="text-xs">📷 <span className="hidden xs:inline">{t('customModeleBuilder.photoRequiredShort')}</span></Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.type === "oui-non" ? t('customModeleBuilder.yesNo') : t('customModeleBuilder.openQuestion')}
                          </Badge>
                        </div>
                      </div>
                      {selectedQuestions.has(question.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                          onClick={() => handleModifierQuestion(question)}
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Bouton Ajouter une Question après les questions par défaut */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAjouterQuestion}
                    className="w-full text-xs sm:text-sm mt-2"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('customModeleBuilder.addQuestion')}</span>
                    <span className="sm:hidden">{t('customModeleBuilder.addQuestionShort')}</span>
                  </Button>

                  {/* Questions personnalisées */}
                  {customQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-2 p-2 sm:p-3 border rounded-lg bg-accent/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">Personnalisée</Badge>
                          <div className="font-medium text-xs sm:text-sm">{question.intitule}</div>
                        </div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {question.photoObligatoire && (
                            <Badge variant="secondary" className="text-xs">📷 <span className="hidden xs:inline">Photo</span></Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.type === "oui-non" ? "Oui/Non" : "💬 Ouverte"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleModifierQuestion(question)}
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleSupprimerQuestion(question.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            {currentStep > 1 && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handlePreviousStep}
              >
                Précédent
              </Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={handleNextStep} className="w-full sm:w-auto">
                Suivant
              </Button>
            ) : (
              <Button onClick={handleSave} className="w-full sm:w-auto">
                <span className="hidden sm:inline">{editingModele ? t('customModeleBuilder.saveChanges') : t('customModeleBuilder.createModel')}</span>
                <span className="sm:hidden">{editingModele ? t('customModeleBuilder.saveChangesShort') : t('customModeleBuilder.createModelShort')}</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier une question */}
      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        question={currentQuestion}
        onSave={handleSauvegarderQuestion}
        isFullScreenMode={isFullScreenMode}
      />

      {/* Dialog pour ajouter une tâche custom */}
      <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100vw-2rem)] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t('customModeleBuilder.addCustomTask')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t('customModeleBuilder.forRoom')} {currentPiece}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t('customModeleBuilder.emojiOptional')}</Label>
              <EmojiPicker
                value={newTask.emoji}
                onChange={(emoji) => setNewTask({ ...newTask, emoji })}
                placeholder="🧹"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('customModeleBuilder.taskTitle')}</Label>
              <Input
                placeholder={t('customModeleBuilder.taskTitlePlaceholder')}
                value={newTask.titre}
                onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('customModeleBuilder.description')}</Label>
              <Input
                placeholder={t('customModeleBuilder.descriptionPlaceholder')}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="photo-required"
                checked={newTask.photoObligatoire}
                onCheckedChange={(checked) =>
                  setNewTask({ ...newTask, photoObligatoire: checked as boolean })
                }
              />
              <Label htmlFor="photo-required" className="cursor-pointer text-sm">
                {t('customModeleBuilder.photoMandatory')}
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setNewTaskDialogOpen(false)} className="w-full sm:w-auto">
              {t('customModeleBuilder.cancel')}
            </Button>
            <Button onClick={handleAddCustomTask} disabled={!newTask.titre} className="w-full sm:w-auto">
              {t('customModeleBuilder.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour éditer une tâche */}
      <TacheDialog
        open={editTaskDialogOpen}
        onOpenChange={setEditTaskDialogOpen}
        tache={editingTask?.task}
        pieceNom={editingTask?.piece || ""}
        onSave={handleSaveEditedTask}
        isFullScreenMode={isFullScreenMode}
      />

      {/* Dialog pour ajouter une pièce personnalisée */}
      <Dialog open={newPieceDialogOpen} onOpenChange={setNewPieceDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100vw-2rem)] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{t('customModeleBuilder.addCustomRoomTitle')}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t('customModeleBuilder.addCustomRoomDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="piece-name" className="text-sm">{t('customModeleBuilder.roomName')}</Label>
              <Input
                id="piece-name"
                value={newPieceName}
                onChange={(e) => setNewPieceName(e.target.value)}
                placeholder={t('customModeleBuilder.roomNamePlaceholder')}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setNewPieceDialogOpen(false);
              setNewPieceName("");
            }} className="w-full sm:w-auto">
              {t('customModeleBuilder.cancel')}
            </Button>
            <Button onClick={handleAddCustomPiece} disabled={!newPieceName.trim()} className="w-full sm:w-auto">
              {t('customModeleBuilder.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
