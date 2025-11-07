import { ParcoursModele } from '../types/modele';
import { getBubbleEndpoint } from '../config/bubbleEndpoints';

/**
 * Interface pour la réponse de Bubble.io
 */
interface BubbleModeleResponse {
  status: string;
  response: {
    data: Array<{
      _id: string;
      nom: string;
      'Type Parcours': string;
      TypePhoto: string;
      'Created Date': number;
      'Modified Date': number;
      conciergerie: string;
      'Data Template parcour': {
        body_raw_text: string;
        _api_c2_returned_an_error: boolean;
      };
    }>;
  };
}

/**
 * Interface pour le contenu parsé de body_raw_text
 */
interface ParsedBodyRawText {
  conciergerieID: string;
  userID: string;
  modele: ParcoursModele;
}

/**
 * Charge les modèles personnalisés depuis Bubble.io
 * 
 * @param conciergerieID - ID de la conciergerie
 * @param isTestMode - Mode test ou production (défaut: true)
 * @returns Promise<ParcoursModele[]> - Tableau des modèles personnalisés
 */
export const loadModelesFromBubble = async (
  conciergerieID: string,
  isTestMode: boolean = true
): Promise<ParcoursModele[]> => {
  try {
    const endpoint = getBubbleEndpoint('loadModeles', isTestMode);
    const url = `${endpoint}?conciergerie=${encodeURIComponent(conciergerieID)}`;

    console.log(`📥 Chargement des modèles depuis Bubble.io...`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Conciergerie: ${conciergerieID}`);
    console.log(`   Mode: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    const data: BubbleModeleResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error(`Erreur Bubble.io: status=${data.status}`);
    }

    console.log(`   ✅ ${data.response.data.length} modèle(s) trouvé(s)`);

    // Parser chaque modèle
    const modeles: ParcoursModele[] = [];

    for (const item of data.response.data) {
      try {
        // Vérifier si l'API a retourné une erreur
        if (item['Data Template parcour']._api_c2_returned_an_error) {
          console.warn(`   ⚠️ Modèle "${item.nom}" ignoré (erreur API Bubble)`);
          continue;
        }

        // Parser le body_raw_text
        const bodyRawText = item['Data Template parcour'].body_raw_text;
        if (!bodyRawText) {
          console.warn(`   ⚠️ Modèle "${item.nom}" ignoré (body_raw_text vide)`);
          continue;
        }

        const parsed: ParsedBodyRawText = JSON.parse(bodyRawText);

        // Extraire le modèle
        const modele = parsed.modele;

        if (!modele || !modele.id || !modele.nom) {
          console.warn(`   ⚠️ Modèle "${item.nom}" ignoré (structure invalide)`);
          continue;
        }

        console.log(`   ✅ Modèle chargé: "${modele.nom}" (${modele.type})`);
        console.log(`      - Pièces: ${modele.pieces?.length || 0}`);
        console.log(`      - Questions: ${modele.questionsChecklist?.length || 0}`);
        console.log(`      - État des lieux: ${modele.etatLieuxMoment || 'non défini'}`);

        modeles.push(modele);
      } catch (parseError) {
        console.error(`   ❌ Erreur lors du parsing du modèle "${item.nom}":`, parseError);
        continue;
      }
    }

    console.log(`\n✅ ${modeles.length} modèle(s) chargé(s) avec succès`);
    return modeles;

  } catch (error) {
    console.error('❌ Erreur lors du chargement des modèles depuis Bubble.io:', error);
    throw error;
  }
};

/**
 * Charge les modèles et les fusionne avec les modèles locaux
 * 
 * @param conciergerieID - ID de la conciergerie
 * @param localModeles - Modèles stockés localement
 * @param isTestMode - Mode test ou production (défaut: true)
 * @returns Promise<ParcoursModele[]> - Tableau fusionné des modèles
 */
export const loadAndMergeModeles = async (
  conciergerieID: string,
  localModeles: ParcoursModele[],
  isTestMode: boolean = true
): Promise<ParcoursModele[]> => {
  try {
    // Charger les modèles depuis Bubble.io
    const bubbleModeles = await loadModelesFromBubble(conciergerieID, isTestMode);

    // Créer un Map des modèles Bubble par ID pour éviter les doublons
    const bubbleModelesMap = new Map<string, ParcoursModele>();
    bubbleModeles.forEach(modele => {
      bubbleModelesMap.set(modele.id, modele);
    });

    // Créer un Map des modèles locaux par ID
    const localModelesMap = new Map<string, ParcoursModele>();
    localModeles.forEach(modele => {
      localModelesMap.set(modele.id, modele);
    });

    // Fusionner : priorité aux modèles Bubble (plus récents)
    const mergedModeles: ParcoursModele[] = [];

    // Ajouter tous les modèles Bubble
    bubbleModeles.forEach(modele => {
      mergedModeles.push(modele);
    });

    // Ajouter les modèles locaux qui ne sont pas dans Bubble
    localModeles.forEach(modele => {
      if (!bubbleModelesMap.has(modele.id)) {
        mergedModeles.push(modele);
      }
    });

    console.log(`\n📊 Fusion des modèles:`);
    console.log(`   - Modèles Bubble: ${bubbleModeles.length}`);
    console.log(`   - Modèles locaux: ${localModeles.length}`);
    console.log(`   - Modèles fusionnés: ${mergedModeles.length}`);

    return mergedModeles;

  } catch (error) {
    console.error('❌ Erreur lors de la fusion des modèles:', error);
    // En cas d'erreur, retourner les modèles locaux
    console.log('⚠️ Utilisation des modèles locaux uniquement');
    return localModeles;
  }
};

/**
 * Sauvegarde les modèles dans le localStorage
 * 
 * @param modeles - Tableau des modèles à sauvegarder
 */
export const saveModelesToLocalStorage = (modeles: ParcoursModele[]): void => {
  try {
    localStorage.setItem('custom-modeles', JSON.stringify(modeles));
    console.log(`💾 ${modeles.length} modèle(s) sauvegardé(s) dans le localStorage`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des modèles:', error);
  }
};

/**
 * Charge les modèles depuis le localStorage
 * 
 * @returns ParcoursModele[] - Tableau des modèles chargés
 */
export const loadModelesFromLocalStorage = (): ParcoursModele[] => {
  try {
    const stored = localStorage.getItem('custom-modeles');
    if (!stored) {
      return [];
    }
    const modeles = JSON.parse(stored);
    console.log(`💾 ${modeles.length} modèle(s) chargé(s) depuis le localStorage`);
    return modeles;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des modèles depuis localStorage:', error);
    return [];
  }
};

