import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { X, Upload } from "lucide-react";

interface Tache {
  id: string;
  emoji: string;
  titre: string;
  description: string;
  photoObligatoire: boolean;
}

interface TacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache?: Tache;
  pieceNom: string;
  onSave: (tache: Omit<Tache, "id">) => void;
}

export function TacheDialog({ 
  open, 
  onOpenChange, 
  tache,
  pieceNom,
  onSave 
}: TacheDialogProps) {
  const [formData, setFormData] = useState({
    emoji: "",
    titre: "",
    description: "",
    photoObligatoire: false
  });

  useEffect(() => {
    if (tache) {
      setFormData({
        emoji: tache.emoji,
        titre: tache.titre,
        description: tache.description,
        photoObligatoire: tache.photoObligatoire
      });
    } else {
      setFormData({
        emoji: "",
        titre: "",
        description: "",
        photoObligatoire: false
      });
    }
  }, [tache, open]);

  const handleSave = () => {
    if (formData.titre.trim()) {
      onSave({
        emoji: formData.emoji || "📋",
        titre: formData.titre,
        description: formData.description,
        photoObligatoire: formData.photoObligatoire
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{tache ? "Modifier la tâche" : "Nouvelle To Do pour"}</span>
              <span className="font-medium text-foreground">{pieceNom}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              <div className="mt-1.5 flex aspect-video items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50 cursor-pointer">
                <div className="text-center p-2">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground/50" />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Ajouter une image
                  </p>
                </div>
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
          <Button onClick={handleSave} className="px-8">
            {tache ? "Enregistrer" : "Ajouter To Do"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
