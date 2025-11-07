import { useState, useEffect } from "react";
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
import airbnbLogo from "@/assets/airbnb-logo.png";
import { SelectModeleDialog } from "@/components/parcours/dialogs/SelectModeleDialog";
import SelectPiecesDialog from "@/components/parcours/dialogs/SelectPiecesDialog";
import { AddPhotosDialog } from "./AddPhotosDialog";
import { AirbnbLoadingDialog } from "./AirbnbLoadingDialog";
import { AirbnbResultDialog } from "./AirbnbResultDialog";
import { ParcoursModele } from "@/types/modele";

interface PieceQuantity {
  nom: string;
  quantite: number;
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
}: AddLogementDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
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

  const handleReset = () => {
    setStep(1);
    setNom("");
    setAdresse("");
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
    if (nom.trim()) {
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

  const handleAirbnbResultConfirm = (pieces: any[]) => {
    // Convertir les pièces Airbnb en PieceQuantity et piecesPhotos
    const convertedPieces: PieceQuantity[] = pieces.map((piece) => ({
      nom: piece.nom,
      quantite: piece.quantite,
    }));

    const convertedPhotos: Record<string, string[]> = {};
    pieces.forEach((piece) => {
      convertedPhotos[piece.nom] = piece.photos;
    });

    setSelectedPieces(convertedPieces);
    setPiecesPhotos(convertedPhotos);

    // Terminer directement sans passer par l'étape photos manuelle
    onComplete({
      nom,
      adresse: adresse || undefined,
      parcoursType: parcoursType!,
      modele: selectedModele!,
      pieces: convertedPieces,
      piecesPhotos: convertedPhotos,
    });
    handleClose();
  };

  const handleSavePieces = (pieces: PieceQuantity[]) => {
    setSelectedPieces(pieces);
    setStep(6);
  };

  const handleSavePhotos = (photos: Record<string, string[]>) => {
    setPiecesPhotos(photos);
    onComplete({
      nom,
      adresse: adresse || undefined,
      parcoursType: parcoursType!,
      modele: selectedModele!,
      pieces: selectedPieces,
      piecesPhotos: photos,
    });
    handleClose();
  };

  return (
    <>
      <Dialog open={open && !modeleDialogOpen && step < 4} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[85vh]">
          <DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Étape 1 : Informations du logement */}
          {step === 1 && (
            <>
              <div className="space-y-2 -mt-6">
                <DialogTitle className="text-xl sm:text-2xl">
                  Étape 1/5 - Créer un nouveau logement
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Renseignez les informations de base de votre logement
                </DialogDescription>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[50vh] px-1">
                <div className="space-y-2">
                  <Label htmlFor="nom">
                    Nom du logement <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Appartement Paris Centre"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse postale (facultatif)</Label>
                  <Input
                    id="adresse"
                    placeholder="Ex: 15 Rue de la Paix, 75002 Paris"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={airbnbLogo} alt="Airbnb" className="h-5 w-5" />
                    <Label htmlFor="airbnb-link">Lien Airbnb (facultatif)</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nous utiliserons ce lien pour extraire automatiquement les pièces et les photos de votre annonce
                  </p>
                  <Input
                    id="airbnb-link"
                    placeholder="https://www.airbnb.fr/rooms/..."
                    value={airbnbLink}
                    onChange={(e) => setAirbnbLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleStep1Next} disabled={!nom.trim()}>
                  Suivant
                </Button>
              </div>
            </>
          )}

          {/* Étape 2 : Type de parcours */}
          {step === 2 && (
            <>
              <DialogHeader>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-4 h-8 w-8"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-8 w-8"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="pl-10">
                  <DialogTitle className="text-xl sm:text-2xl">
                    Étape 2/5 - On commence par quel parcours ?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-2">
                    Vous pourrez ajouter l'autre ensuite en 1 clic.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="grid sm:grid-cols-2 gap-4 py-4">
                <Card
                  className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all group border-2 hover:scale-[1.02]"
                  onClick={() => handleStep2Next("menage")}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Agents de ménage</h3>
                      <p className="text-sm text-muted-foreground">
                        Suivre la qualité ménage
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer hover:border-primary hover:shadow-lg transition-all group border-2 hover:scale-[1.02]"
                  onClick={() => handleStep2Next("voyageur")}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Plane className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">Voyageur</h3>
                      <p className="text-sm text-muted-foreground">
                        État des lieux
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Étape 3 gérée par SelectModeleDialog */}
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
        />
      )}

      {/* Étape 4 : Chargement Airbnb */}
      {step === 4 && (
        <AirbnbLoadingDialog
          open={step === 4}
          airbnbLink={airbnbLink}
          onComplete={handleAirbnbLoadingComplete}
          onSkipToManual={() => {
            // Aller à la sélection manuelle
            setStep(5);
          }}
        />
      )}

      {/* Étape 5 : Résultat Airbnb OU Sélection manuelle des pièces */}
      {step === 5 && airbnbLink.trim() ? (
        <AirbnbResultDialog
          open={step === 5}
          logementNom={nom}
          pieces={airbnbPieces}
          totalPhotos={airbnbTotalPhotos}
          onConfirm={handleAirbnbResultConfirm}
          onBack={() => {
            setStep(3);
            setModeleDialogOpen(true);
          }}
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
        />
      ) : null}

      {/* Dialog d'ajout des photos (Étape 6) */}
      {step === 6 && (
        <AddPhotosDialog
          open={step === 6}
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
          logementNom={nom}
          pieces={selectedPieces}
          onSave={handleSavePhotos}
          onBack={() => setStep(5)}
        />
      )}
    </>
  );
}
