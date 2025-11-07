import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Maximize2 } from "lucide-react";
import { QuestionModele } from "@/types/modele";

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: QuestionModele;
  onSave: (question: Omit<QuestionModele, "id">) => void;
}

export function QuestionDialog({ 
  open, 
  onOpenChange, 
  question,
  onSave 
}: QuestionDialogProps) {
  const [formData, setFormData] = useState<Omit<QuestionModele, "id">>({
    intitule: "",
    type: "oui-non",
    photoObligatoire: false,
    obligatoire: false
  });

  useEffect(() => {
    if (question) {
      setFormData({
        intitule: question.intitule,
        type: question.type,
        photoObligatoire: question.photoObligatoire || false,
        obligatoire: question.obligatoire || false
      });
    } else {
      setFormData({
        intitule: "",
        type: "oui-non",
        photoObligatoire: false,
        obligatoire: false
      });
    }
  }, [question, open]);

  const handleSave = () => {
    if (formData.intitule.trim()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xs sm:text-sm font-normal">
                Question pour <span className="font-medium">Parcours personnalisé</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Configurez une question pour votre parcours personnalisé
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hidden sm:flex"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-4 px-4 sm:px-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Intitulé de la question</Label>
            <Textarea
              autoFocus
              placeholder="Ex: Les lumières, les radiateurs et la climatisation sont-ils bien éteints ?"
              value={formData.intitule}
              onChange={(e) => setFormData({...formData, intitule: e.target.value})}
              className="resize-none text-sm"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">Le type de la réponse</Label>
            <div className="flex items-center gap-2">
              <ToggleGroup 
                type="single" 
                value={formData.type}
                onValueChange={(value: QuestionModele["type"]) => {
                  if (value) setFormData({...formData, type: value})
                }}
                className="w-full flex-wrap sm:flex-nowrap justify-start gap-2"
              >
                <ToggleGroupItem 
                  value="oui-non" 
                  className="flex-1 sm:flex-none min-w-0 px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
                >
                  Oui/Non
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="ouverte" 
                  className="flex-1 sm:flex-none min-w-0 px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
                >
                  Ouverte
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <Checkbox
              id="photo-obligatoire"
              checked={formData.photoObligatoire}
              onCheckedChange={(checked) => 
                setFormData({...formData, photoObligatoire: checked as boolean})
              }
            />
            <div className="grid gap-1">
              <label
                htmlFor="photo-obligatoire"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Demander une photo
              </label>
              <p className="text-xs text-muted-foreground">
                Cette photo sera demandée pour valider la question
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-3 sm:pt-4 px-4 sm:px-6">
          <Button 
            onClick={handleSave} 
            disabled={!formData.intitule.trim()}
            className="w-full sm:w-auto px-6 bg-primary hover:bg-primary/90"
          >
            {question ? "Modifier la question" : "Ajouter la question"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
