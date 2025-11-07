import { useState } from "react";
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

  const handleFileUpload = (pieceName: string, files: FileList | null) => {
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
        [pieceName]: [...(prev[pieceName] || []), ...results],
      }));
    });
  };

  const handleRemovePhoto = (pieceName: string, photoIndex: number) => {
    setPiecesPhotos((prev) => ({
      ...prev,
      [pieceName]: prev[pieceName].filter((_, index) => index !== photoIndex),
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
      <DialogContent className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto" : "sm:max-w-[600px] w-[95vw] max-h-[85vh]"}>
        <DialogHeader>
          {!isFullScreenMode && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
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
          <div className="pl-10">
            <DialogTitle className="text-xl sm:text-2xl">
              Étape 5/5 - Ajoutez des photos pour {logementNom}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Optionnel · {totalPhotos} photo{totalPhotos !== 1 ? "s" : ""} ajoutée{totalPhotos !== 1 ? "s" : ""}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[50vh] px-1">
          {pieces.map((piece) => {
            const photosForPiece = piecesPhotos[piece.nom] || [];
            const emoji = PIECE_EMOJIS[piece.nom] || "📍";

            return (
              <Card key={piece.nom} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <h3 className="font-medium">
                          {piece.nom}
                          {piece.quantite > 1 && (
                            <span className="text-muted-foreground ml-2">
                              ×{piece.quantite}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {photosForPiece.length} photo
                          {photosForPiece.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <label htmlFor={`upload-${piece.nom}`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          document.getElementById(`upload-${piece.nom}`)?.click()
                        }
                      >
                        <ImagePlus className="h-4 w-4" />
                        Ajouter
                      </Button>
                      <input
                        id={`upload-${piece.nom}`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(piece.nom, e.target.files)}
                      />
                    </label>
                  </div>

                  {photosForPiece.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {photosForPiece.map((photo, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                        >
                          <img
                            src={photo}
                            alt={`${piece.nom} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemovePhoto(piece.nom, index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photosForPiece.length === 0 && (
                    <label
                      htmlFor={`upload-${piece.nom}`}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        Cliquez pour ajouter des photos
                      </p>
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Précédent
          </Button>
          <Button onClick={handleSave}>Terminer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
