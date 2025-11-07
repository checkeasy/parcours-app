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

    // Appeler l'API de scraping réelle
    const performScraping = async () => {
      try {
        setStatusMessage("🔍 Analyse de l'annonce Airbnb...");
        setProgress(10);

        // TODO: Remplacer par les vrais IDs de l'utilisateur
        const conciergerieID = "1730741276842x778024514623373300";
        const userID = "1730741188020x554510837711264200";
        const isTestMode = true;

        const response = await fetch('http://localhost:3001/api/scrape-and-create-parcours', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: inputLink,
            conciergerieID,
            userID,
            isTestMode,
          }),
        });

        setProgress(50);
        setStatusMessage("📸 Téléchargement et conversion des photos en base64...");

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erreur lors du scraping');
        }

        setProgress(90);
        setStatusMessage("🎨 Classification des pièces...");

        // Transformer les données de l'API en format attendu par le frontend
        const pieces: PieceData[] = result.data.pieces.map((piece: any) => ({
          nom: piece.nom,
          quantite: piece.quantite,
          emoji: getEmojiForRoom(piece.nom),
          photos: piece.photos, // Déjà en base64 !
          tasks: piece.tasks,
        }));

        const totalPhotos = pieces.reduce((sum, piece) => sum + piece.photos.length, 0);

        setProgress(100);
        setStatusMessage("✅ Analyse terminée !");
        setMockData({ pieces, totalPhotos });
        setIsComplete(true);

      } catch (error: any) {
        console.error('Erreur lors du scraping:', error);
        setStatusMessage(`❌ Erreur: ${error.message}`);
        setValidationError(error.message);
        setIsAnalyzing(false);
        setProgress(0);

        // Fallback sur les données mockées en cas d'erreur
        console.warn('Utilisation des données mockées en fallback');
        const data = generateMockAirbnbData();
        setMockData(data);
        setIsComplete(true);
        setStatusMessage("✅ Analyse terminée (mode démo)");
      }
    };

    performScraping();
  }, [isAnalyzing, inputLink]);

  // Fonction pour obtenir l'emoji d'une pièce
  const getEmojiForRoom = (roomName: string): string => {
    const emojiMap: Record<string, string> = {
      "Chambre": "🛏️",
      "Cuisine": "🍳",
      "Salle de bain": "🚿",
      "Salon": "🛋️",
      "Entrée": "🚪",
      "Couloir": "🚶",
      "WC": "🚽",
      "Buanderie": "🧺",
      "Balcon": "🏡",
      "Terrasse": "🌿",
      "Jardin": "🌳",
      "Extérieur": "🌲",
      "Autres": "📍",
    };
    return emojiMap[roomName] || "📍";
  };

  // Ancien code commenté pour référence
  /*
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
  */

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
      tasks: [
        { id: "t-chambre-1", emoji: "🛏️", titre: "Lit fait", description: "Faire le lit avec des draps propres", photoObligatoire: true },
        { id: "t-chambre-2", emoji: "🧹", titre: "Sol aspiré", description: "Aspirer ou laver le sol", photoObligatoire: true },
        { id: "t-chambre-3", emoji: "🪟", titre: "Fenêtres", description: "Nettoyer les vitres", photoObligatoire: false },
      ],
    },
    {
      nom: "Cuisine",
      quantite: 1,
      emoji: "🍳",
      photos: Array(4).fill("/lovable-uploads/32d5b134-c413-40ad-b79d-d6ac3edffdad.png"),
      tasks: [
        { id: "t-cuisine-1", emoji: "🍽️", titre: "Vaisselle propre", description: "Vérifier que toute la vaisselle est propre et rangée", photoObligatoire: true },
        { id: "t-cuisine-2", emoji: "🧽", titre: "Plan de travail", description: "Nettoyer et désinfecter les plans de travail", photoObligatoire: true },
        { id: "t-cuisine-3", emoji: "🗑️", titre: "Poubelle vidée", description: "Vider et nettoyer la poubelle", photoObligatoire: false },
      ],
    },
    {
      nom: "Salle de bain",
      quantite: 1,
      emoji: "🚿",
      photos: Array(6).fill("/lovable-uploads/4c3e5243-6521-486a-b8bf-8fc11689c059.png"),
      tasks: [
        { id: "t-sdb-1", emoji: "🚿", titre: "Douche/Baignoire", description: "Nettoyer et détartrer la douche ou baignoire", photoObligatoire: true },
        { id: "t-sdb-2", emoji: "🚽", titre: "Toilettes", description: "Nettoyer et désinfecter les toilettes", photoObligatoire: true },
        { id: "t-sdb-3", emoji: "🪞", titre: "Miroir", description: "Nettoyer le miroir sans traces", photoObligatoire: false },
      ],
    },
    {
      nom: "Salon",
      quantite: 1,
      emoji: "🛋️",
      photos: Array(8).fill("/lovable-uploads/5387fdd0-1859-42fe-a763-bea8f1f325f3.png"),
      tasks: [
        { id: "t-salon-1", emoji: "🛋️", titre: "Canapé", description: "Aspirer et nettoyer le canapé", photoObligatoire: true },
        { id: "t-salon-2", emoji: "📺", titre: "Écran TV", description: "Nettoyer l'écran de télévision", photoObligatoire: false },
        { id: "t-salon-3", emoji: "🪟", titre: "Fenêtres", description: "Nettoyer les vitres", photoObligatoire: false },
      ],
    },
    {
      nom: "Extérieur",
      quantite: 1,
      emoji: "🌳",
      photos: Array(12).fill("/lovable-uploads/90661c48-f1dd-47f5-825d-df6c858bd626.png"),
      tasks: [
        { id: "t-ext-1", emoji: "🪑", titre: "Mobilier jardin", description: "Nettoyer table et chaises", photoObligatoire: false },
        { id: "t-ext-2", emoji: "☂️", titre: "Parasol", description: "Ranger le parasol", photoObligatoire: false },
        { id: "t-ext-3", emoji: "🚬", titre: "Cendriers", description: "Vider les cendriers", photoObligatoire: false },
      ],
    },
    {
      nom: "Espace repas",
      quantite: 1,
      emoji: "🍽️",
      photos: Array(3).fill("/lovable-uploads/c3c4e46f-9ec2-4536-906a-00a0a989e854.png"),
      tasks: [
        { id: "t-repas-1", emoji: "🪑", titre: "Table et chaises", description: "Essuyer table et chaises", photoObligatoire: true },
        { id: "t-repas-2", emoji: "🍽️", titre: "Sets de table", description: "Vérifier les sets de table", photoObligatoire: false },
      ],
    },
    {
      nom: "Escalier",
      quantite: 1,
      emoji: "🪜",
      photos: Array(5).fill("/lovable-uploads/e1008c2c-9df5-4731-9c33-ac5f9bb7b7c3.png"),
      tasks: [
        { id: "t-escalier-1", emoji: "🧹", titre: "Escalier", description: "Aspirer les marches", photoObligatoire: false },
        { id: "t-escalier-2", emoji: "🚪", titre: "Rampe", description: "Dépoussiérer la rampe", photoObligatoire: false },
      ],
    },
    {
      nom: "Entrée",
      quantite: 1,
      emoji: "🚪",
      photos: Array(4).fill("/lovable-uploads/26989f8c-956c-4b91-a934-d8e3da6b12e0.png"),
      tasks: [
        { id: "t-entree-1", emoji: "🚪", titre: "Entrée", description: "Nettoyer l'entrée", photoObligatoire: true },
        { id: "t-entree-2", emoji: "🪞", titre: "Miroir", description: "Nettoyer le miroir", photoObligatoire: false },
      ],
    },
    {
      nom: "Terrasse",
      quantite: 1,
      emoji: "🏡",
      photos: Array(15).fill("/lovable-uploads/32d5b134-c413-40ad-b79d-d6ac3edffdad.png"),
      tasks: [
        { id: "t-terrasse-1", emoji: "🧹", titre: "Terrasse", description: "Balayer la terrasse", photoObligatoire: true },
        { id: "t-terrasse-2", emoji: "🪑", titre: "Mobilier", description: "Nettoyer le mobilier", photoObligatoire: false },
        { id: "t-terrasse-3", emoji: "☂️", titre: "Parasol", description: "Fermer le parasol", photoObligatoire: false },
      ],
    },
  ];

  const totalPhotos = mockPieces.reduce((sum, piece) => sum + piece.photos.length, 0);

  return {
    pieces: mockPieces,
    totalPhotos,
  };
}
