import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, Plane, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import airbnbLogo from "@/assets/airbnb-logo.png";
import SelectRoomsWithQuantityDialog from "./SelectRoomsWithQuantityDialog";
import SelectTasksPerRoomDialog from "./SelectTasksPerRoomDialog";
import SelectExitQuestionsDialog from "./SelectExitQuestionsDialog";
import { AddPhotosDialog } from "./AddPhotosDialog";
import { AirbnbLoadingDialog } from "./AirbnbLoadingDialog";
import { AirbnbResultDialog } from "./AirbnbResultDialog";
import { ParcoursModele, PieceModele, QuestionModele } from "@/types/modele";
import { dispatchWebhook, getConciergerieID, isTestMode as getIsTestMode } from "@/utils/webhook";
import { loadConciergerieModele, updateConciergerieModele, updateModelePieces, updateModeleTasks, updateModeleQuestions } from "@/utils/conciergerieModele";
import { TACHES_MENAGE, TACHES_VOYAGEUR } from "@/components/parcours/modele/CustomModeleBuilder";
import { CustomAddressAutocomplete } from "@/components/ui/custom-address-autocomplete";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useToast } from "@/hooks/use-toast";
import { mapAirbnbRoomsToStandard } from "@/utils/airbnbRoomMapping";

interface PieceQuantity {
  nom: string;
  quantite: number;
  id?: string; // ID unique pour éviter la duplication des photos quand plusieurs pièces ont le même nom
}

interface AddLogementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customModeles?: ParcoursModele[];
  onDeleteCustom?: (modeleId: string) => void;
  onEditCustom?: (modele: ParcoursModele) => void;
  onCreateCustom: (parcoursType: "menage" | "voyageur") => void;
  onComplete: (data: {
    nom: string;
    adresse?: string;
    parcoursType: "menage" | "voyageur";
    modele: "menage" | "voyageur" | ParcoursModele;
    pieces: PieceQuantity[];
    piecesPhotos: Record<string, string[]>;
  }) => void;
  shouldReopenModeleDialog?: boolean;
  onModeleDialogReopened?: () => void;
  isFullScreenMode?: boolean;
  initialLogementData?: {
    nom?: string;
    adresse?: string;
  } | null;
}

