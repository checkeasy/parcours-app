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

interface CustomModeleBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (modele: any) => void;
  onBack?: () => void;
  parcoursType?: "menage" | "voyageur";
  editingModele?: any;
  isFullScreenMode?: boolean;
}

// Pièces disponibles pour MÉNAGE
const PIECES_MENAGE = [
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

// Pièces disponibles pour VOYAGEUR
const PIECES_VOYAGEUR = [
  "Cuisine",
  "Salle de bain (sans toilettes)",
  "Salle de bain avec toilettes",
  "Toilettes séparés",
  "Chambre",
  "Salon / Séjour",
  "Espaces extérieurs"
];

// Tâches par défaut pour MÉNAGE
export const TACHES_MENAGE: Record<string, TacheModele[]> = {
  "Cuisine": [
    { id: "m-cuisine-1", emoji: "🗑️", titre: "Vider les poubelles", description: "Remplacer sac ; nettoyer couvercle & bac.", photoObligatoire: true },
    { id: "m-cuisine-2", emoji: "🍽️", titre: "Laver la vaisselle", description: "Nettoyer, sécher, ranger toute la vaisselle.", photoObligatoire: false },
    { id: "m-cuisine-3", emoji: "🧽", titre: "Essuyer toutes surfaces", description: "Plans, crédence, porte-placard, table bar.", photoObligatoire: false },
    { id: "m-cuisine-4", emoji: "📡", titre: "Nettoyer micro-ondes", description: "Intérieur doit être propre", photoObligatoire: true },
    { id: "m-cuisine-5", emoji: "❄️", titre: "Nettoyer réfrigérateur", description: "Vider et laver les étagères.", photoObligatoire: true },
    { id: "m-cuisine-6", emoji: "🧊", titre: "Nettoyer congélateur", description: "Vider et laver.", photoObligatoire: true },
    { id: "m-cuisine-7", emoji: "🔥", titre: "Nettoyer four", description: "Nettoyer l'intérieur du four et la vitre.", photoObligatoire: true },
    { id: "m-cuisine-8", emoji: "🍳", titre: "Nettoyer plaques/cuisson", description: "Gaz : brûleurs dégraissés. Induction : sans trace.", photoObligatoire: true },
    { id: "m-cuisine-9", emoji: "💨", titre: "Dégraisser hotte & filtre", description: "Filtre nettoyé ou signalé à changer.", photoObligatoire: false },
    { id: "m-cuisine-10", emoji: "☕", titre: "Nettoyer petits électros", description: "Cafetière, bouilloire, grille-pain sans miettes.", photoObligatoire: true },
    { id: "m-cuisine-11", emoji: "🧼", titre: "Vider lave-vaisselle", description: "Ranger la vaisselle, laisser 2 pastilles.", photoObligatoire: true },
    { id: "m-cuisine-12", emoji: "🧴", titre: "Contrôler éponge & liquide", description: "Éponge saine ; et produit vaisselle", photoObligatoire: false },
    { id: "m-cuisine-13", emoji: "🧹", titre: "Balayer & serpillière", description: "Sol sans miettes, taches, traces de gras.", photoObligatoire: false },
  ],
  "Salle de bain (sans toilettes)": [
    { id: "m-sdb-1", emoji: "💈", titre: "Retirer cheveux/poils (siphon)", description: "Siphon de douche propre.", photoObligatoire: true },
    { id: "m-sdb-2", emoji: "🚿", titre: "Détartrer parois & robinetterie", description: "Sans calcaire ni moisissure.", photoObligatoire: true },
    { id: "m-sdb-3", emoji: "🧱", titre: "Nettoyer carrelage & joints", description: "Joints blancs, carreaux sans savon.", photoObligatoire: false },
    { id: "m-sdb-4", emoji: "🪞", titre: "Nettoyer miroir & vasque", description: "Sans trace d'eau ni dentifrice.", photoObligatoire: false },
    { id: "m-sdb-5", emoji: "🚪", titre: "Nettoyer meuble sous-vasque", description: "Intérieur vidé, façade essuyée.", photoObligatoire: false },
    { id: "m-sdb-6", emoji: "🧺", titre: "Vérifier linge de toilette", description: "Serviettes propres, pliées, quantité suffisante.", photoObligatoire: false },
    { id: "m-sdb-7", emoji: "🗑️", titre: "Vider poubelle SDB", description: "Sac neuf, sans odeur.", photoObligatoire: false },
    { id: "m-sdb-8", emoji: "🛁", titre: "Changer le tapis de bain", description: "Prendre un tapis propre", photoObligatoire: false },
  ],
  "Salle de bain avec toilettes": [
    { id: "m-sdbwc-1", emoji: "🚽", titre: "Nettoyer cuvette & lunette", description: "Détartrage, désinfection, dessous de lunette inclus.", photoObligatoire: true },
    { id: "m-sdbwc-2", emoji: "🧻", titre: "Recharger papier toilette", description: "≥ 1 rouleau plein disponible.", photoObligatoire: false },
    { id: "m-sdbwc-3", emoji: "💈", titre: "Retirer cheveux/poils (siphon)", description: "Siphon de douche propre.", photoObligatoire: true },
    { id: "m-sdbwc-4", emoji: "🚿", titre: "Détartrer parois & robinetterie", description: "Sans calcaire ni moisissure.", photoObligatoire: false },
    { id: "m-sdbwc-5", emoji: "🧱", titre: "Nettoyer carrelage & joints", description: "Joints blancs, carreaux sans savon.", photoObligatoire: false },
    { id: "m-sdbwc-6", emoji: "🪞", titre: "Nettoyer miroir & vasque", description: "Sans trace d'eau ni dentifrice.", photoObligatoire: false },
    { id: "m-sdbwc-7", emoji: "🚪", titre: "Nettoyer meuble sous-vasque", description: "Intérieur vidé, façade essuyée.", photoObligatoire: false },
    { id: "m-sdbwc-8", emoji: "🧺", titre: "Vérifier linge de toilette", description: "Serviettes propres, pliées, quantité suffisante.", photoObligatoire: false },
    { id: "m-sdbwc-9", emoji: "🗑️", titre: "Vider poubelle SDB", description: "Sac neuf, sans odeur.", photoObligatoire: false },
    { id: "m-sdbwc-10", emoji: "🛁", titre: "Changer le tapis de bain", description: "Prendre un tapis propre", photoObligatoire: false },
  ],
  "Toilettes séparés": [
    { id: "m-wc-1", emoji: "🚽", titre: "Nettoyer cuvette & lunette", description: "Détartrage, désinfection, dessous de lunette inclus.", photoObligatoire: true },
    { id: "m-wc-2", emoji: "🧻", titre: "Recharger papier toilette", description: "≥ 1 rouleau plein disponible.", photoObligatoire: false },
  ],
  "Chambre": [
    { id: "m-chambre-1", emoji: "🛏️", titre: "Changer draps & taies", description: "Parure propre, tirée au carré.", photoObligatoire: true },
    { id: "m-chambre-2", emoji: "🧹", titre: "Aspirer matelas", description: "Cheveux / poussière retirés.", photoObligatoire: false },
    { id: "m-chambre-3", emoji: "🛌", titre: "Contrôler oreillers & couette", description: "Sans taches ni odeur.", photoObligatoire: false },
    { id: "m-chambre-4", emoji: "🪵", titre: "Signaler latte cassée", description: "Lever sommier et vérifier.", photoObligatoire: false },
    { id: "m-chambre-5", emoji: "🧹", titre: "Aspirer sous lit & meubles", description: "Aucune boule de poussière.", photoObligatoire: false },
    { id: "m-chambre-6", emoji: "💡", titre: "Nettoyer tables de chevet", description: "Dépoussiérer, essuyer lampes.", photoObligatoire: false },
    { id: "m-chambre-7", emoji: "🚪", titre: "Vérifier placards & tiroirs", description: "Vides, propres.", photoObligatoire: true },
    { id: "m-chambre-8", emoji: "🪟", titre: "Ranger rideaux / volets", description: "Fonctionnement OK, pas de tache.", photoObligatoire: false },
  ],
  "Salon / Séjour": [
    { id: "m-salon-1", emoji: "🧹", titre: "Dépoussiérer surfaces", description: "Tables, étagères, TV, moulures.", photoObligatoire: false },
    { id: "m-salon-2", emoji: "🛋️", titre: "Aspirer canapé & fauteuils", description: "Retirer poils, miettes, coussins tapotés.", photoObligatoire: false },
    { id: "m-salon-3", emoji: "🧺", titre: "Aspirer & secouer tapis", description: "Pas de miette, pas d'odeur.", photoObligatoire: false },
    { id: "m-salon-4", emoji: "📺", titre: "Remettre télécommande TV", description: "Placer dans un endroit visible", photoObligatoire: true },
    { id: "m-salon-5", emoji: "📐", titre: "Aligner mobilier & déco", description: "Table basse centrée, coussins placés.", photoObligatoire: false },
  ],
  "Salle à manger": [
    { id: "m-sam-1", emoji: "🪑", titre: "Essuyer table & chaises", description: "Plateau sans trace, chaises dépoussiérées.", photoObligatoire: true },
    { id: "m-sam-2", emoji: "🍽️", titre: "Vérifier sets de table / déco", description: "Propre, rangé.", photoObligatoire: false },
    { id: "m-sam-3", emoji: "🚪", titre: "Nettoyer buffet / vaisselier", description: "Poignées sans empreintes.", photoObligatoire: false },
    { id: "m-sam-4", emoji: "🧹", titre: "Passer aspirateur sous table", description: "Aucun débris.", photoObligatoire: false },
  ],
  "Entrée / Couloir / Escaliers": [
    { id: "m-entree-1", emoji: "🚪", titre: "Nettoyer/secouer paillasson", description: "Sans sable ni gravier.", photoObligatoire: false },
    { id: "m-entree-2", emoji: "🪞", titre: "Nettoyer miroir & interphone", description: "Sans trace de doigts.", photoObligatoire: false },
    { id: "m-entree-3", emoji: "🪜", titre: "Dépoussiérer rampe escalier", description: "Rampe & barreaux sans poussière.", photoObligatoire: false },
  ],
  "Buanderie / Laverie": [
    { id: "m-buand-1", emoji: "🧺", titre: "Nettoyer tambour lave-linge", description: "Joint & hublot essuyés.", photoObligatoire: false },
    { id: "m-buand-2", emoji: "🌪️", titre: "Vider filtre sèche-linge", description: "Peluches retirées.", photoObligatoire: false },
    { id: "m-buand-3", emoji: "🧼", titre: "Nettoyer plan de pliage", description: "Sans tache de lessive.", photoObligatoire: false },
    { id: "m-buand-4", emoji: "🧴", titre: "Contrôler stock lessive", description: "≥ 2 doses.", photoObligatoire: false },
  ],
  "Espaces extérieurs": [
    { id: "m-ext-1", emoji: "🪑", titre: "Nettoyer mobilier jardin", description: "Table & chaises essuyées.", photoObligatoire: false },
    { id: "m-ext-2", emoji: "☂️", titre: "Ranger coussins & parasol", description: "Coussins secs, parasol fermé.", photoObligatoire: false },
    { id: "m-ext-3", emoji: "🚬", titre: "Vider cendriers & mégots", description: "Aucun mégot au sol.", photoObligatoire: false },
    { id: "m-ext-4", emoji: "🍖", titre: "Nettoyer barbecue", description: "Grille brossée, cendres vidées.", photoObligatoire: true },
    { id: "m-ext-5", emoji: "🛁", titre: "Vérifier SPA", description: "Eau claire, couvercle remis.", photoObligatoire: false },
    { id: "m-ext-6", emoji: "🏊", titre: "Vérifier piscine", description: "Eau propre, skimmer vidé, couverture sécurisée.", photoObligatoire: false },
    { id: "m-ext-7", emoji: "🌱", titre: "Arroser / vérifier plantes", description: "Feuilles mortes retirées.", photoObligatoire: false },
  ],
};

// Tâches par défaut pour VOYAGEUR
export const TACHES_VOYAGEUR: Record<string, TacheModele[]> = {
  "Cuisine": [
    { id: "v-cuisine-1", emoji: "🗑️", titre: "Vider les poubelles", description: "Sortir tous les sacs, remettre un sac propre, fermer le couvercle.", photoObligatoire: true },
    { id: "v-cuisine-2", emoji: "🍽️", titre: "Ranger la vaisselle", description: "Laver ou lancer le lave-vaisselle puis ranger toute la vaisselle propre.", photoObligatoire: false },
    { id: "v-cuisine-3", emoji: "❄️", titre: "Vider le réfrigérateur", description: "Retirer tous les aliments entamés, jeter ou emporter.", photoObligatoire: true },
  ],
  "Salle de bain (sans toilettes)": [
    { id: "v-sdb-1", emoji: "🧺", titre: "Rassembler serviettes", description: "Déposer toutes les serviettes utilisées dans le panier ou sur le sol prévu.", photoObligatoire: true },
    { id: "v-sdb-2", emoji: "🗑️", titre: "Vider la poubelle", description: "Jeter mouchoirs ou produits usagés, remettre un sac propre si fourni.", photoObligatoire: false },
    { id: "v-sdb-3", emoji: "🧴", titre: "Vérifier effets personnels", description: "Aucun produit ou accessoire oublié dans la douche ou sur la vasque.", photoObligatoire: false },
  ],
  "Salle de bain avec toilettes": [
    { id: "v-sdbwc-1", emoji: "🚽", titre: "Tirer chasse & abaisser lunette", description: "Laisser la cuvette propre et fermée.", photoObligatoire: true },
    { id: "v-sdbwc-2", emoji: "🗑️", titre: "Vider la poubelle", description: "Sac retiré ou contenu jeté dans la grande poubelle.", photoObligatoire: false },
    { id: "v-sdbwc-3", emoji: "🧺", titre: "Regrouper serviettes", description: "Mettre linge humide au même endroit (panier ou sol prévu).", photoObligatoire: false },
  ],
  "Toilettes séparés": [
    { id: "v-wc-1", emoji: "🚽", titre: "Tirer chasse & fermer abattant", description: "Laisser cuvette et abattant propres.", photoObligatoire: false },
    { id: "v-wc-2", emoji: "🗑️", titre: "Vider la poubelle", description: "Retirer le sac ou son contenu.", photoObligatoire: false },
  ],
  "Chambre": [
    { id: "v-chambre-1", emoji: "🛏️", titre: "Défaire le linge de lit", description: "Retirer draps & taies, les placer où indiqué (panier, sac…).", photoObligatoire: true },
    { id: "v-chambre-2", emoji: "🚪", titre: "Vérifier placards/tiroirs", description: "Rien d'oublié ni de déchets à l'intérieur.", photoObligatoire: true },
  ],
  "Salon / Séjour": [
    { id: "v-salon-1", emoji: "🛋️", titre: "Ranger canapé & coussins", description: "Coussins tapotés, plaid plié, canapé dégagé.", photoObligatoire: true },
    { id: "v-salon-2", emoji: "📺", titre: "Éteindre TV & appareils", description: "Télécommande posée à sa place, TV et console éteintes.", photoObligatoire: false },
  ],
  "Espaces extérieurs": [
    { id: "v-ext-1", emoji: "🪑", titre: "Ranger mobilier", description: "Chaises repoussées, coussins rentrés ou empilés.", photoObligatoire: true },
    { id: "v-ext-2", emoji: "🚬", titre: "Vider cendriers", description: "Jeter mégots, nettoyer cendrier si besoin.", photoObligatoire: false },
    { id: "v-ext-3", emoji: "☂️", titre: "Fermer parasol / BBQ", description: "Parasol fermé ; BBQ éteint & couvercle remis.", photoObligatoire: false },
    { id: "v-ext-4", emoji: "🚪", titre: "Vérifier portail / portillon", description: "Fermé ou verrouillé selon consigne.", photoObligatoire: false },
  ],
};

// Questions par défaut pour la checklist MÉNAGE
const DEFAULT_QUESTIONS_MENAGE: QuestionModele[] = [
  {
    id: "q1",
    intitule: "Les lumières, les radiateurs et la climatisation sont-ils bien éteints ?",
    type: "oui-non",
    obligatoire: true
  },
  {
    id: "q2",
    intitule: "Les stocks de consommables (savon, shampoing, papier toilette) et les produits d'entretien (éponge, liquide vaisselle, sacs-poubelle, etc.) sont-ils suffisants pour les prochains voyageurs ?",
    type: "oui-non",
    obligatoire: true
  },
  {
    id: "q3",
    intitule: "Avez-vous constaté des dégradations ou anomalies non signalées ? Certains équipements nécessitent-ils un remplacement ou une réparation ?",
    type: "ouverte",
    obligatoire: false
  },
  {
    id: "q4",
    intitule: "Si vous avez remarqué un problème ou souhaitez ajouter un commentaire, merci de le préciser ici.",
    type: "ouverte",
    obligatoire: false
  },
  {
    id: "q5",
    intitule: "Avez-vous remis la clé au bon endroit ? (Photo de la clé dans la boîte à clé. Ou si pas de boîte à clé, photo de la clé sur le meuble de l'entrée ou la table du salon)",
    type: "oui-non",
    photoObligatoire: true,
    obligatoire: true
  },
  {
    id: "q6",
    intitule: "Le logement est-il bien sécurisé (portes et fenêtres fermées) après votre passage ?",
    type: "oui-non",
    obligatoire: true
  }
];

// Questions par défaut pour la checklist VOYAGEUR
const DEFAULT_QUESTIONS_VOYAGEUR: QuestionModele[] = [
  {
    id: "q1",
    intitule: "Tous vos effets personnels ont été récupérés",
    type: "oui-non",
    obligatoire: true
  },
  {
    id: "q2",
    intitule: "Les poubelles ont été vidées et le tri respecté",
    type: "oui-non",
    obligatoire: true
  },
  {
    id: "q3",
    intitule: "Les radiateurs, les lumières et appareils inutiles sont éteints",
    type: "oui-non",
    obligatoire: true
  },
  {
    id: "q4",
    intitule: "Avez-vous constaté une anomalie ou une dégradation ? Souhaitez-vous ajouter un commentaire ?",
    type: "ouverte",
    obligatoire: false
  },
  {
    id: "q5",
    intitule: "Les clés ont été déposées à l'endroit prévu",
    type: "oui-non",
    photoObligatoire: true,
    obligatoire: true
  },
  {
    id: "q6",
    intitule: "Le logement est bien fermé à clé",
    type: "oui-non",
    obligatoire: true
  }
];

export function CustomModeleBuilder({
  open,
  onOpenChange,
  onSave,
  onBack,
  parcoursType: initialParcoursType,
  editingModele,
  isFullScreenMode = false,
}: CustomModeleBuilderProps) {
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
  
  // Questions checklist state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [customQuestions, setCustomQuestions] = useState<QuestionModele[]>([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionModele | undefined>();

  // Pré-remplir les données si on édite un modèle existant
  useEffect(() => {
    if (editingModele && open) {
      setModeleName(editingModele.nom);
      setModeleType(editingModele.type);
      setEtatLieuxMoment(editingModele.etatLieuxMoment || "arrivee-sortie");
      
      // Reconstituer selectedPieces avec les tâches sélectionnées
      const piecesMap = new Map<string, string[]>();
      const customPiecesArray: string[] = [];
      const customTasksMap = new Map<string, TacheModele[]>();
      
      const defaultPieces = editingModele.type === "menage" ? PIECES_MENAGE : PIECES_VOYAGEUR;
      const defaultTasks = editingModele.type === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;
      
      editingModele.pieces.forEach((piece: PieceModele) => {
        piecesMap.set(piece.nom, piece.tachesSelectionnees);
        
        // Identifier les pièces personnalisées (qui ne sont pas dans les pièces par défaut)
        if (!defaultPieces.includes(piece.nom)) {
          customPiecesArray.push(piece.nom);
        }
        
        // Identifier les tâches personnalisées pour cette pièce
        const defaultTasksForPiece = defaultTasks[piece.nom] || [];
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
      const defaultQuestions = editingModele.type === "menage" 
        ? DEFAULT_QUESTIONS_MENAGE 
        : DEFAULT_QUESTIONS_VOYAGEUR;
      
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
    const defaultPieces = activeParcoursType === "menage" ? PIECES_MENAGE : PIECES_VOYAGEUR;
    return [...defaultPieces, ...customPieces];
  };

  const getAllAvailableQuestions = (): QuestionModele[] => {
    const defaultQuestions = activeParcoursType === "menage" 
      ? DEFAULT_QUESTIONS_MENAGE 
      : DEFAULT_QUESTIONS_VOYAGEUR;
    return defaultQuestions;
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
      toast({
        title: "Erreur",
        description: "Le nom de la pièce est obligatoire",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si la pièce existe déjà
    const allPieces = getAllPieces();
    if (allPieces.includes(newPieceName.trim())) {
      toast({
        title: "Erreur",
        description: "Cette pièce existe déjà",
        variant: "destructive",
      });
      return;
    }

    setCustomPieces([...customPieces, newPieceName.trim()]);
    
    // Sélectionner automatiquement la nouvelle pièce
    const newSelectedPieces = new Map(selectedPieces);
    newSelectedPieces.set(newPieceName.trim(), []);
    setSelectedPieces(newSelectedPieces);

    toast({
      title: "Pièce ajoutée",
      description: `"${newPieceName.trim()}" a été ajoutée avec succès`,
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
      title: "Pièce supprimée",
      description: `"${piece}" a été supprimée`,
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
    
    toast({
      title: "Tâche créée",
      description: `"${task.titre}" a été ajoutée à ${currentPiece}`,
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

    toast({
      title: "Tâche supprimée",
      description: "La tâche personnalisée a été supprimée",
    });
  };

  const getAllTasksForPiece = (piece: string): TacheModele[] => {
    const tasksSource = activeParcoursType === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;
    let defaultTasks = tasksSource[piece] || [];
    
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
      // It's a default task - store the edited version - KEEP ORIGINAL ID
      const newEditedTasks = new Map(editedDefaultTasks);
      const pieceEdited = newEditedTasks.get(piece) || new Map();
      pieceEdited.set(originalTask.id, { ...updatedTask, id: originalTask.id });
      newEditedTasks.set(piece, pieceEdited);
      setEditedDefaultTasks(newEditedTasks);
    }

    setEditTaskDialogOpen(false);
    setEditingTask(null);
    
    toast({
      title: "Tâche modifiée",
      description: `"${updatedTask.titre}" a été mise à jour`,
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
    toast({
      title: "Question supprimée",
      description: "La question a été retirée de la checklist",
    });
  };

  const handleDupliquerQuestion = (question: QuestionModele) => {
    const newQuestion: QuestionModele = {
      ...question,
      id: `q-${Date.now()}`,
      intitule: `${question.intitule} (copie)`
    };
    setCustomQuestions([...customQuestions, newQuestion]);
    toast({
      title: "Question dupliquée",
      description: "La question a été dupliquée avec succès",
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
        title: "Question modifiée",
        description: "La question a été mise à jour",
      });
    } else {
      // Ajouter
      const newQuestion: QuestionModele = {
        ...questionData,
        id: `q-${Date.now()}`
      };
      setCustomQuestions([...customQuestions, newQuestion]);
      toast({
        title: "Question ajoutée",
        description: "La question a été ajoutée à la checklist",
      });
    }
  };

  const handleSave = () => {
    if (!modeleName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre modèle",
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
    
    toast({
      title: editingModele ? "Modèle modifié" : "Modèle créé",
      description: editingModele 
        ? `Le modèle "${modeleName}" a été modifié avec succès`
        : `Le modèle "${modeleName}" a été créé avec succès`,
    });
  };

  const updatedAt = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto" : "max-w-4xl max-h-[90vh] overflow-y-auto"}
          hideCloseButton={isFullScreenMode}
        >
          <DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-8 w-8"
              onClick={() => {
                if (isFullScreenMode) {
                  window.location.reload();
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
                className="absolute right-4 top-4 h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className={isFullScreenMode ? "text-center pl-10" : "text-center px-12"}>
              <DialogTitle>
                {editingModele ? "Modifier" : "Créer"} son propre modèle de parcours {initialParcoursType === "menage" ? "ménage" : "voyageur"}
              </DialogTitle>
              <DialogDescription className="flex items-center justify-center gap-2 text-xs mt-1">
                <Calendar className="h-3 w-3" />
                Dernière mise à jour : {updatedAt}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configuration de base */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuration du modèle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du modèle *</Label>
                  <Input
                    placeholder="Ex: Ménage complet appartement T3"
                    value={modeleName}
                    onChange={(e) => setModeleName(e.target.value)}
                  />
                </div>

                {!initialParcoursType && (
                  <div className="space-y-2">
                    <Label>Type de parcours *</Label>
                    <Tabs value={modeleType} onValueChange={(v) => {
                      const newType = v as "menage" | "voyageur";
                      setModeleType(newType);
                      // Reset selected questions when type changes
                      setSelectedQuestions(new Set());
                      setCustomQuestions([]);
                    }}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="menage" className="gap-2">
                          🧹 Ménage
                        </TabsTrigger>
                        <TabsTrigger value="voyageur" className="gap-2">
                          ✈️ Voyageur
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>État des lieux</Label>
                  <Tabs value={etatLieuxMoment} onValueChange={(v) => setEtatLieuxMoment(v as "sortie" | "arrivee-sortie")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sortie" className="gap-2">
                        📷 À la sortie uniquement
                      </TabsTrigger>
                      <TabsTrigger value="arrivee-sortie" className="gap-2">
                        📷 À l'arrivée et à la sortie
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">
                    Notre IA utilise uniquement les photos de sortie pour détecter les différences avec l'état initial.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sélection des pièces et tâches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pièces et tâches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 Pour chaque pièce sélectionnée, choisissez les tâches à effectuer. Vous pouvez également ajouter vos propres pièces et tâches personnalisées.
                  </p>
                </div>
                {getAllPieces().map((piece) => (
                  <div key={piece} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`piece-${piece}`}
                          checked={selectedPieces.has(piece)}
                          onCheckedChange={() => handleTogglePiece(piece)}
                        />
                        <Label
                          htmlFor={`piece-${piece}`}
                          className="text-base font-semibold cursor-pointer"
                        >
                          {piece}
                        </Label>
                        {selectedPieces.has(piece) && (
                          <Badge variant="secondary">
                            {selectedPieces.get(piece)?.length || 0}
                          </Badge>
                        )}
                        {customPieces.includes(piece) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustomPiece(piece)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {selectedPieces.has(piece) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPiece(piece);
                            setNewTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une tâche
                        </Button>
                      )}
                    </div>

                    {selectedPieces.has(piece) && (
                      <div className="ml-6 space-y-2">
                        {getAllTasksForPiece(piece).map((tache) => {
                          const isCustomTask = customTasks.get(piece)?.some(t => t.id === tache.id);
                          return (
                            <div key={tache.id} className="flex items-start space-x-2 p-2 hover:bg-accent/50 rounded group">
                              <Checkbox
                                id={`task-${piece}-${tache.id}`}
                                checked={selectedPieces.get(piece)?.includes(tache.id)}
                                onCheckedChange={() => handleToggleTask(piece, tache.id)}
                              />
                              <Label
                                htmlFor={`task-${piece}-${tache.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{tache.emoji}</span>
                                  <span className="font-medium">{tache.titre}</span>
                                  {isCustomTask && (
                                    <Badge variant="outline" className="text-xs">Personnalisée</Badge>
                                  )}
                                  {tache.photoObligatoire && (
                                    <Badge variant="secondary" className="text-xs">
                                      📷 Photo requise
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {tache.description}
                                </p>
                              </Label>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleEditTask(piece, tache)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {isCustomTask && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteCustomTask(piece, tache.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setNewPieceDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une pièce personnalisée
                </Button>
              </CardContent>
            </Card>

            {/* Check-list avant le départ */}
            <Card className="p-4 sm:p-6">
              <CardHeader className="px-0 pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg">Check-list avant le départ</CardTitle>
                    <Badge variant="secondary">
                      {getSelectedQuestionsData().length}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAjouterQuestion}
                    className="w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-0">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 Sélectionnez les questions que le voyageur devra valider avant de quitter le logement.
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Questions par défaut */}
                  {getAllAvailableQuestions().map((question) => (
                    <div 
                      key={question.id} 
                      className="flex items-start gap-2 p-3 border rounded-lg"
                    >
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={() => handleToggleQuestion(question.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{question.intitule}</div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {question.photoObligatoire && (
                            <Badge variant="secondary" className="text-xs">📷 Photo</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.type === "oui-non" ? "Oui/Non" : "💬 Ouverte"}
                          </Badge>
                        </div>
                      </div>
                      {selectedQuestions.has(question.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleModifierQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {/* Questions personnalisées */}
                  {customQuestions.map((question) => (
                    <div 
                      key={question.id} 
                      className="flex items-start gap-2 p-3 border rounded-lg bg-accent/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">Personnalisée</Badge>
                          <div className="font-medium text-sm">{question.intitule}</div>
                        </div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {question.photoObligatoire && (
                            <Badge variant="secondary" className="text-xs">📷 Photo</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.type === "oui-non" ? "Oui/Non" : "💬 Ouverte"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleModifierQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSupprimerQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingModele ? "Enregistrer les modifications" : "Créer le modèle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier une question */}
      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        question={currentQuestion}
        onSave={handleSauvegarderQuestion}
      />

      {/* Dialog pour ajouter une tâche custom */}
      <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une tâche personnalisée</DialogTitle>
            <DialogDescription>
              Pour la pièce : {currentPiece}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Emoji (optionnel)</Label>
              <Input
                placeholder="🧹"
                value={newTask.emoji}
                onChange={(e) => setNewTask({ ...newTask, emoji: e.target.value })}
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Titre de la tâche *</Label>
              <Input
                placeholder="Ex: Vérifier le chauffage"
                value={newTask.titre}
                onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Ex: S'assurer que le chauffage fonctionne"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
              <Label htmlFor="photo-required" className="cursor-pointer">
                Photo obligatoire
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCustomTask} disabled={!newTask.titre}>
              Ajouter
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
      />

      {/* Dialog pour ajouter une pièce personnalisée */}
      <Dialog open={newPieceDialogOpen} onOpenChange={setNewPieceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une pièce personnalisée</DialogTitle>
            <DialogDescription>
              Ajoutez une pièce qui n'est pas dans la liste prédéfinie
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="piece-name">Nom de la pièce *</Label>
              <Input
                id="piece-name"
                value={newPieceName}
                onChange={(e) => setNewPieceName(e.target.value)}
                placeholder="Ex: Buanderie, Terrasse, Cave..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewPieceDialogOpen(false);
              setNewPieceName("");
            }}>
              Annuler
            </Button>
            <Button onClick={handleAddCustomPiece} disabled={!newPieceName.trim()}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
