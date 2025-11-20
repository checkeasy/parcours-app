import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Trash2, ArrowLeft, Pencil, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ParcoursModele } from "@/types/modele";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, pt, es, ar, de } from "date-fns/locale";
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
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeleToDelete, setModeleToDelete] = useState<ParcoursModele | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"menage" | "voyageur">("menage");

  // Get date-fns locale based on current language
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS;
      case 'pt': return pt;
      case 'es': return es;
      case 'ar': return ar;
      case 'de': return de;
      default: return fr;
    }
  };

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

  // Calculate stats for Check Easy models
  const getCheckEasyStats = (type: "menage" | "voyageur") => {
    const preview = TACHES_PREVIEW[type];
    const roomCount = preview.length;
    const totalTasks = preview.reduce((sum, room) => sum + room.taches.length, 0);
    return { roomCount, totalTasks };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={isFullScreenMode ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-auto p-3 sm:p-4 md:p-6 gap-1 sm:gap-2" : "sm:max-w-[600px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
          hideCloseButton
        >
          <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 z-50"
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
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 z-50"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="pl-8 sm:pl-10 pr-8">
              <DialogTitle className={isFullScreenMode ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"}>
                {t('logement.step', { current: 3, total: 5 })} - {t('modele.chooseModel')} {filterType === "menage" ? t('parcours.menage') : t('parcours.voyageur')}
              </DialogTitle>
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-base sm:text-lg shrink-0">💡</span>
                  <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                    {t('modele.workflowExplanation')}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className={isFullScreenMode ? "grid gap-3 sm:gap-4 overflow-y-auto max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-180px)] px-1" : "grid gap-3 sm:gap-4 overflow-y-auto max-h-[60vh] sm:max-h-[55vh] px-1"}>
            {/* Modèles Check Easy */}
            {showMenageCheckEasy && (() => {
              const stats = getCheckEasyStats("menage");
              return (
                <Card
                  className="p-3 sm:p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group active:scale-[0.98]"
                onClick={() => {
                  onSelectMenage();
                }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="text-2xl sm:text-3xl">🧹</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{t('modele.menageCheckEasy')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t('modele.menageDescription')}
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-medium">
                          📍 {stats.roomCount} {t('modele.rooms', { count: stats.roomCount })}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-medium">
                          ✓ {stats.totalTasks} {t('modele.totalTasks', { count: stats.totalTasks })}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 shrink-0"
                      onClick={(e) => handlePreviewClick(e, "menage")}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden md:inline">{t('modele.viewTasks')}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="sm:hidden shrink-0"
                      onClick={(e) => handlePreviewClick(e, "menage")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })()}

            {showVoyageurCheckEasy && (() => {
              const stats = getCheckEasyStats("voyageur");
              return (
                <Card
                  className="p-3 sm:p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group active:scale-[0.98]"
                onClick={() => {
                  onSelectVoyageur();
                }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="text-2xl sm:text-3xl">✈️</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{t('modele.voyageurCheckEasy')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t('modele.voyageurDescription')}
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs font-medium">
                          📍 {stats.roomCount} {t('modele.rooms', { count: stats.roomCount })}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-medium">
                          ✓ {stats.totalTasks} {t('modele.totalTasks', { count: stats.totalTasks })}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 shrink-0"
                      onClick={(e) => handlePreviewClick(e, "voyageur")}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden md:inline">{t('modele.viewTasks')}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="sm:hidden shrink-0"
                      onClick={(e) => handlePreviewClick(e, "voyageur")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })()}

            {/* Modèles personnalisés */}
            {filteredCustomModeles.length > 0 && (
              <>
                <div className="flex items-center gap-2 sm:gap-3 my-2">
                  <Separator className="flex-1" />
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">{t('modele.yourCustomModels')}</span>
                  <Separator className="flex-1" />
                </div>

                {filteredCustomModeles.map((modele) => (
                  <Card
                    key={modele.id}
                    className="p-3 sm:p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group relative active:scale-[0.98]"
                    onClick={() => {
                    if (onSelectCustom) {
                      onSelectCustom(modele);
                    }
                    }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">{getModeleEmoji(modele.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base sm:text-lg">{modele.nom}</h3>
                          <Badge variant="secondary" className="text-xs">{t('modele.custom')}</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {modele.pieces.length} {t('pieces.title', { count: modele.pieces.length }).toLowerCase()} • {getTotalTaches(modele)} {t('airbnb.task', { count: getTotalTaches(modele) })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                          {t('modele.modified')} {formatDistanceToNow(new Date(modele.updatedAt), { addSuffix: true, locale: getDateLocale() })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {onEditCustom && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCustom(modele);
                            }}
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {onDeleteCustom && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDeleteClick(e, modele)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
              className="p-3 sm:p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all border-dashed active:scale-[0.98]"
              onClick={() => {
                onCreateCustom(filterType || "menage");
                onOpenChange(false);
              }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg">{t('modele.createOwn')} {filterType === "menage" ? t('parcours.menage') : t('parcours.voyageur')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t('modele.configureCustom')}
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
            <AlertDialogTitle>{t('modele.deleteCustomModel')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('modele.deleteConfirmation', { modelName: modeleToDelete?.nom })}
              {t('modele.irreversible')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.delete')}
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
              {t('modele.previewTitle')} {previewType === "menage" ? t('parcours.menage') : t('parcours.voyageur')} Check Easy
            </DialogTitle>
            <DialogDescription>
              {t('modele.allTasksAvailable')}
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
