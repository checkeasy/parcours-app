import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ArrowLeft, X } from "lucide-react";
import { PIECES_CHECK_EASY, ParcoursModele, TacheModele } from "@/types/modele";
import { TACHES_MENAGE, TACHES_VOYAGEUR } from "@/components/parcours/modele/CustomModeleBuilder";

export interface PieceQuantity {
  nom: string;
  quantite: number;
}

interface SelectPiecesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  type: "menage" | "voyageur";
  selectedModele: "menage" | "voyageur" | ParcoursModele;
  onSave: (pieces: PieceQuantity[]) => void;
  onBack?: () => void;
  onSwitchToAirbnb?: () => void;
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

export default function SelectPiecesDialog({
  open,
  onOpenChange,
  logementNom,
  type,
  selectedModele,
  onSave,
  onBack,
  onSwitchToAirbnb,
  isFullScreenMode = false,
}: SelectPiecesDialogProps) {
  // Déterminer les pièces disponibles selon le modèle sélectionné
  const piecesDisponibles = useMemo(() => {
    if (typeof selectedModele === "string") {
      // Modèle Check Easy (menage ou voyageur)
      return PIECES_CHECK_EASY[selectedModele];
    } else {
      // Modèle personnalisé
      return selectedModele.pieces.map(p => p.nom);
    }
  }, [selectedModele]);

  // Fonction pour obtenir le nombre de tâches pour une pièce
  const getTaskCountForPiece = (pieceName: string): number => {
    if (typeof selectedModele === "string") {
      // Pour les modèles prédéfinis, calculer le nombre réel de tâches
      const tasksSource = selectedModele === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;
      const tasks = tasksSource[pieceName] || [];
      return tasks.length;
    } else {
      // Pour les modèles personnalisés, compter les tâches réellement définies
      const pieceData = selectedModele.pieces.find(p => p.nom === pieceName);
      return pieceData ? pieceData.tachesDisponibles.length : 0;
    }
  };

  const [piecesQuantity, setPiecesQuantity] = useState<PieceQuantity[]>(
    piecesDisponibles.map(nom => ({ nom, quantite: 0 }))
  );

  const handleIncrement = (nom: string) => {
    setPiecesQuantity(prev =>
      prev.map(p => p.nom === nom ? { ...p, quantite: Math.min(p.quantite + 1, 10) } : p)
    );
  };

  const handleDecrement = (nom: string) => {
    setPiecesQuantity(prev =>
      prev.map(p => p.nom === nom ? { ...p, quantite: Math.max(p.quantite - 1, 0) } : p)
    );
  };

  const totalPieces = piecesQuantity.reduce((sum, p) => sum + p.quantite, 0);

  const handleSave = () => {
    const selectedPieces = piecesQuantity.filter(p => p.quantite > 0);
    onSave(selectedPieces);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto" : "sm:max-w-[600px] w-[95vw] max-h-[85vh]"}>
        <DialogHeader>
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pl-10">
            <DialogTitle className="text-xl sm:text-2xl">
              Étape 4/5 - Sélectionnez les pièces du logement
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Indiquez le nombre de chaque type de pièce pour <span className="font-semibold">{logementNom}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid gap-3 overflow-y-auto max-h-[50vh] px-1">
          {piecesQuantity.map((piece) => {
            const taskCount = getTaskCountForPiece(piece.nom);
            return (
              <div
                key={piece.nom}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{PIECE_EMOJIS[piece.nom] || "📦"}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{piece.nom}</span>
                    {taskCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {taskCount} tâche{taskCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDecrement(piece.nom)}
                    disabled={piece.quantite === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-8 text-center font-semibold">
                    {piece.quantite}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleIncrement(piece.nom)}
                    disabled={piece.quantite >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalPieces === 0 ? (
                "Aucune pièce sélectionnée"
              ) : (
                `${totalPieces} pièce${totalPieces > 1 ? 's' : ''} sélectionnée${totalPieces > 1 ? 's' : ''}`
              )}
            </p>
            <Button onClick={handleSave} disabled={totalPieces === 0}>
              Continuer
            </Button>
          </div>

          {/* Option Airbnb */}
          {onSwitchToAirbnb && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                onClick={onSwitchToAirbnb}
                className="text-sm text-muted-foreground hover:text-foreground justify-start px-0 w-full"
              >
                ← Importer depuis Airbnb
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
