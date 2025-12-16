import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, ArrowLeft, X } from "lucide-react";
import { PIECES_STANDARDS } from "@/types/modele";

export interface PieceQuantity {
  nom: string;
  quantite: number;
  id?: string;
  isCustom?: boolean; // Pour identifier les pièces personnalisées
}

interface SelectRoomsWithQuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  customPieces?: string[]; // Pièces personnalisées de la conciergerie
  initialRooms?: PieceQuantity[]; // Pièces pré-remplies (ex: depuis Airbnb)
  onSave: (pieces: PieceQuantity[]) => void;
  onBack?: () => void;
  isFullScreenMode?: boolean;
}

const PIECE_EMOJIS: Record<string, string> = {
  "Cuisine": "🍳",
  "Salle de bain (sans toilettes)": "🚿",
  "Salle de bain avec toilettes": "🛁",
  "Toilettes séparés": "🚽",
  "Chambre": "🛏️",
  "Salon / Séjour": "🛋️",
  "Salle à manger": "🍽️",
  "Entrée / Couloir / Escaliers": "🚪",
  "Buanderie / Laverie": "🧺",
  "Espaces extérieurs": "🌳",
  "Garage / Parking": "🚗",
  "Bureau / Pièce de travail": "💼",
};

export default function SelectRoomsWithQuantityDialog({
  open,
  onOpenChange,
  logementNom,
  customPieces = [],
  initialRooms = [],
  onSave,
  onBack,
  isFullScreenMode = false,
}: SelectRoomsWithQuantityDialogProps) {
  const { t } = useTranslation();

  // Combiner les pièces standards et personnalisées
  const allPieces = [...PIECES_STANDARDS, ...customPieces];

  const [piecesQuantity, setPiecesQuantity] = useState<PieceQuantity[]>(
    allPieces.map(nom => ({ 
      nom, 
      quantite: 0,
      isCustom: customPieces.includes(nom)
    }))
  );

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customPieceName, setCustomPieceName] = useState("");

  // Réinitialiser l'état quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      // Si on a des pièces pré-remplies (ex: depuis Airbnb), les utiliser
      if (initialRooms.length > 0) {
        // Créer un Map pour faciliter la recherche
        const initialRoomsMap = new Map(initialRooms.map(r => [r.nom, r.quantite]));

        // Récupérer toutes les pièces uniques (standards + custom + initialRooms)
        const allPieceNames = new Set([
          ...PIECES_STANDARDS,
          ...customPieces,
          ...initialRooms.map(r => r.nom)
        ]);

        setPiecesQuantity(Array.from(allPieceNames).map(nom => ({
          nom,
          quantite: initialRoomsMap.get(nom) || 0,
          isCustom: customPieces.includes(nom) || (!PIECES_STANDARDS.includes(nom))
        })));
      } else {
        // Sinon, initialiser avec des quantités à 0
        const allPieces = [...PIECES_STANDARDS, ...customPieces];
        setPiecesQuantity(allPieces.map(nom => ({
          nom,
          quantite: 0,
          isCustom: customPieces.includes(nom)
        })));
      }

      setShowAddCustom(false);
      setCustomPieceName("");
    }
  }, [open, customPieces, initialRooms]);

  const handleIncrement = (nom: string) => {
    console.log("🔼 handleIncrement appelé pour:", nom);
    setPiecesQuantity(prev => {
      const updated = prev.map(p => p.nom === nom ? { ...p, quantite: Math.min(p.quantite + 1, 10) } : p);
      console.log("📊 Nouvelle quantité:", updated.find(p => p.nom === nom)?.quantite);
      return updated;
    });
  };

  const handleDecrement = (nom: string) => {
    setPiecesQuantity(prev =>
      prev.map(p => p.nom === nom ? { ...p, quantite: Math.max(p.quantite - 1, 0) } : p)
    );
  };

  const handleAddCustomPiece = () => {
    if (!customPieceName.trim()) return;
    
    // Vérifier si la pièce existe déjà
    if (piecesQuantity.some(p => p.nom.toLowerCase() === customPieceName.trim().toLowerCase())) {
      return;
    }

    // Ajouter la nouvelle pièce personnalisée
    setPiecesQuantity(prev => [
      ...prev,
      { nom: customPieceName.trim(), quantite: 1, isCustom: true }
    ]);

    setCustomPieceName("");
    setShowAddCustom(false);
  };

  const totalPieces = piecesQuantity.reduce((sum, p) => sum + p.quantite, 0);

  const handleSave = () => {
    const selectedPieces = piecesQuantity
      .filter(p => p.quantite > 0)
      .map((piece, index) => ({
        ...piece,
        id: piece.id || `piece_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      }));
    onSave(selectedPieces);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
        hideCloseButton
      >
        <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
          {onBack && (
            <div
              className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 z-50 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              style={{ touchAction: 'none' }}
            >
              <ArrowLeft className="h-4 w-4" />
            </div>
          )}
          <div
            className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 z-50 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
            style={{ touchAction: 'none' }}
          >
            <X className="h-4 w-4" />
          </div>
          <div className="pl-8 sm:pl-10 pr-8">
            <DialogTitle className={isFullScreenMode ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"}>
              Étape 3/6 - Sélectionnez les pièces présentes dans {logementNom}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className={isFullScreenMode ? "grid gap-2 overflow-y-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-260px)] px-1" : "grid gap-2 sm:gap-3 overflow-y-auto max-h-[50vh] sm:max-h-[45vh] px-1"}>
          {piecesQuantity.map((piece) => (
            <div
              key={piece.nom}
              className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="text-xl sm:text-2xl shrink-0">
                  {PIECE_EMOJIS[piece.nom] || "📦"}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm sm:text-base truncate">{piece.nom}</span>
                  {piece.isCustom && (
                    <span className="text-xs text-muted-foreground">Pièce personnalisée</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                    piece.quantite === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  onPointerDown={(e) => {
                    if (piece.quantite === 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    handleDecrement(piece.nom);
                  }}
                  style={{ touchAction: 'none' }}
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>

                <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                  {piece.quantite}
                </span>

                <div
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                    piece.quantite >= 10 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  onPointerDown={(e) => {
                    if (piece.quantite >= 10) return;
                    e.preventDefault();
                    e.stopPropagation();
                    handleIncrement(piece.nom);
                  }}
                  style={{ touchAction: 'none' }}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
          ))}

          {/* Formulaire d'ajout de pièce personnalisée */}
          {showAddCustom && (
            <div className="p-3 sm:p-4 border-2 border-dashed rounded-lg bg-accent/20">
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de la pièce personnalisée"
                  value={customPieceName}
                  onChange={(e) => setCustomPieceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomPiece();
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <div
                  className={cn(
                    "h-9 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium",
                    !customPieceName.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  onPointerDown={(e) => {
                    if (!customPieceName.trim()) return;
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddCustomPiece();
                  }}
                  style={{ touchAction: 'none' }}
                >
                  Ajouter
                </div>
                <div
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAddCustom(false);
                  }}
                  style={{ touchAction: 'none' }}
                >
                  <X className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
          {/* Bouton pour ajouter une pièce personnalisée */}
          {!showAddCustom && (
            <div
              className="w-full h-9 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm font-medium"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddCustom(true);
              }}
              style={{ touchAction: 'none' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une pièce personnalisée
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalPieces === 0 ? (
                "Aucune pièce sélectionnée"
              ) : (
                `${totalPieces} pièce${totalPieces > 1 ? 's' : ''} sélectionnée${totalPieces > 1 ? 's' : ''}`
              )}
            </p>
            <div
              className={cn(
                "h-9 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium w-full sm:w-auto",
                totalPieces === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
              onPointerDown={(e) => {
                if (totalPieces === 0) return;
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
              style={{ touchAction: 'none' }}
            >
              Continuer
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

