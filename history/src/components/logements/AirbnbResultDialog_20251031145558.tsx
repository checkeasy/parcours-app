import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, List, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PieceData {
  nom: string;
  quantite: number;
  emoji: string;
  photos: string[];
}

interface AirbnbResultDialogProps {
  open: boolean;
  logementNom: string;
  pieces: PieceData[];
  totalPhotos: number;
  onConfirm: (pieces: PieceData[]) => void;
  onBack: () => void;
}

export function AirbnbResultDialog({
  open,
  logementNom,
  pieces,
  totalPhotos,
  onConfirm,
  onBack,
}: AirbnbResultDialogProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const activePiecesCount = pieces.length;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">Classification des pièces</DialogTitle>
              <DialogDescription>
                Nous avons analysé votre propriété et identifié {activePiecesCount} types de pièces avec {totalPhotos} photos
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              Modifier
            </Button>
          </div>
        </DialogHeader>

        {/* Statistiques */}
        <div className="flex gap-4 py-4 border-y">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Photos sélectionnées</p>
              <p className="text-lg font-semibold">{totalPhotos}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pièces actives</p>
              <p className="text-lg font-semibold">{activePiecesCount}</p>
            </div>
          </div>

          {/* Toggle vue grille/liste */}
          <div className="ml-auto flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Liste des pièces */}
        <div className="flex-1 overflow-y-auto px-1">
          <div className={cn(
            "gap-4",
            viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"
          )}>
            {pieces.map((piece, index) => (
              <Card key={index} className="border-2 border-success/50 bg-success/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{piece.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{piece.nom}</h3>
                        <p className="text-sm text-muted-foreground">
                          {piece.photos.length} photo{piece.photos.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-success hover:bg-success/90">
                      Activé
                    </Badge>
                  </div>

                  {/* Grille de photos */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {piece.photos.slice(0, 6).map((photo, photoIndex) => (
                      <div
                        key={photoIndex}
                        className="aspect-square rounded-md overflow-hidden bg-muted"
                      >
                        <img
                          src={photo}
                          alt={`${piece.nom} ${photoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {piece.photos.length > 6 && (
                      <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          +{piece.photos.length - 6}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer avec bouton terminer */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onConfirm(pieces)} size="lg" className="min-w-[150px]">
            Terminer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
