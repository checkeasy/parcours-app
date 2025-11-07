import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PieceQuantity {
  nom: string;
  quantite: number;
}

interface AddPhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  pieces: PieceQuantity[];
  onSave: (photos: Record<string, string[]>) => void;
  onBack: () => void;
  isFullScreenMode?: boolean;
}

const PIECE_EMOJIS: Record<string, string> = {
  "Salon": "🛋️",
  "Cuisine": "🍳",
  "Chambre": "🛏️",
  "Salle de bain": "🚿",
  "WC": "🚽",
  "Bureau": "💼",
  "Entrée": "🚪",
  "Terrasse": "🌿",
  "Balcon": "🪴",
  "Cave": "📦",
  "Garage": "🚗",
  "Buanderie": "🧺",
};

export function AddPhotosDialog({
  open,
  onOpenChange,
  logementNom,
  pieces,
  onSave,
  onBack,
  isFullScreenMode = false,
}: AddPhotosDialogProps) {
  const [piecesPhotos, setPiecesPhotos] = useState<Record<string, string[]>>({});

  // Créer une liste de pièces individuelles basée sur les quantités
  // Par exemple: si "Chambre" a quantite=2, on crée ["Chambre 1", "Chambre 2"]
  const individualPieces = pieces.flatMap((piece) => {
    if (piece.quantite === 1) {
      return [{ nom: piece.nom, displayName: piece.nom, key: piece.nom }];
    }
    return Array.from({ length: piece.quantite }, (_, index) => ({
      nom: piece.nom,
      displayName: `${piece.nom} ${index + 1}`,
      key: `${piece.nom}_${index + 1}`,
    }));
  });

  // Réinitialiser l'état quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setPiecesPhotos({});
    }
  }, [open]);

  const handleFileUpload = (pieceKey: string, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const readers = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setPiecesPhotos((prev) => ({
        ...prev,
        [pieceKey]: [...(prev[pieceKey] || []), ...results],
      }));
    });
  };

  const handleRemovePhoto = (pieceKey: string, photoIndex: number) => {
    setPiecesPhotos((prev) => ({
      ...prev,
      [pieceKey]: prev[pieceKey].filter((_, index) => index !== photoIndex),
    }));
  };

  const handleSave = () => {
    onSave(piecesPhotos);
  };

  const totalPhotos = Object.values(piecesPhotos).reduce(
    (sum, photos) => sum + photos.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto p-3 sm:p-4 md:p-6 gap-1 sm:gap-2" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
        hideCloseButton={isFullScreenMode}
      >
        <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 z-50"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
              Étape 5/5 - Ajoutez des photos pour {logementNom}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Optionnel · {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""} ajoutée{totalPhotos !== 1 ? "s" : ""}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className={isFullScreenMode ? "space-y-2 sm:space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] px-1" : "space-y-3 sm:space-y-4 overflow-y-auto max-h-[55vh] sm:max-h-[50vh] px-1"}>
          {individualPieces.map((piece) => {
            const photosForPiece = piecesPhotos[piece.key] || [];
            const emoji = PIECE_EMOJIS[piece.nom] || "📍";

            return (
              <Card key={piece.key} className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xl sm:text-2xl shrink-0">{emoji}</span>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {piece.displayName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {photosForPiece.length} photo
                          {photosForPiece.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <label htmlFor={`upload-${piece.key}`} className="shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1 sm:gap-2 text-xs sm:text-sm"
                        onClick={() =>
                          document.getElementById(`upload-${piece.key}`)?.click()
                        }
                      >
                        <ImagePlus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Ajouter</span>
                      </Button>
                      <input
                        id={`upload-${piece.key}`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(piece.key, e.target.files)}
                      />
                    </label>
                  </div>

                  {photosForPiece.length > 0 && (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                      {photosForPiece.map((photo, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                        >
                          <img
                            src={photo}
                            alt={`${piece.displayName} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemovePhoto(piece.key, index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photosForPiece.length === 0 && (
                    <label
                      htmlFor={`upload-${piece.key}`}
                      className="flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-colors"
                    >
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        Cliquez pour ajouter des photos
                      </p>
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Précédent
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">Terminer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
