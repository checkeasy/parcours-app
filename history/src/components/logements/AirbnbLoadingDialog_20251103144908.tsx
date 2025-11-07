import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import airbnbLogo from "@/assets/airbnb-logo.png";
import { z } from "zod";

interface PieceData {
  nom: string;
  quantite: number;
  emoji: string;
  photos: string[];
  tasks?: any[];
}

// Schéma de validation pour le lien Airbnb
const airbnbLinkSchema = z.string().trim().url({ message: "Le lien doit être une URL valide" }).refine(
  (url) => url.includes("airbnb"),
  { message: "Le lien doit être une URL Airbnb valide" }
);

interface AirbnbLoadingDialogProps {
  open: boolean;
  airbnbLink?: string;
  onComplete: (data: { pieces: PieceData[]; totalPhotos: number; airbnbLink: string }) => void;
  onSkipToManual?: () => void;
}

export function AirbnbLoadingDialog({
  open,
  airbnbLink,
  onComplete,
  onSkipToManual,
}: AirbnbLoadingDialogProps) {
  const [inputLink, setInputLink] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("🔍 Analyse de l'annonce Airbnb...");
  const [isComplete, setIsComplete] = useState(false);
  const [mockData, setMockData] = useState<{ pieces: PieceData[]; totalPhotos: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setInputLink("");
      setValidationError("");
      setIsAnalyzing(false);
      setProgress(0);
      setStatusMessage("🔍 Analyse de l'annonce Airbnb...");
      setIsComplete(false);
      setMockData(null);
      return;
    }

    // Si un lien Airbnb est fourni, démarrer l'analyse automatiquement
    if (airbnbLink) {
      setInputLink(airbnbLink);
      setIsAnalyzing(true);
    }
  }, [open, airbnbLink]);

  useEffect(() => {
    if (!isAnalyzing) return;

    // Animation de la barre de progression sur 15 secondes
    const duration = 15000; // 15 secondes
    const intervalTime = 100; // Update tous les 100ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Marquer comme terminé et stocker les données mockées
        const data = generateMockAirbnbData();
        setMockData(data);
        setIsComplete(true);
        setStatusMessage("✅ Analyse terminée !");
      }
      setProgress(currentProgress);

      // Changer le message de statut
      if (currentProgress < 33) {
        setStatusMessage("🔍 Analyse de l'annonce Airbnb...");
      } else if (currentProgress < 66) {
        setStatusMessage("📸 Téléchargement des photos...");
      } else {
        setStatusMessage("🏠 Classification des pièces...");
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleStartAnalysis = () => {
    // Valider le lien
    const validation = airbnbLinkSchema.safeParse(inputLink);
    if (!validation.success) {
      setValidationError(validation.error.errors[0].message);
      return;
    }

    setValidationError("");
    setIsAnalyzing(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-4 overflow-hidden">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base">
            Étape 4/5 - Import Airbnb
          </DialogTitle>
          <DialogDescription>
            Analyse en cours...
          </DialogDescription>
        </DialogHeader>

        {!isAnalyzing ? (
          // Formulaire de saisie du lien Airbnb
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="airbnb-link" className="text-sm font-medium">
                Lien de l'annonce Airbnb
              </Label>
              <div className="flex items-center gap-2">
                <img src={airbnbLogo} alt="Airbnb" className="w-5 h-5 flex-shrink-0" />
                <Input
                  id="airbnb-link"
                  type="url"
                  placeholder="https://www.airbnb.fr/rooms/..."
                  value={inputLink}
                  onChange={(e) => {
                    setInputLink(e.target.value);
                    setValidationError("");
                  }}
                  className={validationError ? "border-destructive" : ""}
                />
              </div>
              {validationError && (
                <p className="text-xs text-destructive">{validationError}</p>
              )}
            </div>

            <Button onClick={handleStartAnalysis} className="w-full">
              Lancer l'analyse
            </Button>
          </div>
        ) : (
          // Progression de l'analyse
          <Card className="border-primary/20 bg-primary/5 overflow-hidden">
            <CardContent className="p-3 space-y-3">
              {/* Lien Airbnb */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Annonce Airbnb</p>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md border">
                  <img src={airbnbLogo} alt="Airbnb" className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs text-foreground truncate flex-1">{inputLink}</p>
                </div>
              </div>

              {/* Barre de progression globale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Message de statut */}
              <div className="text-center py-1">
                <p className="text-sm font-medium text-foreground animate-pulse">
                  {statusMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3">
          {/* Bouton Suivant (affiché quand le chargement est terminé) */}
          {isComplete && mockData && (
            <Button
              onClick={() => onComplete({ ...mockData, airbnbLink: inputLink })}
              className="w-full"
            >
              Suivant
            </Button>
          )}

          {/* Bouton pour passer au choix manuel - toujours visible */}
          {onSkipToManual && (
            <Button
              variant="ghost"
              onClick={onSkipToManual}
              className="text-sm text-muted-foreground hover:text-foreground justify-start px-0"
            >
              ← Préférer le choix manuel des pièces
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Fonction pour générer des données mockées
function generateMockAirbnbData() {
  const mockPieces: PieceData[] = [
    {
      nom: "Chambre",
      quantite: 2,
      emoji: "🛏️",
      photos: Array(14).fill("/lovable-uploads/26989f8c-956c-4b91-a934-d8e3da6b12e0.png"),
    },
    {
      nom: "Cuisine",
      quantite: 1,
      emoji: "🍳",
      photos: Array(4).fill("/lovable-uploads/32d5b134-c413-40ad-b79d-d6ac3edffdad.png"),
    },
    {
      nom: "Salle de bain",
      quantite: 1,
      emoji: "🚿",
      photos: Array(6).fill("/lovable-uploads/4c3e5243-6521-486a-b8bf-8fc11689c059.png"),
    },
    {
      nom: "Salon",
      quantite: 1,
      emoji: "🛋️",
      photos: Array(8).fill("/lovable-uploads/5387fdd0-1859-42fe-a763-bea8f1f325f3.png"),
    },
    {
      nom: "Extérieur",
      quantite: 1,
      emoji: "🌳",
      photos: Array(12).fill("/lovable-uploads/90661c48-f1dd-47f5-825d-df6c858bd626.png"),
    },
    {
      nom: "Espace repas",
      quantite: 1,
      emoji: "🍽️",
      photos: Array(3).fill("/lovable-uploads/c3c4e46f-9ec2-4536-906a-00a0a989e854.png"),
    },
    {
      nom: "Escalier",
      quantite: 1,
      emoji: "🪜",
      photos: Array(5).fill("/lovable-uploads/e1008c2c-9df5-4731-9c33-ac5f9bb7b7c3.png"),
    },
    {
      nom: "Entrée",
      quantite: 1,
      emoji: "🚪",
      photos: Array(4).fill("/lovable-uploads/26989f8c-956c-4b91-a934-d8e3da6b12e0.png"),
    },
    {
      nom: "Terrasse",
      quantite: 1,
      emoji: "🏡",
      photos: Array(15).fill("/lovable-uploads/32d5b134-c413-40ad-b79d-d6ac3edffdad.png"),
    },
  ];

  const totalPhotos = mockPieces.reduce((sum, piece) => sum + piece.photos.length, 0);

  return {
    pieces: mockPieces,
    totalPhotos,
  };
}
