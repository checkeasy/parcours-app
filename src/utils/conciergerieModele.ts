import { ParcoursModele, PieceModele, QuestionModele } from '../types/modele';
import { loadModelesFromBubble, saveModelesToLocalStorage } from './loadModeles';
import { dispatchModeleWebhook } from './webhook';

/**
 * Génère l'ID du modèle de conciergerie
 * Format: conciergerie-{type}-{conciergerieID}
 */
export const getConciergerieModeleId = (type: "menage" | "voyageur", conciergerieID: string): string => {
  return `conciergerie-${type}-${conciergerieID}`;
};

/**
 * Charge le modèle de conciergerie depuis Bubble.io
 * Si le modèle n'existe pas, crée un modèle vide par défaut
 */
export const loadConciergerieModele = async (
  type: "menage" | "voyageur",
  conciergerieID: string,
  isTestMode: boolean = true
): Promise<ParcoursModele> => {
  try {
    // Charger tous les modèles de la conciergerie
    const modeles = await loadModelesFromBubble(conciergerieID, isTestMode);
    
    // Chercher le modèle de conciergerie correspondant au type
    const modeleId = getConciergerieModeleId(type, conciergerieID);
    const existingModele = modeles.find(m => m.id === modeleId);
    
    if (existingModele) {
      console.log(`✅ Modèle de conciergerie trouvé: ${existingModele.nom}`);
      return existingModele;
    }
    
    // Si le modèle n'existe pas, créer un modèle vide par défaut
    console.log(`📝 Création d'un nouveau modèle de conciergerie pour ${type}`);
    const newModele: ParcoursModele = {
      id: modeleId,
      nom: `Parcours ${type === "menage" ? "Ménage" : "Voyageur"}`,
      type,
      pieces: [],
      piecesQuantity: [],
      etatLieuxMoment: "arrivee-sortie",
      questionsChecklist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newModele;
  } catch (error) {
    console.error('❌ Erreur lors du chargement du modèle de conciergerie:', error);
    
    // En cas d'erreur, retourner un modèle vide par défaut
    const modeleId = getConciergerieModeleId(type, conciergerieID);
    return {
      id: modeleId,
      nom: `Parcours ${type === "menage" ? "Ménage" : "Voyageur"}`,
      type,
      pieces: [],
      piecesQuantity: [],
      etatLieuxMoment: "arrivee-sortie",
      questionsChecklist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

/**
 * Met à jour le modèle de conciergerie dans Bubble.io et le localStorage
 */
export const updateConciergerieModele = async (
  modele: ParcoursModele,
  conciergerieID: string,
  isTestMode: boolean = true
): Promise<void> => {
  try {
    console.log(`📤 Mise à jour du modèle de conciergerie: ${modele.nom}`);
    
    // Mettre à jour la date de modification
    const updatedModele: ParcoursModele = {
      ...modele,
      updatedAt: new Date().toISOString(),
    };
    
    // Envoyer le webhook à Bubble.io
    const webhookResult = await dispatchModeleWebhook(updatedModele);
    
    if (webhookResult.success) {
      console.log('✅ Modèle de conciergerie mis à jour avec succès dans Bubble.io');
    } else {
      console.error('⚠️ Échec de la mise à jour du modèle dans Bubble.io');
    }
    
    // Charger tous les modèles existants
    const allModeles = await loadModelesFromBubble(conciergerieID, isTestMode);
    
    // Remplacer ou ajouter le modèle mis à jour
    const updatedModeles = allModeles.filter(m => m.id !== updatedModele.id);
    updatedModeles.push(updatedModele);
    
    // Sauvegarder dans le localStorage
    saveModelesToLocalStorage(updatedModeles, conciergerieID);
    
    console.log('✅ Modèle de conciergerie sauvegardé dans le localStorage');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du modèle de conciergerie:', error);
    throw error;
  }
};

/**
 * Met à jour les pièces du modèle de conciergerie
 */
export const updateModelePieces = (
  modele: ParcoursModele,
  piecesQuantity: Array<{ nom: string; quantite: number; isCustom?: boolean }>
): ParcoursModele => {
  return {
    ...modele,
    piecesQuantity,
    etatLieuxMoment: "arrivee-sortie", // Toujours à l'entrée et à la sortie
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Met à jour les tâches du modèle de conciergerie
 */
export const updateModeleTasks = (
  modele: ParcoursModele,
  tasksPerRoom: Map<string, string[]>,
  allTasksSource: Record<string, any[]>
): ParcoursModele => {
  const pieces: PieceModele[] = [];

  tasksPerRoom.forEach((tachesSelectionnees, nomPiece) => {
    const tachesDisponibles = allTasksSource[nomPiece] || [];

    pieces.push({
      id: `piece-${Date.now()}-${nomPiece}`,
      nom: nomPiece,
      tachesDisponibles,
      tachesSelectionnees,
    });
  });

  return {
    ...modele,
    pieces,
    etatLieuxMoment: "arrivee-sortie", // Toujours à l'entrée et à la sortie
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Met à jour les questions du modèle de conciergerie
 */
export const updateModeleQuestions = (
  modele: ParcoursModele,
  questions: QuestionModele[]
): ParcoursModele => {
  return {
    ...modele,
    questionsChecklist: questions,
    etatLieuxMoment: "arrivee-sortie", // Toujours à l'entrée et à la sortie
    updatedAt: new Date().toISOString(),
  };
};

