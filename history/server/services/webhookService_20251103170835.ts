import fetch from 'node-fetch';

interface WebhookPayload {
  conciergerieID: string;
  userID: string;
  isTestMode: boolean;
  logementData: any;
}

const WEBHOOK_CONFIG = {
  // Étape 1 : Création du logement et du parcours (sans les pièces)
  createLogement: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/webhookparcour',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/webhookparcour',
  },

  // Étape 2 : Création de chaque pièce individuellement
  createPiece: {
    production: 'https://checkeasy-57905.bubbleapps.io/version-live/api/1.1/wf/createpiece/initialize',
    test: 'https://checkeasy-57905.bubbleapps.io/version-test/api/1.1/wf/createpiece/initialize',
  },
};

// Task definitions (same as frontend)
const TACHES_MENAGE: Record<string, any[]> = {
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
      photoObligatoire: true
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
      titre: "Nettoyer extérieur frigo",
      description: "Essuyer portes ; nettoyer poignées.",
      photoObligatoire: false
    },
    {
      id: "m-cuisine-6",
      emoji: "🧹",
      titre: "Balayer et laver le sol",
      description: "Aspirer miettes ; passer serpillière.",
      photoObligatoire: true
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
      photoObligatoire: true
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
  "Salon": [
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
      photoObligatoire: true
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
  "Salle de bain sans toilettes": [
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
      photoObligatoire: true
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
  "Toilettes séparées": [
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
  "Entrée": [
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
  "Bureau": [
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
  ],
  "Balcon/Terrasse": [
    {
      id: "m-balcon-1",
      emoji: "🧹",
      titre: "Balayer le sol",
      description: "Enlever feuilles ; poussière.",
      photoObligatoire: false
    },
    {
      id: "m-balcon-2",
      emoji: "🪑",
      titre: "Nettoyer mobilier",
      description: "Essuyer table ; chaises.",
      photoObligatoire: false
    }
  ]
};

const TACHES_VOYAGEUR: Record<string, any[]> = {
  "Cuisine": [
    {
      id: "v-cuisine-1",
      emoji: "🍽️",
      titre: "Vérifier vaisselle",
      description: "Assiettes ; verres ; couverts propres.",
      photoObligatoire: true
    },
    {
      id: "v-cuisine-2",
      emoji: "❄️",
      titre: "Vérifier frigo",
      description: "Propre ; fonctionne ; température OK.",
      photoObligatoire: false
    },
    {
      id: "v-cuisine-3",
      emoji: "🔥",
      titre: "Vérifier plaques de cuisson",
      description: "Propres ; fonctionnent.",
      photoObligatoire: false
    },
    {
      id: "v-cuisine-4",
      emoji: "☕",
      titre: "Vérifier équipements",
      description: "Cafetière ; bouilloire ; micro-ondes.",
      photoObligatoire: false
    }
  ],
  "Chambre": [
    {
      id: "v-chambre-1",
      emoji: "🛏️",
      titre: "Vérifier literie",
      description: "Draps propres ; oreillers ; couvertures.",
      photoObligatoire: true
    },
    {
      id: "v-chambre-2",
      emoji: "🚪",
      titre: "Vérifier rangements",
      description: "Armoire vide ; cintres disponibles.",
      photoObligatoire: false
    },
    {
      id: "v-chambre-3",
      emoji: "💡",
      titre: "Vérifier éclairage",
      description: "Lampes fonctionnent ; ampoules OK.",
      photoObligatoire: false
    }
  ],
  "Salle de bain avec toilettes": [
    {
      id: "v-sdb-1",
      emoji: "🧴",
      titre: "Vérifier produits",
      description: "Savon ; shampoing ; papier toilette.",
      photoObligatoire: true
    },
    {
      id: "v-sdb-2",
      emoji: "🚿",
      titre: "Vérifier douche/baignoire",
      description: "Propre ; eau chaude fonctionne.",
      photoObligatoire: true
    },
    {
      id: "v-sdb-3",
      emoji: "🧻",
      titre: "Vérifier serviettes",
      description: "Propres ; en nombre suffisant.",
      photoObligatoire: false
    },
    {
      id: "v-sdb-4",
      emoji: "🚽",
      titre: "Vérifier toilettes",
      description: "Propres ; fonctionnent bien.",
      photoObligatoire: true
    }
  ],
  "Salon": [
    {
      id: "v-salon-1",
      emoji: "📺",
      titre: "Vérifier TV/WiFi",
      description: "TV fonctionne ; WiFi actif.",
      photoObligatoire: false
    },
    {
      id: "v-salon-2",
      emoji: "🛋️",
      titre: "Vérifier mobilier",
      description: "Canapé propre ; coussins en place.",
      photoObligatoire: false
    },
    {
      id: "v-salon-3",
      emoji: "🌡️",
      titre: "Vérifier chauffage/clim",
      description: "Fonctionne ; télécommande présente.",
      photoObligatoire: false
    }
  ],
  "Salle de bain sans toilettes": [
    {
      id: "v-sdb-nt-1",
      emoji: "🧴",
      titre: "Vérifier produits",
      description: "Savon ; shampoing.",
      photoObligatoire: true
    },
    {
      id: "v-sdb-nt-2",
      emoji: "🚿",
      titre: "Vérifier douche/baignoire",
      description: "Propre ; eau chaude fonctionne.",
      photoObligatoire: true
    },
    {
      id: "v-sdb-nt-3",
      emoji: "🧻",
      titre: "Vérifier serviettes",
      description: "Propres ; en nombre suffisant.",
      photoObligatoire: false
    }
  ],
  "Toilettes séparées": [
    {
      id: "v-wc-1",
      emoji: "🚽",
      titre: "Vérifier toilettes",
      description: "Propres ; fonctionnent bien.",
      photoObligatoire: true
    },
    {
      id: "v-wc-2",
      emoji: "🧻",
      titre: "Vérifier papier toilette",
      description: "Stock suffisant.",
      photoObligatoire: false
    }
  ],
  "Entrée": [
    {
      id: "v-entree-1",
      emoji: "🔑",
      titre: "Vérifier accès",
      description: "Clés ; code ; badge disponibles.",
      photoObligatoire: false
    },
    {
      id: "v-entree-2",
      emoji: "📋",
      titre: "Vérifier livret d'accueil",
      description: "Présent ; à jour.",
      photoObligatoire: false
    }
  ],
  "Bureau": [
    {
      id: "v-bureau-1",
      emoji: "💻",
      titre: "Vérifier espace de travail",
      description: "Bureau propre ; chaise confortable.",
      photoObligatoire: false
    },
    {
      id: "v-bureau-2",
      emoji: "🔌",
      titre: "Vérifier prises électriques",
      description: "Fonctionnent ; accessibles.",
      photoObligatoire: false
    }
  ],
  "Balcon/Terrasse": [
    {
      id: "v-balcon-1",
      emoji: "🪑",
      titre: "Vérifier mobilier extérieur",
      description: "Propre ; en bon état.",
      photoObligatoire: false
    },
    {
      id: "v-balcon-2",
      emoji: "🌿",
      titre: "Vérifier propreté",
      description: "Sol propre ; plantes entretenues.",
      photoObligatoire: false
    }
  ]
};

// Function to get tasks for a piece
function getTasksForPiece(pieceName: string, modele: any): any[] {
  if (typeof modele === 'string') {
    const tasksSource = modele === 'menage' ? TACHES_MENAGE : TACHES_VOYAGEUR;
    return tasksSource[pieceName] || [];
  } else {
    const pieceData = modele.pieces?.find((p: any) => p.nom === pieceName);
    return pieceData ? pieceData.tachesDisponibles : [];
  }
}

// Main function to send webhook to Bubble.io
export async function sendWebhookToBubble(payload: WebhookPayload): Promise<void> {
  const { conciergerieID, userID, isTestMode, logementData } = payload;

  try {
    const endpoint = isTestMode ? WEBHOOK_CONFIG.testEndpoint : WEBHOOK_CONFIG.productionEndpoint;

    // Prepare pieces with tasks and photos included
    const piecesWithTasksAndPhotos = logementData.pieces.map((piece: any) => ({
      ...piece,
      tasks: getTasksForPiece(piece.nom, logementData.modele),
      photos: logementData.piecesPhotos[piece.nom] || [],
    }));

    // Get the parcours name
    const nomParcours = typeof logementData.modele === 'string'
      ? (logementData.modele === 'menage' ? 'Ménage Check Easy' : 'Voyageur Check Easy')
      : logementData.modele.nom;

    // Prepare webhook payload
    const webhookPayload = {
      conciergerieID: conciergerieID || 'conciergerie_demo',
      logementID: logementData.logementId,
      userID: userID || 'user_demo',
      nom: logementData.nom,
      adresse: logementData.adresse,
      airbnbLink: logementData.airbnbLink || undefined,
      parcoursType: logementData.parcoursType,
      nomParcours: nomParcours,
      modele: typeof logementData.modele === 'string'
        ? { type: 'predefined', value: logementData.modele }
        : { type: 'custom', value: logementData.modele },
      pieces: piecesWithTasksAndPhotos,
    };

    console.log(`📤 Sending webhook to ${isTestMode ? 'TEST' : 'PRODUCTION'} endpoint...`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Logement: ${logementData.nom}`);
    console.log(`   Pieces: ${piecesWithTasksAndPhotos.length}`);
    console.log(`   Total photos: ${Object.values(logementData.piecesPhotos).flat().length}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ Webhook sent successfully for logement: ${logementData.nom}`);
  } catch (error) {
    console.error(`❌ Failed to send webhook for logement: ${logementData.nom}`, error);
    throw error;
  }
}

