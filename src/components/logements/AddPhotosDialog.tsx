import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Upload, X, ImagePlus, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PieceQuantity {
  nom: string;
  quantite: number;
  id?: string; // ID unique pour éviter la duplication des photos
}

interface AddPhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  pieces: PieceQuantity[];
  parcoursType: "menage" | "voyageur";
  onSave: (photos: Record<string, string[]>) => void;
  onBack: () => void;
  isFullScreenMode?: boolean;
  initialPhotos?: Record<string, string[]>; // Photos pré-remplies (ex: depuis Airbnb)
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
  "À trier": "📂", // Photos non classées - à redistribuer par l'utilisateur
};

export function AddPhotosDialog({
  open,
  onOpenChange,
  logementNom,
  pieces,
  parcoursType,
  onSave,
  onBack,
  isFullScreenMode = false,
  initialPhotos = {},
}: AddPhotosDialogProps) {
  const { t } = useTranslation();
  const [piecesPhotos, setPiecesPhotos] = useState<Record<string, string[]>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // État pour le drag and drop
  const [draggedPhoto, setDraggedPhoto] = useState<{ pieceKey: string; photoIndex: number; photoUrl: string } | null>(null);
  const [dragOverPieceKey, setDragOverPieceKey] = useState<string | null>(null);

  // Refs pour le touch drag and drop
  const pieceRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const touchDragRef = useRef<{ startX: number; startY: number; isDragging: boolean }>({ startX: 0, startY: 0, isDragging: false });
  const floatingImageRef = useRef<HTMLDivElement | null>(null);

  // Fonction pour déplacer une photo (partagée entre drag et touch)
  const movePhoto = useCallback((sourcePieceKey: string, photoIndex: number, targetPieceKey: string) => {
    if (sourcePieceKey === targetPieceKey) return;

    setPiecesPhotos((prev) => {
      const newPhotos = { ...prev };
      const sourcePhotos = [...(prev[sourcePieceKey] || [])];
      const targetPhotos = [...(prev[targetPieceKey] || [])];

      const [movedPhoto] = sourcePhotos.splice(photoIndex, 1);
      targetPhotos.push(movedPhoto);

      newPhotos[sourcePieceKey] = sourcePhotos;
      newPhotos[targetPieceKey] = targetPhotos;

      return newPhotos;
    });
  }, []);

  // Trouver la pièce sous un point (pour touch)
  const findPieceAtPoint = useCallback((x: number, y: number): string | null => {
    for (const [pieceKey, element] of pieceRefs.current.entries()) {
      const rect = element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return pieceKey;
      }
    }
    return null;
  }, []);

  // Handler pour le début du drag (desktop)
  const handleDragStart = (e: React.DragEvent, pieceKey: string, photoIndex: number, photoUrl: string) => {
    setDraggedPhoto({ pieceKey, photoIndex, photoUrl });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handler pour le drag over sur une pièce (desktop)
  const handleDragOver = (e: React.DragEvent, pieceKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedPhoto && draggedPhoto.pieceKey !== pieceKey) {
      setDragOverPieceKey(pieceKey);
    }
  };

  // Handler pour quitter la zone de drop (desktop)
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPieceKey(null);
  };

  // Handler pour le drop (desktop)
  const handleDrop = (e: React.DragEvent, targetPieceKey: string) => {
    e.preventDefault();
    setDragOverPieceKey(null);

    if (!draggedPhoto || draggedPhoto.pieceKey === targetPieceKey) {
      setDraggedPhoto(null);
      return;
    }

    movePhoto(draggedPhoto.pieceKey, draggedPhoto.photoIndex, targetPieceKey);
    setDraggedPhoto(null);
  };

  // Handler pour la fin du drag (desktop)
  const handleDragEnd = () => {
    setDraggedPhoto(null);
    setDragOverPieceKey(null);
  };

  // === TOUCH HANDLERS ===
  const handleTouchStart = (e: React.TouchEvent, pieceKey: string, photoIndex: number, photoUrl: string) => {
    const touch = e.touches[0];
    touchDragRef.current = { startX: touch.clientX, startY: touch.clientY, isDragging: false };
    setDraggedPhoto({ pieceKey, photoIndex, photoUrl });
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggedPhoto) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchDragRef.current.startX);
    const deltaY = Math.abs(touch.clientY - touchDragRef.current.startY);

    // Activer le drag après un petit mouvement
    if (deltaX > 10 || deltaY > 10) {
      touchDragRef.current.isDragging = true;
      e.preventDefault(); // Empêcher le scroll

      // Créer ou mettre à jour l'image flottante
      if (!floatingImageRef.current) {
        const floatingDiv = document.createElement('div');
        floatingDiv.style.cssText = `
          position: fixed;
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.9;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transform: translate(-50%, -50%);
        `;
        const img = document.createElement('img');
        img.src = draggedPhoto.photoUrl;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        floatingDiv.appendChild(img);
        document.body.appendChild(floatingDiv);
        floatingImageRef.current = floatingDiv;
      }

      floatingImageRef.current.style.left = `${touch.clientX}px`;
      floatingImageRef.current.style.top = `${touch.clientY}px`;

      // Trouver la pièce sous le doigt
      const pieceUnderTouch = findPieceAtPoint(touch.clientX, touch.clientY);
      if (pieceUnderTouch && pieceUnderTouch !== draggedPhoto.pieceKey) {
        setDragOverPieceKey(pieceUnderTouch);
      } else {
        setDragOverPieceKey(null);
      }
    }
  }, [draggedPhoto, findPieceAtPoint]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Nettoyer l'image flottante
    if (floatingImageRef.current) {
      floatingImageRef.current.remove();
      floatingImageRef.current = null;
    }

    if (!draggedPhoto || !touchDragRef.current.isDragging) {
      setDraggedPhoto(null);
      setDragOverPieceKey(null);
      touchDragRef.current = { startX: 0, startY: 0, isDragging: false };
      return;
    }

    const touch = e.changedTouches[0];
    const targetPieceKey = findPieceAtPoint(touch.clientX, touch.clientY);

    if (targetPieceKey && targetPieceKey !== draggedPhoto.pieceKey) {
      movePhoto(draggedPhoto.pieceKey, draggedPhoto.photoIndex, targetPieceKey);
    }

    setDraggedPhoto(null);
    setDragOverPieceKey(null);
    touchDragRef.current = { startX: 0, startY: 0, isDragging: false };
  }, [draggedPhoto, findPieceAtPoint, movePhoto]);

  // Créer une liste de pièces individuelles basée sur les quantités
  // Par exemple: si "Chambre" a quantite=2, on crée ["Chambre 1", "Chambre 2"]
  // IMPORTANT: Utiliser piece.id comme clé si disponible (pour matcher avec le backend)
  const individualPieces = pieces.flatMap((piece) => {
    if (piece.quantite === 1) {
      // Utiliser piece.id si disponible, sinon piece.nom
      const key = piece.id || piece.nom;
      return [{ nom: piece.nom, displayName: piece.nom, key }];
    }
    return Array.from({ length: piece.quantite }, (_, index) => ({
      nom: piece.nom,
      displayName: `${piece.nom} ${index + 1}`,
      // Pour les pièces multiples, on utilise le nom_N car le backend attend ça
      key: `${piece.nom}_${index + 1}`,
    }));
  });

  // Initialiser avec les photos pré-remplies (ex: depuis Airbnb) UNIQUEMENT quand le dialog s'ouvre pour la première fois
  useEffect(() => {
    if (open && !isInitialized) {
      // Distribuer intelligemment les photos Airbnb aux pièces individuelles
      const distributedPhotos: Record<string, string[]> = {};

      // Pour chaque pièce avec quantité
      pieces.forEach((piece) => {
        const photosForThisPiece = initialPhotos[piece.nom] || initialPhotos[piece.id || ''] || [];

        if (piece.quantite === 1) {
          // Une seule pièce : utiliser piece.id si disponible, sinon piece.nom
          const key = piece.id || piece.nom;
          distributedPhotos[key] = photosForThisPiece;
        } else {
          // Plusieurs pièces : distribuer les photos équitablement
          const photosPerRoom = Math.ceil(photosForThisPiece.length / piece.quantite);

          for (let i = 0; i < piece.quantite; i++) {
            const key = `${piece.nom}_${i + 1}`;
            const startIndex = i * photosPerRoom;
            const endIndex = Math.min(startIndex + photosPerRoom, photosForThisPiece.length);
            distributedPhotos[key] = photosForThisPiece.slice(startIndex, endIndex);
          }
        }
      });

      console.log("📷 Distribution des photos:", {
        initialPhotos,
        distributedPhotos,
        pieces: pieces.map(p => ({ nom: p.nom, quantite: p.quantite, id: p.id }))
      });

      setPiecesPhotos(distributedPhotos);
      setIsInitialized(true);
    }

    // Reset isInitialized quand le dialog se ferme
    if (!open) {
      setIsInitialized(false);
    }
  }, [open, isInitialized]);

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
    // NE PAS regrouper les photos - le backend s'attend à recevoir les clés individuelles
    // Par exemple: "Chambre_1", "Chambre_2" (pas "Chambre")
    console.log("💾 Sauvegarde des photos:", {
      piecesPhotos, // Photos avec clés individuelles (ex: "Chambre_1", "Chambre_2")
    });

    onSave(piecesPhotos); // Envoyer directement les photos avec les clés individuelles
  };

  const totalPhotos = Object.values(piecesPhotos).reduce(
    (sum, photos) => sum + photos.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-hidden px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2 flex flex-col" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden"}
        hideCloseButton={true}
      >
        <DialogHeader className={isFullScreenMode ? "pb-0 shrink-0" : "shrink-0"}>
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
              Étape 4/6 - {t('photos.addPhotosFor', { logementNom })}
            </DialogTitle>
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-base sm:text-lg shrink-0">💡</span>
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                  Ajoutez une ou plusieurs photos, prises depuis différents angles, de chaque pièce.
                  <br /><br />
                  Elles servent de référence pour l'analyse IA (propreté, objets manquants/déplacés, dégradations) et seront aussi les photos demandées {parcoursType === "menage" ? "à l'agent de ménage" : "au voyageur"} lors du check-out.
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className={isFullScreenMode ? "space-y-2 sm:space-y-3 overflow-y-auto flex-1 px-1 min-h-0" : "space-y-3 sm:space-y-4 overflow-y-auto flex-1 px-1 min-h-0"}>
          {individualPieces.map((piece) => {
            const photosForPiece = piecesPhotos[piece.key] || [];
            const emoji = PIECE_EMOJIS[piece.nom] || "📍";

            const isDragOver = dragOverPieceKey === piece.key;
            const isBeingDraggedFrom = draggedPhoto?.pieceKey === piece.key;

            return (
              <Card
                key={piece.key}
                ref={(el) => {
                  if (el) pieceRefs.current.set(piece.key, el);
                  else pieceRefs.current.delete(piece.key);
                }}
                className={cn(
                  "p-2 sm:p-3 transition-all duration-200",
                  isDragOver && "ring-2 ring-primary bg-primary/5",
                  isBeingDraggedFrom && "opacity-75"
                )}
                onDragOver={(e) => handleDragOver(e, piece.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, piece.key)}
              >
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg sm:text-xl shrink-0">{emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">
                        {piece.displayName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {photosForPiece.length} {t('airbnb.photo', { count: photosForPiece.length })}
                      </p>
                    </div>
                    {isDragOver && (
                      <span className="text-xs text-primary font-medium animate-pulse">
                        Déposer ici
                      </span>
                    )}
                  </div>
                  <input
                    id={`upload-${piece.key}`}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(piece.key, e.target.files)}
                  />

                  {photosForPiece.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                        {photosForPiece.map((photo, index) => {
                          const isBeingDragged = draggedPhoto?.pieceKey === piece.key && draggedPhoto?.photoIndex === index;

                          return (
                            <div
                              key={index}
                              draggable
                              onDragStart={(e) => handleDragStart(e, piece.key, index, photo)}
                              onDragEnd={handleDragEnd}
                              onTouchStart={(e) => handleTouchStart(e, piece.key, index, photo)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              className={cn(
                                "relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted cursor-grab active:cursor-grabbing transition-all duration-200 touch-none",
                                isBeingDragged && "opacity-50 scale-95 ring-2 ring-primary"
                              )}
                            >
                              {/* Indicateur de drag */}
                              <div className="absolute top-1 left-1 p-1 rounded-full bg-background/80 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                                <GripVertical className="h-3 w-3" />
                              </div>
                              <img
                                src={photo}
                                alt={`${piece.displayName} ${index + 1}`}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemovePhoto(piece.key, index);
                                }}
                                style={{ touchAction: 'none' }}
                                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                              >
                                <X className="h-3 w-3" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Bouton pour ajouter plus de photos */}
                      <label
                        htmlFor={`upload-${piece.key}`}
                        className={cn(
                          "flex items-center justify-center gap-1.5 p-1.5 sm:p-2 border border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-colors",
                          isDragOver && "border-primary bg-primary/10"
                        )}
                      >
                        <ImagePlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {t('photos.addMore')}
                        </p>
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor={`upload-${piece.key}`}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 sm:p-4 border border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-colors",
                        isDragOver && "border-primary bg-primary/10"
                      )}
                    >
                      {isDragOver ? (
                        <>
                          <span className="text-xl mb-1">📥</span>
                          <p className="text-xs text-primary text-center font-medium">
                            Déposer la photo ici
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground text-center">
                            {t('photos.clickToAdd')}
                          </p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col items-stretch gap-2 pt-3 border-t shrink-0 mt-3">
          <div
            className="h-9 px-4 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium w-full cursor-pointer"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBack();
            }}
            style={{ touchAction: 'none' }}
          >
            {t('logement.back')}
          </div>
          <div
            className="h-9 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium w-full cursor-pointer"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            style={{ touchAction: 'none' }}
          >
            Continuer
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
