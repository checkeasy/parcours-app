import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertBase64ToUrl, isBase64Image } from "@/utils/imageUpload";

interface Tache {
  id: string;
  emoji: string;
  titre: string;
  description: string;
  photoObligatoire: boolean;
  photoUrl?: string;
}

interface TacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache?: Tache;
  pieceNom: string;
  onSave: (tache: Omit<Tache, "id">) => void;
  isFullScreenMode?: boolean;
}

export function TacheDialog({
  open,
  onOpenChange,
  tache,
  pieceNom,
  onSave,
  isFullScreenMode = false,
}: TacheDialogProps) {
  const [formData, setFormData] = useState({
    emoji: "",
    titre: "",
    description: "",
    photoObligatoire: false
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (tache) {
      setFormData({
        emoji: tache.emoji,
        titre: tache.titre,
        description: tache.description,
        photoObligatoire: tache.photoObligatoire
      });
      setPhotoPreview(tache.photoUrl || null);
      setIsLoadingImage(!!tache.photoUrl);
      setImageLoadError(false);
    } else {
      setFormData({
        emoji: "",
        titre: "",
        description: "",
        photoObligatoire: false
      });
      setPhotoPreview(null);
      setIsLoadingImage(false);
      setImageLoadError(false);
    }
  }, [tache, open]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        // Convert base64 to URL via Bubble.io API
        const result = await convertBase64ToUrl(base64Image);

        if (result.success && result.imgUrl) {
          setPhotoPreview(result.imgUrl);
          toast({
            title: "✅ Photo uploadée",
            description: "La photo de référence a été uploadée avec succès.",
          });
        } else {
          // Fallback to base64 if upload fails
          setPhotoPreview(base64Image);
          toast({
            title: "⚠️ Upload partiel",
            description: "La photo est enregistrée localement. Elle sera uploadée lors de la sauvegarde du modèle.",
            variant: "destructive",
          });
        }

        setIsUploadingPhoto(false);
      };

      reader.onerror = () => {
        toast({
          title: "❌ Erreur",
          description: "Impossible de lire le fichier image.",
          variant: "destructive",
        });
        setIsUploadingPhoto(false);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setIsLoadingImage(false);
    setImageLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (formData.titre.trim()) {
      onSave({
        emoji: formData.emoji || "📋",
        titre: formData.titre,
        description: formData.description,
        photoObligatoire: formData.photoObligatoire,
        photoUrl: photoPreview || undefined
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "max-w-md w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
        hideCloseButton
      >
        <DialogHeader className={isFullScreenMode ? "border-b pb-2 sm:pb-3" : "border-b pb-4"}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className={isFullScreenMode ? "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground" : "flex items-center gap-2 text-sm text-muted-foreground"}>
                <span>{tache ? "Modifier la tâche" : "Nouvelle To Do pour"}</span>
                <span className="font-medium text-foreground">{pieceNom}</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                {tache ? "Modifier une tâche existante" : `Ajouter une nouvelle tâche pour ${pieceNom}`}
              </DialogDescription>
            </div>
            {!isFullScreenMode && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className={isFullScreenMode ? "space-y-3 sm:space-y-4 py-2 sm:py-4 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-220px)]" : "space-y-4 py-4"}>
          <div>
            <Label className="text-sm font-medium">Titre</Label>
            <Input
              autoFocus
              placeholder="Inscrire le titre ici"
              value={formData.titre}
              onChange={(e) => setFormData({...formData, titre: e.target.value})}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Photo facultative</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <div
                onClick={handlePhotoClick}
                className="mt-1.5 flex aspect-video items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer overflow-hidden relative"
              >
                {photoPreview ? (
                  <>
                    {/* Placeholder pendant le chargement */}
                    {isLoadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
                        <div className="text-center">
                          <Loader2 className="mx-auto h-6 w-6 text-muted-foreground animate-spin" />
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Chargement...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Message d'erreur si l'image ne charge pas */}
                    {imageLoadError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                        <div className="text-center p-2">
                          <p className="text-xs text-destructive">
                            ⚠️ Image non disponible
                          </p>
                        </div>
                      </div>
                    )}

                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setIsLoadingImage(false)}
                      onError={() => {
                        setIsLoadingImage(false);
                        setImageLoadError(true);
                      }}
                    />

                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : isUploadingPhoto ? (
                  <div className="text-center p-2">
                    <Loader2 className="mx-auto h-6 w-6 text-muted-foreground/50 animate-spin" />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Upload en cours...
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <Upload className="mx-auto h-6 w-6 text-muted-foreground/50" />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Ajouter une image
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Consigne</Label>
              <Textarea
                placeholder="Inscrire la consigne ici"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1.5 min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="photo-obligatoire-dialog"
              checked={formData.photoObligatoire}
              onCheckedChange={(checked) => 
                setFormData({...formData, photoObligatoire: checked as boolean})
              }
            />
            <label
              htmlFor="photo-obligatoire-dialog"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Demander une photo pour valider la tâche
            </label>
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button
            onClick={handleSave}
            className="px-8"
            disabled={isUploadingPhoto}
          >
            {isUploadingPhoto ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours...
              </>
            ) : (
              tache ? "Enregistrer" : "Ajouter To Do"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
