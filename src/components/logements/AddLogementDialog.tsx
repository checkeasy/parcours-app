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
import { SelectModeleDialog } from "@/components/parcours/dialogs/SelectModeleDialog";
import SelectPiecesDialog from "@/components/parcours/dialogs/SelectPiecesDialog";
import { AddPhotosDialog } from "./AddPhotosDialog";
import { AirbnbLoadingDialog } from "./AirbnbLoadingDialog";
import { AirbnbResultDialog } from "./AirbnbResultDialog";
import { ParcoursModele } from "@/types/modele";
import { dispatchWebhook } from "@/utils/webhook";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { AddressAutocompleteV2 } from "@/components/ui/address-autocomplete-v2";
import { CustomAddressAutocomplete } from "@/components/ui/custom-address-autocomplete";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useToast } from "@/hooks/use-toast";

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
  const [modeleDialogOpen, setModeleDialogOpen] = useState(false);
  const [selectedModele, setSelectedModele] = useState<"menage" | "voyageur" | ParcoursModele | null>(null);
  const [selectedPieces, setSelectedPieces] = useState<PieceQuantity[]>([]);
  const [piecesPhotos, setPiecesPhotos] = useState<Record<string, string[]>>({});
  const [airbnbPieces, setAirbnbPieces] = useState<any[]>([]);
  const [airbnbTotalPhotos, setAirbnbTotalPhotos] = useState(0);

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
    // Si on a un logement existant, on a 4 étapes au lieu de 5
    return hasExistingLogement ? 4 : 5;
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
      setModeleDialogOpen(true);
      onModeleDialogReopened?.();
    }
  }, [shouldReopenModeleDialog, open, selectedModele, onModeleDialogReopened]);


  const handleStep1Next = () => {
    // Permettre de passer à l'étape 2 si le nom OU le lien Airbnb est rempli
    if (nom.trim() || airbnbLink.trim()) {
      setStep(2);
    }
  };

  const handleStep2Next = (type: "menage" | "voyageur") => {
    setParcoursType(type);
    setStep(3);
    setModeleDialogOpen(true);
  };

  const handleSelectMenageModele = () => {
    setSelectedModele("menage");
    onModeleDialogReopened?.();
    // Si un lien Airbnb est rempli, aller à l'étape de chargement Airbnb
    if (airbnbLink.trim()) {
      setStep(4);
    } else {
      setStep(5);
    }
    setModeleDialogOpen(false);
  };

  const handleSelectVoyageurModele = () => {
    setSelectedModele("voyageur");
    onModeleDialogReopened?.();
    // Si un lien Airbnb est rempli, aller à l'étape de chargement Airbnb
    if (airbnbLink.trim()) {
      setStep(4);
    } else {
      setStep(5);
    }
    setModeleDialogOpen(false);
  };

  const handleSelectCustomModele = (modele: ParcoursModele) => {
    setSelectedModele(modele);
    onModeleDialogReopened?.();
    // Si un lien Airbnb est rempli, aller à l'étape de chargement Airbnb
    if (airbnbLink.trim()) {
      setStep(4);
    } else {
      setStep(5);
    }
    setModeleDialogOpen(false);
  };

  const handleAirbnbLoadingComplete = (data: { pieces: any[]; totalPhotos: number; airbnbLink: string }) => {
    setAirbnbPieces(data.pieces);
    setAirbnbTotalPhotos(data.totalPhotos);
    setAirbnbLink(data.airbnbLink); // Sauvegarder le lien Airbnb
    setStep(5);
  };

  const handleAirbnbResultConfirm = async (pieces: any[]) => {
    // Convertir les pièces Airbnb en PieceQuantity et piecesPhotos
    // IMPORTANT: Ajouter un ID unique à chaque pièce pour éviter la duplication des photos
    // quand plusieurs pièces ont le même nom (ex: "Chambre 1", "Chambre 2")
    const timestamp = Date.now();
    const convertedPieces: PieceQuantity[] = pieces.map((piece, index) => ({
      nom: piece.nom,
      quantite: piece.quantite,
      id: `piece_${index}_${timestamp}_${Math.random().toString(36).substring(2, 9)}`, // ID unique pour chaque pièce
    }));

    // Utiliser l'ID unique comme clé au lieu du nom pour éviter l'écrasement des photos
    const convertedPhotos: Record<string, string[]> = {};
    convertedPieces.forEach((piece, index) => {
      convertedPhotos[piece.id!] = pieces[index].photos;
    });

    setSelectedPieces(convertedPieces);
    setPiecesPhotos(convertedPhotos);

    const logementData = {
      nom,
      adresse: adresse || undefined,
      parcoursType: parcoursType!,
      modele: selectedModele!,
      pieces: convertedPieces,
      piecesPhotos: convertedPhotos,
    };

    // Terminer directement sans passer par l'étape photos manuelle
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

  const handleSavePieces = (pieces: PieceQuantity[]) => {
    setSelectedPieces(pieces);
    setStep(6);
  };

  const handleSavePhotos = async (photos: Record<string, string[]>) => {
    setPiecesPhotos(photos);
    const logementData = {
      nom,
      adresse: adresse || undefined,
      parcoursType: parcoursType!,
      modele: selectedModele!,
      pieces: selectedPieces,
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

  return (
    <>
      <Dialog open={open && !modeleDialogOpen && step < 4} onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}>
        <DialogContent
          className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
          hideCloseButton={isFullScreenMode}
        >
          {/* DialogHeader commun pour toutes les étapes (pour accessibilité) */}
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
                {step === 3 && `${t('logement.step', { current: getDisplayedStepNumber(3), total: getTotalSteps() })} - ${t('parcours.selectModel')}`}
              </DialogTitle>
              <DialogDescription className={step === 1 && !hasExistingLogement ? "text-xs sm:text-sm text-muted-foreground" : ""}>
                {step === 1 && !hasExistingLogement && t('logement.basicInfo')}
                {step === 2 && t('parcours.chooseTypeDescription')}
                {step === 3 && t('parcours.selectModelDescription')}
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
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 flex justify-end pt-3 sm:pt-4 border-t bg-background z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2 sm:pb-0">
                <Button
                  onClick={handleStep1Next}
                  disabled={!nom.trim()}
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

          {/* Étape 3 gérée par SelectModeleDialog - pas de contenu ici */}
        </DialogContent>
      </Dialog>

      {/* Dialog de sélection de modèle (Étape 3) */}
      {step === 3 && parcoursType && (
        <SelectModeleDialog
          open={modeleDialogOpen}
          onOpenChange={(open) => {
            setModeleDialogOpen(open);
          }}
          onBack={() => {
            setModeleDialogOpen(false);
            setStep(2);
          }}
          logementNom={nom}
          filterType={parcoursType}
          customModeles={customModeles}
          onSelectMenage={handleSelectMenageModele}
          onSelectVoyageur={handleSelectVoyageurModele}
          onSelectCustom={handleSelectCustomModele}
          onDeleteCustom={onDeleteCustom}
          onEditCustom={onEditCustom}
          onCreateCustom={onCreateCustom}
          isFullScreenMode={isFullScreenMode}
        />
      )}

      {/* Étape 4 : Chargement Airbnb */}
      {step === 4 && (
        <AirbnbLoadingDialog
          open={step === 4}
          airbnbLink={airbnbLink}
          onComplete={handleAirbnbLoadingComplete}
          onSkipToManual={() => {
            // Vider le lien Airbnb pour forcer le choix manuel
            setAirbnbLink("");
            // Aller à la sélection manuelle
            setStep(5);
          }}
          onBack={() => {
            setStep(3);
            setModeleDialogOpen(true);
          }}
          onClose={handleClose}
          isFullScreenMode={isFullScreenMode}
        />
      )}

      {/* Étape 5 : Résultat Airbnb OU Sélection manuelle des pièces */}
      {step === 5 && airbnbLink.trim() ? (
        <AirbnbResultDialog
          open={step === 5}
          logementNom={nom}
          pieces={airbnbPieces}
          totalPhotos={airbnbTotalPhotos}
          selectedModele={selectedModele}
          onConfirm={handleAirbnbResultConfirm}
          onBack={() => {
            setStep(3);
            setModeleDialogOpen(true);
          }}
          onClose={handleClose}
          isFullScreenMode={isFullScreenMode}
        />
      ) : step === 5 ? (
        <SelectPiecesDialog
          open={step === 5}
          onOpenChange={(open) => {
            if (!open) {
              setStep(3);
              setModeleDialogOpen(true);
            }
          }}
          logementNom={nom}
          type={parcoursType!}
          selectedModele={selectedModele!}
          onSave={handleSavePieces}
          onBack={() => {
            setStep(3);
            setModeleDialogOpen(true);
          }}
          onSwitchToAirbnb={() => {
            setStep(4);
          }}
          isFullScreenMode={isFullScreenMode}
        />
      ) : null}

      {/* Dialog d'ajout des photos (Étape 6) */}
      {step === 6 && parcoursType && (
        <AddPhotosDialog
          open={step === 6}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
          logementNom={nom}
          pieces={selectedPieces}
          parcoursType={parcoursType}
          onSave={handleSavePhotos}
          onBack={() => setStep(5)}
          isFullScreenMode={isFullScreenMode}
        />
      )}
    </>
  );
}
