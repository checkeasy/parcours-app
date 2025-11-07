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

// Main function to send webhook to Bubble.io (2-step workflow)
export async function sendWebhookToBubble(payload: WebhookPayload): Promise<void> {
  const { conciergerieID, userID, isTestMode, logementData } = payload;

  try {
    console.log(`📨 Received webhook request for logement: ${logementData.nom}`);
    console.log(`   - Test mode: ${isTestMode ? 'YES' : 'NO'}`);
    console.log(`   - ConciergerieID: ${conciergerieID}`);
    console.log(`   - UserID: ${userID}`);

    // Select endpoints based on test mode
    const createLogementEndpoint = isTestMode
      ? WEBHOOK_CONFIG.createLogement.test
      : WEBHOOK_CONFIG.createLogement.production;

    const createPieceEndpoint = isTestMode
      ? WEBHOOK_CONFIG.createPiece.test
      : WEBHOOK_CONFIG.createPiece.production;

    // Get the parcours name
    const nomParcours = typeof logementData.modele === 'string'
      ? (logementData.modele === 'menage' ? 'Ménage Check Easy' : 'Voyageur Check Easy')
      : logementData.modele.nom;

    // ========================================
    // ÉTAPE 1 : Créer le logement et le parcours (SANS les pièces)
    // ========================================
    console.log(`\n📤 ÉTAPE 1/2 : Création du logement et du parcours...`);
    console.log(`   Endpoint: ${createLogementEndpoint}`);
    console.log(`   Logement: ${logementData.nom}`);

    const logementPayload = {
      conciergerieID: conciergerieID || 'conciergerie_demo',
      userID: userID || 'user_demo',
      nom: logementData.nom,
      adresse: logementData.adresse,
      airbnbLink: logementData.airbnbLink || undefined,
      parcoursType: logementData.parcoursType,
      nomParcours: nomParcours,
      modele: typeof logementData.modele === 'string'
        ? { type: 'predefined', value: logementData.modele }
        : { type: 'custom', value: logementData.modele },
      // PAS de pièces dans cette requête
    };

    const logementResponse = await fetch(createLogementEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logementPayload),
    });

    if (!logementResponse.ok) {
      const errorText = await logementResponse.text();
      throw new Error(`Étape 1 échouée: ${logementResponse.status} ${logementResponse.statusText} - ${errorText}`);
    }

    const logementResult = await logementResponse.json();

    // Bubble retourne les données dans un objet "response"
    const responseData = logementResult.response || logementResult;
    const { logementID, parcourID } = responseData;

    if (!logementID || !parcourID) {
      throw new Error(`Étape 1 échouée: Bubble n'a pas retourné logementID ou parcourID. Réponse: ${JSON.stringify(logementResult)}`);
    }

    console.log(`✅ Logement et parcours créés avec succès`);
    console.log(`   - LogementID: ${logementID}`);
    console.log(`   - ParcourID: ${parcourID}`);

    // ========================================
    // ÉTAPE 2 : Créer chaque pièce individuellement
    // ========================================
    const pieces = logementData.pieces || [];
    const totalPieces = pieces.length;

    console.log(`\n📤 ÉTAPE 2/2 : Création des pièces (${totalPieces} pièces)...`);
    console.log(`   Endpoint: ${createPieceEndpoint}`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      const pieceNumber = i + 1;

      try {
        console.log(`\n   📦 Pièce ${pieceNumber}/${totalPieces}: ${piece.nom} (quantité: ${piece.quantite})`);

        // Get tasks for this piece
        const tasks = getTasksForPiece(piece.nom, logementData.modele);
        const photos = logementData.piecesPhotos[piece.nom] || [];

        console.log(`      - Tâches: ${tasks.length}`);
        console.log(`      - Photos: ${photos.length}`);

        const piecePayload = {
          logementID: logementID,
          parcourID: parcourID,
          nom: piece.nom,
          quantite: piece.quantite,
          tasks: tasks,
          photos: photos,
        };

        const pieceResponse = await fetch(createPieceEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(piecePayload),
        });

        if (!pieceResponse.ok) {
          const errorText = await pieceResponse.text();
          throw new Error(`${pieceResponse.status} ${pieceResponse.statusText} - ${errorText}`);
        }

        console.log(`      ✅ Pièce créée avec succès`);
        successCount++;

      } catch (error) {
        console.error(`      ❌ Erreur lors de la création de la pièce "${piece.nom}":`, error);
        errorCount++;
        // Continue avec les autres pièces même en cas d'erreur
      }
    }

    // ========================================
    // RÉSUMÉ FINAL
    // ========================================
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ WEBHOOK TERMINÉ pour logement: ${logementData.nom}`);
    console.log(`   - Logement créé: ✅`);
    console.log(`   - Parcours créé: ✅`);
    console.log(`   - Pièces créées: ${successCount}/${totalPieces}`);
    if (errorCount > 0) {
      console.log(`   - Erreurs: ${errorCount} pièce(s) en échec`);
    }
    console.log(`${'='.repeat(60)}\n`);

    if (errorCount === totalPieces && totalPieces > 0) {
      throw new Error(`Toutes les pièces ont échoué (${errorCount}/${totalPieces})`);
    }

  } catch (error) {
    console.error(`\n❌ ÉCHEC GLOBAL du webhook pour logement: ${logementData.nom}`);
    console.error(error);
    throw error;
  }
}

