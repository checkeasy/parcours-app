import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ParcoursModele } from "@/types/modele";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";

interface SelectModeleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  logementNom: string;
  filterType?: "menage" | "voyageur"; // Filtre optionnel pour afficher uniquement un type
  customModeles?: ParcoursModele[];
  onSelectMenage: () => void;
  onSelectVoyageur: () => void;
  onSelectCustom?: (modele: ParcoursModele) => void;
  onDeleteCustom?: (modeleId: string) => void;
  onEditCustom?: (modele: ParcoursModele) => void;
  onCreateCustom: (parcoursType: "menage" | "voyageur") => void;
  isFullScreenMode?: boolean;
}

export function SelectModeleDialog({
  open,
  onOpenChange,
  onBack,
  logementNom,
  filterType,
  customModeles = [],
  onSelectMenage,
  onSelectVoyageur,
  onSelectCustom,
  onDeleteCustom,
  onEditCustom,
  onCreateCustom,
  isFullScreenMode = false,
}: SelectModeleDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeleToDelete, setModeleToDelete] = useState<ParcoursModele | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"menage" | "voyageur">("menage");

  const handleDeleteClick = (e: React.MouseEvent, modele: ParcoursModele) => {
    e.stopPropagation();
    setModeleToDelete(modele);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (modeleToDelete && onDeleteCustom) {
      onDeleteCustom(modeleToDelete.id);
      setDeleteDialogOpen(false);
      setModeleToDelete(null);
    }
  };

  const getModeleEmoji = (type: "menage" | "voyageur") => {
    return type === "menage" ? "🧹" : "✈️";
  };

  const getTotalTaches = (modele: ParcoursModele) => {
    return modele.pieces.reduce((total, piece) => {
      return total + piece.tachesSelectionnees.length;
    }, 0);
  };

  // Filtrer les modèles personnalisés selon le type
  const filteredCustomModeles = filterType
    ? customModeles.filter((m) => m.type === filterType)
    : customModeles;

  // Déterminer si on affiche les modèles Check Easy
  const showMenageCheckEasy = !filterType || filterType === "menage";
  const showVoyageurCheckEasy = !filterType || filterType === "voyageur";

  const handlePreviewClick = (e: React.MouseEvent, type: "menage" | "voyageur") => {
    e.stopPropagation();
    setPreviewType(type);
    setPreviewDialogOpen(true);
  };

  const TACHES_PREVIEW = {
    menage: [
      { piece: "Cuisine", taches: ["Vider les poubelles", "Laver la vaisselle", "Essuyer toutes surfaces", "Nettoyer micro-ondes", "Nettoyer réfrigérateur", "Nettoyer congélateur", "Nettoyer four", "Nettoyer plaques/cuisson", "Dégraisser hotte & filtre", "Nettoyer petits électros", "Vider lave-vaisselle", "Contrôler éponge & liquide", "Balayer & serpillière"] },
      { piece: "Salle de bain (sans WC)", taches: ["Retirer cheveux/poils (siphon)", "Détartrer parois & robinetterie", "Nettoyer carrelage & joints", "Nettoyer miroir & vasque", "Nettoyer meuble sous-vasque", "Vérifier linge de toilette", "Vider poubelle SDB", "Changer le tapis de bain"] },
      { piece: "Salle de bain avec toilettes", taches: ["Nettoyer cuvette & lunette", "Recharger papier toilette", "Retirer cheveux/poils (siphon)", "Détartrer parois & robinetterie", "Nettoyer carrelage & joints", "Nettoyer miroir & vasque", "Nettoyer meuble sous-vasque", "Vérifier linge de toilette", "Vider poubelle SDB", "Changer le tapis de bain"] },
      { piece: "WC séparés", taches: ["Nettoyer cuvette & lunette", "Recharger papier toilette"] },
      { piece: "Chambre(s)", taches: ["Changer draps & taies", "Aspirer matelas", "Contrôler oreillers & couette", "Signaler latte cassée", "Aspirer sous lit & meubles", "Nettoyer tables de chevet", "Vérifier placards & tiroirs", "Ranger rideaux / volets"] },
      { piece: "Salon / Séjour", taches: ["Dépoussiérer surfaces", "Aspirer canapé & fauteuils", "Aspirer & secouer tapis", "Remettre la télécommande de la TV", "Aligner mobilier & déco"] },
      { piece: "Salle à manger", taches: ["Essuyer table & chaises", "Vérifier sets de table / déco", "Nettoyer buffet / vaisselier", "Passer aspirateur sous table"] },
      { piece: "Entrée / Couloir / Escaliers", taches: ["Nettoyer/ secouer paillasson", "Nettoyer miroir & interphone", "Dépoussiérer rampe escalier"] },
      { piece: "Buanderie / Laverie", taches: ["Nettoyer tambour lave-linge", "Vider filtre sèche-linge", "Nettoyer plan de pliage", "Contrôler stock lessive / adoucissant"] },
      { piece: "Espaces extérieurs", taches: ["Nettoyer mobilier jardin", "Ranger coussins & parasol", "Vider cendriers & mégots", "Nettoyer barbecue", "Vérifier SPA", "Vérifier piscine (si présente)", "Arroser / vérifier plantes"] },
    ],
    voyageur: [
      { piece: "Cuisine", taches: ["Vider les poubelles", "Ranger la vaisselle", "Vider le réfrigérateur"] },
      { piece: "Salle de bain (sans toilette)", taches: ["Rassembler serviettes", "Vider la poubelle", "Vérifier effets personnels"] },
      { piece: "Salle de bain avec toilettes", taches: ["Tirer chasse & abaisser lunette", "Vider la poubelle", "Regrouper serviettes"] },
      { piece: "Toilettes séparés", taches: ["Tirer chasse & fermer abattant", "Vider la poubelle"] },
      { piece: "Chambre", taches: ["Défaire le linge de lit", "Vérifier placards/tiroirs"] },
      { piece: "Salon / Séjour", taches: ["Ranger canapé & coussins", "Éteindre TV & appareils"] },
      { piece: "Espaces extérieurs", taches: ["Ranger mobilier", "Vider cendriers", "Fermer parasol / BBQ", "Vérifier portail / portillon"] },
    ],
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto" : "sm:max-w-[600px] w-[95vw] max-h-[85vh]"}
          hideCloseButton={isFullScreenMode}
        >
          <DialogHeader>
            {!isFullScreenMode && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4 h-8 w-8"
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="pl-10">
              <DialogTitle className="text-xl sm:text-2xl">
                Étape 3/5 - Choisir le modèle du parcours {filterType === "menage" ? "ménage" : "voyageur"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Sélectionnez un modèle prédéfini ou créez le vôtre
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="grid gap-4 overflow-y-auto max-h-[55vh] px-1">
            {/* Modèles Check Easy */}
            {showMenageCheckEasy && (
              <Card 
                className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              onClick={() => {
                onSelectMenage();
              }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🧹</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Ménage Check Easy</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Modèle optimisé pour le suivi du ménage avec checklist complète
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                    onClick={(e) => handlePreviewClick(e, "menage")}
                  >
                    <Eye className="h-4 w-4" />
                    Voir les tâches
                  </Button>
                </div>
              </Card>
            )}

            {showVoyageurCheckEasy && (
              <Card 
                className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              onClick={() => {
                onSelectVoyageur();
              }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">✈️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Voyageur Check Easy</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Modèle pour l'accueil voyageurs avec vérifications essentielles
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                    onClick={(e) => handlePreviewClick(e, "voyageur")}
                  >
                    <Eye className="h-4 w-4" />
                    Voir les tâches
                  </Button>
                </div>
              </Card>
            )}

            {/* Modèles personnalisés */}
            {filteredCustomModeles.length > 0 && (
              <>
                <div className="flex items-center gap-3 my-2">
                  <Separator className="flex-1" />
                  <span className="text-sm text-muted-foreground font-medium">Vos modèles personnalisés</span>
                  <Separator className="flex-1" />
                </div>

                {filteredCustomModeles.map((modele) => (
                  <Card 
                    key={modele.id}
                    className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group relative"
                    onClick={() => {
                    if (onSelectCustom) {
                      onSelectCustom(modele);
                    }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{getModeleEmoji(modele.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{modele.nom}</h3>
                          <Badge variant="secondary" className="text-xs">Personnalisé</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {modele.pieces.length} pièce{modele.pieces.length > 1 ? 's' : ''} • {getTotalTaches(modele)} tâche{getTotalTaches(modele) > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Modifié {formatDistanceToNow(new Date(modele.updatedAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {onEditCustom && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCustom(modele);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteCustom && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteClick(e, modele)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Créer un modèle personnalisé */}
            <Card 
              className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all border-dashed"
              onClick={() => {
                onCreateCustom(filterType || "menage");
                onOpenChange(false);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Créer son propre modèle {filterType === "menage" ? "ménage" : "voyageur"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configurez un modèle personnalisé selon vos besoins
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le modèle personnalisé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le modèle "{modeleToDelete?.nom}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aperçu des tâches */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{previewType === "menage" ? "🧹" : "✈️"}</span>
              Aperçu du modèle {previewType === "menage" ? "Ménage" : "Voyageur"} Check Easy
            </DialogTitle>
            <DialogDescription>
              Voici toutes les tâches disponibles dans ce modèle
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {TACHES_PREVIEW[previewType].map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-2">{section.piece}</h3>
                  <ul className="space-y-1.5 pl-4">
                    {section.taches.map((tache, tidx) => (
                      <li key={tidx} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tache}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