export function AddLogementDialog({
  open,
  onOpenChange,
  customModeles = [],
  onDeleteCustom,
  onEditCustom,
  onCreateCustom,
  onComplete,
  shouldReopenModeleDialog = false,
  onModeleDialogReopened,
  isFullScreenMode = false,
  initialLogementData = null,
}: AddLogementDialogProps) {
  const { t } = useTranslation();

  // Détecter si on a un logement existant (logementid dans l'URL)
  const hasExistingLogement = !!initialLogementData;

  // Commencer à l'étape 2 si on a un logement existant, sinon à l'étape 1
  const initialStep = hasExistingLogement ? 2 : 1;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(initialStep as 1 | 2 | 3 | 4 | 5 | 6);
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [airbnbLink, setAirbnbLink] = useState("");
  const [parcoursType, setParcoursType] = useState<"menage" | "voyageur" | null>(null);
  const [selectedModele, setSelectedModele] = useState<"menage" | "voyageur" | ParcoursModele | null>(null);
  const [selectedPieces, setSelectedPieces] = useState<PieceQuantity[]>([]);
  const [piecesPhotos, setPiecesPhotos] = useState<Record<string, string[]>>({});
  const [airbnbPieces, setAirbnbPieces] = useState<any[]>([]);
  const [airbnbTotalPhotos, setAirbnbTotalPhotos] = useState(0);

  // Nouveau flux : États pour le modèle de conciergerie
  const [conciergerieModele, setConciergerieModele] = useState<ParcoursModele | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<PieceQuantity[]>([]);
  const [selectedTasksPerRoom, setSelectedTasksPerRoom] = useState<Map<string, string[]>>(new Map());
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionModele[]>([]);
  const [customPieces, setCustomPieces] = useState<string[]>([]); // Pièces personnalisées de la conciergerie

  // Charger l'API Google Maps
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();

  // Fonctions helper pour calculer la numérotation des étapes affichées
  const getDisplayedStepNumber = (currentStep: number): number => {
    if (hasExistingLogement) {
      // Si on a un logement existant, on saute l'étape 1
      // Donc l'étape 2 devient "Étape 1", l'étape 3 devient "Étape 2", etc.
      return currentStep - 1;
    }
    return currentStep;
  };

  const getTotalSteps = (): number => {
    // Si on a un logement existant, on a 5 étapes au lieu de 6
    return hasExistingLogement ? 5 : 6;
  };

  // Pré-remplir le formulaire avec les données initiales si présentes
  useEffect(() => {
    if (initialLogementData && open) {
      console.log("📝 Pré-remplissage du formulaire avec les données du logement:", initialLogementData);
      if (initialLogementData.nom) {
        setNom(initialLogementData.nom);
      }
      if (initialLogementData.adresse) {
        setAdresse(initialLogementData.adresse);
      }
      // Passer directement à l'étape 2 si on a un logement existant
      setStep(2);
      console.log("🚀 Passage automatique à l'étape 2 (sélection du type de parcours)");
    }
  }, [initialLogementData, open]);

  // Log pour déboguer
  useEffect(() => {
    console.log("📍 AddLogementDialog - Google Maps chargé:", isGoogleMapsLoaded);
    if (loadError) {
      console.error("📍 AddLogementDialog - Erreur:", loadError);
    }
  }, [isGoogleMapsLoaded, loadError]);

  const handleReset = () => {
    // Réinitialiser à l'étape initiale (1 ou 2 selon si on a un logement existant)
    setStep(initialStep as 1 | 2 | 3 | 4 | 5 | 6);
    // Ne pas réinitialiser nom et adresse si on a un logement existant
    if (!hasExistingLogement) {
      setNom("");
      setAdresse("");
    }
    setAirbnbLink("");
    setParcoursType(null);
    setSelectedModele(null);
    setSelectedPieces([]);
    setPiecesPhotos({});
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  // Rouvrir le sélecteur de modèle si nécessaire (retour depuis CustomModeleBuilder)
  useEffect(() => {
    if (shouldReopenModeleDialog && open && !selectedModele) {
      setStep(3);
      onModeleDialogReopened?.();
    }
  }, [shouldReopenModeleDialog, open, selectedModele, onModeleDialogReopened]);


  const handleStep1Next = () => {
    // Permettre de passer à l'étape 2 si le nom OU le lien Airbnb est rempli
    if (nom.trim() || airbnbLink.trim()) {
      setStep(2);
    }
  };

  const handleSelectMenageModele = async () => {
    setSelectedModele("menage");
    setParcoursType("menage");
    onModeleDialogReopened?.();

    // Charger le modèle de conciergerie
    try {
      const modele = await loadConciergerieModele("menage", conciergerieID, isTestMode);
      setConciergerieModele(modele);

      // Aller directement à l'étape 3 (sélection des pièces)
      // Le scraping Airbnb a déjà été fait à l'étape 1.5 si un lien était fourni
      setStep(3);
    } catch (error) {
      console.error("Erreur lors du chargement du modèle de conciergerie:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger le modèle de conciergerie.",
        variant: "destructive",
      });
    }
  };

  const handleSelectVoyageurModele = async () => {
    setSelectedModele("voyageur");
    setParcoursType("voyageur");
    onModeleDialogReopened?.();

    // Charger le modèle de conciergerie
    try {
      const modele = await loadConciergerieModele("voyageur", conciergerieID, isTestMode);
      setConciergerieModele(modele);

      // Aller directement à l'étape 3 (sélection des pièces)
      // Le scraping Airbnb a déjà été fait à l'étape 1.5 si un lien était fourni
      setStep(3);
    } catch (error) {
      console.error("Erreur lors du chargement du modèle de conciergerie:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger le modèle de conciergerie.",
        variant: "destructive",
      });
    }
  };

  const handleSelectCustomModele = async (modele: ParcoursModele) => {
    setSelectedModele(modele);
    setParcoursType(modele.type);
    onModeleDialogReopened?.();

    // Utiliser le modèle personnalisé directement
    setConciergerieModele(modele);

    // Aller directement à l'étape 3 (sélection des pièces)
    // Le scraping Airbnb a déjà été fait à l'étape 1.5 si un lien était fourni
    setStep(3);
  };



  const handleSavePieces = (pieces: PieceQuantity[]) => {
    setSelectedPieces(pieces);
    setStep(6);
  };

  const handleSavePhotos = async (photos: Record<string, string[]>) => {
    setPiecesPhotos(photos);

    // Utiliser les données du nouveau flux si disponibles, sinon utiliser l'ancien flux
    const finalPieces = selectedRooms.length > 0 ? selectedRooms : selectedPieces;
    const finalModele = conciergerieModele || selectedModele!;

    const logementData = {
      nom,
      adresse: adresse || undefined,
      airbnbLink: airbnbLink || undefined, // Ajouter le lien Airbnb si disponible
      parcoursType: parcoursType!,
      modele: finalModele,
      pieces: finalPieces,
      piecesPhotos: photos,
    };
    onComplete(logementData);

    // Dispatch webhook after successful completion
    try {
      const result = await dispatchWebhook(logementData);

      if (!result.success) {
        toast({
          title: "❌ Erreur lors de l'envoi",
          description: "Impossible de créer le logement. Veuillez réessayer.",
          variant: "destructive",
        });
        return; // Ne pas fermer le dialog en cas d'erreur
      }

      // Succès - fermer le dialog
      toast({
        title: "✅ Logement créé",
        description: `Le logement "${nom}" a été créé avec succès.`,
      });
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi du webhook:", error);
      toast({
        title: "❌ Erreur lors de l'envoi",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
      // Ne pas fermer le dialog en cas d'erreur
    }
  };

  // ========== NOUVEAU FLUX ==========

  // Handler pour l'étape 2 : Sélection du type de parcours
  const handleStep2Next = async (type: "menage" | "voyageur") => {
    setParcoursType(type);

    try {
      // Charger le modèle de conciergerie
      const modele = await loadConciergerieModele(type, getConciergerieID(), getIsTestMode());
      setConciergerieModele(modele);

      // Extraire les pièces personnalisées du modèle
      const customPiecesFromModele = modele.pieces
        .map(p => p.nom)
        .filter(nom => !["Cuisine", "Salle de bain (sans toilettes)", "Salle de bain avec toilettes", "Toilettes séparés", "Chambre", "Salon / Séjour", "Salle à manger", "Entrée / Couloir / Escaliers", "Buanderie / Laverie", "Espaces extérieurs", "Garage / Parking", "Bureau / Pièce de travail"].includes(nom));
      setCustomPieces(customPiecesFromModele);

      console.log(`✅ Modèle de conciergerie chargé pour ${type}:`, modele);
    } catch (error) {
      console.error("❌ Erreur lors du chargement du modèle:", error);
      toast({
        title: "⚠️ Avertissement",
        description: "Impossible de charger le modèle. Un modèle vide sera utilisé.",
        variant: "default",
      });
    }

    // Passer à l'étape 3 (sélection des pièces)
    setStep(3);
  };

  // Handler pour l'étape 3 : Sélection des pièces
  const handleStep3Next = async (rooms: PieceQuantity[]) => {
    setSelectedRooms(rooms);

    if (!conciergerieModele) return;

    try {
      // Mettre à jour le modèle avec les pièces sélectionnées
      const updatedModele = updateModelePieces(conciergerieModele, rooms);
      await updateConciergerieModele(updatedModele, getConciergerieID(), getIsTestMode());
      setConciergerieModele(updatedModele);

      // Mettre à jour les pièces personnalisées
      const newCustomPieces = rooms
        .filter(r => r.isCustom)
        .map(r => r.nom);
      setCustomPieces(prev => Array.from(new Set([...prev, ...newCustomPieces])));

      console.log(`✅ Modèle mis à jour avec les pièces sélectionnées`);
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du modèle:", error);
    }

    // Passer à l'étape 4 (sélection des tâches)
    setStep(4);
  };

  // Handler pour l'étape 4 : Sélection des tâches
  const handleStep4Next = async (tasksPerRoom: Map<string, string[]>) => {
    setSelectedTasksPerRoom(tasksPerRoom);

    if (!conciergerieModele || !parcoursType) return;

    try {
      // Obtenir la source des tâches selon le type de parcours
      const allTasksSource = parcoursType === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;

      // Mettre à jour le modèle avec les tâches sélectionnées
      const updatedModele = updateModeleTasks(conciergerieModele, tasksPerRoom, allTasksSource);
      await updateConciergerieModele(updatedModele, getConciergerieID(), getIsTestMode());
      setConciergerieModele(updatedModele);

      console.log(`✅ Modèle mis à jour avec les tâches sélectionnées`);
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du modèle:", error);
    }

    // Passer à l'étape 5 (questions de sortie)
    setStep(5);
  };

  // Handler pour l'étape 5 : Questions de sortie
  const handleStep5Next = async (questions: QuestionModele[]) => {
    setSelectedQuestions(questions);

    if (!conciergerieModele) return;

    try {
      // Mettre à jour le modèle avec les questions
      const updatedModele = updateModeleQuestions(conciergerieModele, questions);
      await updateConciergerieModele(updatedModele, getConciergerieID(), getIsTestMode());
      setConciergerieModele(updatedModele);

      console.log(`✅ Modèle mis à jour avec les questions sélectionnées`);
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du modèle:", error);
    }

    // Passer à l'étape 6 (photos)
    setStep(6);
  };

  return (
    <>
      {/* Dialog principal pour les étapes 1 et 2 */}
      <Dialog open={open && step <= 2} onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}>
        <DialogContent
          className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
          hideCloseButton={true}
        >
          {/* DialogHeader commun pour les étapes 1 et 2 (pour accessibilité) */}
          <DialogHeader className={step === 1 && !hasExistingLogement ? (isFullScreenMode ? "pb-0" : "") : "sr-only"}>
            {step === 1 && !hasExistingLogement && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 sm:h-8 sm:w-8 z-50"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className={step === 1 && !hasExistingLogement ? "space-y-1 sm:space-y-2" : ""}>
              <DialogTitle className={step === 1 && !hasExistingLogement ? (isFullScreenMode ? "text-base sm:text-lg md:text-xl pr-8" : "text-lg sm:text-xl md:text-2xl pr-8") : ""}>
                {step === 1 && !hasExistingLogement && `${t('logement.step', { current: getDisplayedStepNumber(1), total: getTotalSteps() })} - ${t('logement.createNew')}`}
                {step === 2 && `${t('logement.step', { current: getDisplayedStepNumber(2), total: getTotalSteps() })} - ${t('parcours.chooseType')}`}
              </DialogTitle>
              <DialogDescription className={step === 1 && !hasExistingLogement ? "text-xs sm:text-sm text-muted-foreground" : ""}>
                {step === 1 && !hasExistingLogement && t('logement.basicInfo')}
                {step === 2 && t('parcours.chooseTypeDescription')}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Étape 1 : Informations du logement - Ne pas afficher si on a un logement existant */}
          {step === 1 && !hasExistingLogement && (
            <>

              <div className={isFullScreenMode ? "space-y-2 sm:space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-260px)] px-1 pb-4" : "space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-280px)] sm:max-h-[calc(85vh-250px)] px-1 pb-4"}>
                <div className="space-y-2">
                  <Label htmlFor="nom">
                    {t('logement.name')} <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('logement.nameRequired')}
                  </p>
                  <Input
                    id="nom"
                    placeholder={t('logement.namePlaceholder')}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse">
                    {t('logement.address')}
                    {isGoogleMapsLoaded && <span className="text-xs text-green-600 ml-2">✓ Google Maps</span>}
                  </Label>
                  {isGoogleMapsLoaded ? (
                    <CustomAddressAutocomplete
                      id="adresse"
                      placeholder={t('logement.addressPlaceholder')}
                      value={adresse}
                      onChange={setAdresse}
                      onPlaceSelected={(place) => {
                        console.log("Adresse sélectionnée:", place);
                      }}
                    />
                  ) : (
                    <Input
                      id="adresse"
                      placeholder={t('logement.addressPlaceholder')}
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={airbnbLogo} alt="Airbnb" className="h-5 w-5" />
                    <Label htmlFor="airbnb-link">{t('logement.airbnbLink')}</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('logement.airbnbLinkDescription')}
                  </p>
                  <Input
                    id="airbnb-link"
                    placeholder={t('logement.airbnbLinkPlaceholder')}
                    value={airbnbLink}
                    onChange={(e) => setAirbnbLink(e.target.value)}
                  />
                  {/* Bouton pour lancer le scraping Airbnb manuellement */}
                  {airbnbLink.trim() && (
                    <Button
                      onClick={() => setStep(1.5 as any)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      🔍 Analyser le lien Airbnb
                    </Button>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 flex justify-end pt-3 sm:pt-4 border-t bg-background z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2 sm:pb-0">
                <Button
                  onClick={handleStep1Next}
                  disabled={!nom.trim()}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {t('logement.next')}
                </Button>
              </div>
            </>
          )}

          {/* Étape 2 : Type de parcours */}
          {step === 2 && (
            <>
              <div className="relative">
                {/* Afficher le bouton Retour seulement si on n'a pas de logement existant */}
                {!hasExistingLogement && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 sm:h-8 sm:w-8 z-50"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 sm:h-8 sm:w-8 z-50"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                {/* En-tête de l'étape */}
                <div className="px-8 sm:px-10 pb-3 sm:pb-4">
                  <h2 className={cn(
                    "font-semibold",
                    isFullScreenMode
                      ? "text-base sm:text-lg md:text-xl"
                      : "text-lg sm:text-xl md:text-2xl"
                  )}>
                    {t('logement.step', { current: getDisplayedStepNumber(2), total: getTotalSteps() })} - {t('parcours.chooseType')}
                  </h2>
                </div>
              </div>

              <div className={isFullScreenMode ? "grid grid-cols-1 gap-3 sm:gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"}>
                <Card
                  className="p-4 sm:p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all group border-2 active:scale-[0.98] sm:hover:scale-[1.02]"
                  onClick={() => handleStep2Next("menage")}
                >
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">{t('parcours.menage')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('parcours.menageDescription')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-4 sm:p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all group border-2 active:scale-[0.98] sm:hover:scale-[1.02]"
                  onClick={() => handleStep2Next("voyageur")}
                >
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">{t('parcours.voyageur')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('parcours.voyageurDescription')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* NOUVEAU FLUX - Étape 1.5 : Scraping Airbnb manuel (depuis l'étape 1) */}
      {step === 1.5 && airbnbLink.trim() && (
        <AirbnbLoadingDialog
          open={step === 1.5}
          airbnbLink={airbnbLink}
          onComplete={(data) => {
            // Mapper les pièces Airbnb vers les pièces standards avec regroupement intelligent
            const mappingResult = mapAirbnbRoomsToStandard(data.pieces);

            console.log("🔍 Mapping Airbnb → Standard:", {
              airbnbPieces: data.pieces.map(p => p.nom),
              mappedPieces: mappingResult.pieces,
              customPieces: mappingResult.customPieces,
              photos: Object.keys(mappingResult.photosMapping).map(key => ({
                piece: key,
                count: mappingResult.photosMapping[key].length
              }))
            });

            setSelectedRooms(mappingResult.pieces);
            setPiecesPhotos(mappingResult.photosMapping);
            setCustomPieces(mappingResult.customPieces); // Ajouter les pièces personnalisées
            setAirbnbPieces(data.pieces);
            setAirbnbTotalPhotos(data.totalPhotos);
            setAirbnbLink(data.airbnbLink);

            // Aller à l'étape 2 (sélection du type de parcours)
            setStep(2);
          }}
          onSkipToManual={() => {
            // Vider le lien Airbnb et revenir à l'étape 1
            setAirbnbLink("");
            setStep(1);
          }}
          onBack={() => setStep(1)}
          onClose={handleClose}
          isFullScreenMode={isFullScreenMode}
        />
      )}



      {/* NOUVEAU FLUX - Étape 3 : Sélection des pièces avec quantités */}
      {step === 3 && parcoursType && conciergerieModele && (
        <SelectRoomsWithQuantityDialog
          open={step === 3}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
          logementNom={nom}
          customPieces={customPieces}
          initialRooms={selectedRooms.length > 0 ? selectedRooms : conciergerieModele.piecesQuantity} // Pièces Airbnb OU pièces du modèle
          onSave={handleStep3Next}
          onBack={() => setStep(2)}
          isFullScreenMode={isFullScreenMode}
        />
      )}

      {/* NOUVEAU FLUX - Étape 4 : Sélection des tâches par pièce */}
      {step === 4 && parcoursType && conciergerieModele && (
        <SelectTasksPerRoomDialog
          open={step === 4}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
          logementNom={nom}
          parcoursType={parcoursType}
          selectedRooms={selectedRooms}
          modeleData={conciergerieModele.pieces}
          onSave={handleStep4Next}
          onBack={() => {
            // Fermer le dialog actuel avant de changer d'étape
            setTimeout(() => setStep(3), 100);
          }}
          isFullScreenMode={isFullScreenMode}
        />
      )}

      {/* NOUVEAU FLUX - Étape 5 : Questions de sortie */}
      {step === 5 && parcoursType && conciergerieModele && (
        <SelectExitQuestionsDialog
          open={step === 5}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
          logementNom={nom}
          parcoursType={parcoursType}
          modeleQuestions={conciergerieModele.questionsChecklist}
          onSave={handleStep5Next}
          onBack={() => {
            // Fermer le dialog actuel avant de changer d'étape
            setTimeout(() => setStep(4), 100);
          }}
          isFullScreenMode={isFullScreenMode}
        />
      )}

      {/* NOUVEAU FLUX - Étape 6 : Ajout de photos (manuel ou depuis Airbnb) */}
      {step === 6 && parcoursType && (
        <AddPhotosDialog
          open={step === 6}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
          logementNom={nom}
          pieces={selectedRooms.length > 0 ? selectedRooms : selectedPieces}
          parcoursType={parcoursType}
          onSave={handleSavePhotos}
          onBack={() => {
            // Fermer le dialog actuel avant de changer d'étape
            setTimeout(() => setStep(5), 100);
          }}
          isFullScreenMode={isFullScreenMode}
          initialPhotos={piecesPhotos} // Passer les photos Airbnb si disponibles
        />
      )}
    </>
  );
}
