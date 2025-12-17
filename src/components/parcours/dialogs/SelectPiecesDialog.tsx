import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  "À trier": "📂", // Photos non classées - à redistribuer par l'utilisateur
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
  const { t } = useTranslation();

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
      // Pour les modèles personnalisés, compter les tâches sélectionnées dans le modèle
      const pieceData = selectedModele.pieces.find(p => p.nom === pieceName);
      console.log(`🔍 DEBUG - Pièce: ${pieceName}`);
      console.log(`   - pieceData:`, pieceData);
      console.log(`   - tachesDisponibles:`, pieceData?.tachesDisponibles.length);
      console.log(`   - tachesSelectionnees:`, pieceData?.tachesSelectionnees.length);
      return pieceData ? pieceData.tachesSelectionnees.length : 0;
    }
  };

  const [piecesQuantity, setPiecesQuantity] = useState<PieceQuantity[]>(
    piecesDisponibles.map(nom => ({ nom, quantite: 0 }))
  );

  // Réinitialiser l'état quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setPiecesQuantity(piecesDisponibles.map(nom => ({ nom, quantite: 0 })));
    }
  }, [open, piecesDisponibles]);

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
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
        hideCloseButton
      >
        <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 z-50"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 z-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pl-8 sm:pl-10 pr-8">
            <DialogTitle className={isFullScreenMode ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"}>
              {t('piecesDialog.selectRooms', { logementNom })}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className={isFullScreenMode ? "grid gap-2 overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] px-1" : "grid gap-2 sm:gap-3 overflow-y-auto max-h-[55vh] sm:max-h-[50vh] px-1"}>
          {piecesQuantity.map((piece) => {
            const taskCount = getTaskCountForPiece(piece.nom);
            return (
              <div
                key={piece.nom}
                className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl shrink-0">{PIECE_EMOJIS[piece.nom] || "📦"}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm sm:text-base truncate">{piece.nom}</span>
                    {taskCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {taskCount} {t('airbnb.task', { count: taskCount })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => handleDecrement(piece.nom)}
                    disabled={piece.quantite === 0}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                    {piece.quantite}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => handleIncrement(piece.nom)}
                    disabled={piece.quantite >= 10}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalPieces === 0 ? (
                t('piecesDialog.noRoomSelected')
              ) : (
                t('piecesDialog.roomsSelected', { count: totalPieces })
              )}
            </p>
            <Button onClick={handleSave} disabled={totalPieces === 0} className="w-full sm:w-auto">
              {t('piecesDialog.continue')}
            </Button>
          </div>

          {/* Option Airbnb */}
          {onSwitchToAirbnb && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                onClick={onSwitchToAirbnb}
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground justify-start px-0 w-full"
              >
                ← {t('piecesDialog.importFromAirbnb')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
