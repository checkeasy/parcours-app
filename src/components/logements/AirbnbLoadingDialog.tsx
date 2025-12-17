import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { ArrowLeft, X } from "lucide-react";
import airbnbLogo from "@/assets/airbnb-logo.png";
import { z } from "zod";
import { getConciergerieID, getUserID, isTestMode as getIsTestMode } from "@/utils/webhook";

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
  onBack?: () => void;
  onClose?: () => void;
  isFullScreenMode?: boolean;
}

export function AirbnbLoadingDialog({
  open,
  airbnbLink,
  onComplete,
  onSkipToManual,
  onBack,
  onClose,
  isFullScreenMode = false,
}: AirbnbLoadingDialogProps) {
  const { t } = useTranslation();
  const [inputLink, setInputLink] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(t('airbnb.analyzing'));
  const [isComplete, setIsComplete] = useState(false);
  const [mockData, setMockData] = useState<{ pieces: PieceData[]; totalPhotos: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setInputLink("");
      setValidationError("");
      setIsAnalyzing(false);
      setProgress(0);
      setStatusMessage(t('airbnb.analyzing'));
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
      // Animation de progression fluide
      let currentProgress = 0;
      let progressInterval: NodeJS.Timeout | null = null;

      const startProgressAnimation = (targetProgress: number, duration: number, message: string) => {
        if (progressInterval) clearInterval(progressInterval);

        const startProgress = currentProgress;
        const progressDiff = targetProgress - startProgress;
        const steps = duration / 50; // Update every 50ms
        const increment = progressDiff / steps;

        setStatusMessage(message);

        progressInterval = setInterval(() => {
          currentProgress += increment;
          if (currentProgress >= targetProgress) {
            currentProgress = targetProgress;
            if (progressInterval) clearInterval(progressInterval);
          }
          setProgress(Math.round(currentProgress));
        }, 50);
      };

      try {
        // Étape 1: Connexion au service (0% → 15%)
        startProgressAnimation(15, 800, '🔗 Connexion au service de scraping...');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get real IDs from URL parameters
        const conciergerieID = getConciergerieID();
        const userID = getUserID();
        const isTestMode = getIsTestMode();

        // Backend URL - automatically detects environment
        const BACKEND_URL = import.meta.env.PROD
          ? window.location.origin  // In production, use the same origin (Railway URL)
          : 'http://localhost:3001'; // In development, use localhost

        // Étape 2: Analyse de l'annonce - progression lente pendant la requête (15% → 70%)
        // On anime sur 30 secondes max pour couvrir le temps de scraping
        startProgressAnimation(70, 30000, '🔍 Analyse de l\'annonce Airbnb...');

        const response = await fetch(`${BACKEND_URL}/api/scrape-and-create-parcours`, {
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

        // Arrêter l'animation lente et passer à l'étape suivante
        if (progressInterval) clearInterval(progressInterval);

        // Étape 3: Traitement de la réponse (progression actuelle → 85%)
        startProgressAnimation(85, 800, '📸 Traitement des photos...');

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erreur lors du scraping');
        }

        // Étape 4: Classification des pièces (85% → 95%)
        startProgressAnimation(95, 600, '🏠 Classification des pièces...');

        // Transformer les données de l'API en format attendu par le frontend
        const pieces: PieceData[] = result.data.pieces.map((piece: any) => ({
          nom: piece.nom,
          quantite: piece.quantite,
          emoji: getEmojiForRoom(piece.nom),
          photos: piece.photos, // Déjà en base64 !
          tasks: piece.tasks,
        }));

        const totalPhotos = pieces.reduce((sum, piece) => sum + piece.photos.length, 0);

        // Étape 5: Finalisation (95% → 100%)
        startProgressAnimation(100, 400, '✅ Analyse terminée !');
        await new Promise(resolve => setTimeout(resolve, 500));

        if (progressInterval) clearInterval(progressInterval);
        setProgress(100);
        setStatusMessage('✅ Analyse terminée !');
        setMockData({ pieces, totalPhotos });
        setIsComplete(true);

      } catch (error: any) {
        if (progressInterval) clearInterval(progressInterval);
        console.error('Erreur lors du scraping:', error);

        // Déterminer le type d'erreur et afficher un message approprié
        let errorMessage = error.message;

        if (error.message.includes('HTTP 500')) {
          errorMessage = "Le service de scraping a rencontré une erreur. L'annonce Airbnb ne contient peut-être pas toutes les informations nécessaires (noms de pièces manquants, etc.). Veuillez essayer avec une autre annonce ou passer en mode manuel.";
        } else if (error.message.includes('NoneType')) {
          errorMessage = "L'annonce Airbnb ne contient pas toutes les informations nécessaires (noms de pièces manquants). Veuillez essayer avec une autre annonce ou passer en mode manuel.";
        } else if (error.message.includes('HTTP')) {
          errorMessage = `Erreur de connexion au service de scraping (${error.message}). Veuillez réessayer dans quelques instants.`;
        }

        setStatusMessage(`❌ ${errorMessage}`);
        setValidationError(errorMessage);
        setIsAnalyzing(false);
        setProgress(0);
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
      "À trier": "📂", // Photos non classées - à redistribuer par l'utilisateur
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
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "max-w-md mx-4 overflow-hidden"}
        hideCloseButton={true}
      >
        <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-8 w-8 z-50"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 z-50"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className={onBack ? "pl-10 pr-10" : ""}>
            <DialogTitle className="text-base text-center">
              {t('airbnb.analyzing')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isAnalyzing ? t('airbnb.loading') : t('airbnb.extracting')}
            </DialogDescription>
          </div>
        </DialogHeader>

        {!isAnalyzing ? (
          // Formulaire de saisie du lien Airbnb
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="airbnb-link" className="text-sm font-medium">
                {t('logement.airbnbLink')}
              </Label>
              <div className="flex items-center gap-2">
                <img src={airbnbLogo} alt="Airbnb" className="w-5 h-5 flex-shrink-0" />
                <Input
                  id="airbnb-link"
                  type="url"
                  placeholder={t('logement.airbnbLinkPlaceholder')}
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
              {t('airbnb.analyzing')}
            </Button>
          </div>
        ) : (
          // Progression de l'analyse
          <Card className="border-primary/20 bg-primary/5 overflow-hidden">
            <CardContent className="p-3 space-y-3">
              {/* Lien Airbnb */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{t('logement.airbnbLink')}</p>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md border">
                  <img src={airbnbLogo} alt="Airbnb" className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs text-foreground truncate flex-1">{inputLink}</p>
                </div>
              </div>

              {/* Barre de progression globale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t('common.loading')}</span>
                  <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Message de statut */}
              <div className="text-center py-1">
                <p className={`text-sm font-medium ${validationError ? 'text-destructive' : 'text-foreground animate-pulse'}`}>
                  {statusMessage}
                </p>
              </div>

              {/* Message d'erreur détaillé */}
              {validationError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
                  <p className="text-xs text-destructive font-medium">
                    ⚠️ Erreur lors de l'analyse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {validationError}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValidationError("");
                        setIsAnalyzing(false);
                        setProgress(0);
                      }}
                      className="flex-1 text-xs"
                    >
                      Réessayer
                    </Button>
                    {onSkipToManual && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onSkipToManual}
                        className="flex-1 text-xs"
                      >
                        Mode manuel
                      </Button>
                    )}
                  </div>
                </div>
              )}
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
              {t('logement.next')}
            </Button>
          )}

          {/* Bouton pour passer au choix manuel - toujours visible */}
          {onSkipToManual && (
            <Button
              variant="ghost"
              onClick={onSkipToManual}
              className="text-sm text-muted-foreground hover:text-foreground justify-start px-0"
            >
              ← {t('pieces.selectPieces')}
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
