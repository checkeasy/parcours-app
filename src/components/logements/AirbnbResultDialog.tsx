import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Grid3x3, List, Image as ImageIcon, CheckCircle2, Plus, ChevronDown, ChevronUp, ArrowLeft, X, Trash2, Upload, Eye, EyeOff, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { TacheModele, PIECES_STANDARDS, TACHES_PAR_PIECE, ParcoursModele } from "@/types/modele";

interface PieceData {
  nom: string;
  quantite: number;
  emoji: string;
  photos: string[];
  tasks?: TacheModele[];
  enabled?: boolean; // Nouvelle propriété pour activer/désactiver
}

// Mapping des emojis par type de pièce
const EMOJI_PAR_PIECE: Record<string, string> = {
  "Cuisine": "🍳",
  "Salle de bain (sans toilettes)": "🚿",
  "Salle de bain avec toilettes": "🛁",
  "Toilettes séparés": "🚽",
  "Chambre": "🛏️",
  "Salon / Séjour": "🛋️",
  "Salle à manger": "🍽️",
  "Entrée / Couloir / Escaliers": "🚪",
  "Buanderie / Laverie": "🧺",
  "Espaces extérieurs": "🌳",
  "Garage / Parking": "🚗",
  "Bureau / Pièce de travail": "💼",
  "À trier": "📂", // Photos non classées - à redistribuer par l'utilisateur
};

interface AirbnbResultDialogProps {
  open: boolean;
  logementNom: string;
  pieces: PieceData[];
  totalPhotos: number;
  selectedModele?: "menage" | "voyageur" | ParcoursModele | null;
  onConfirm: (pieces: PieceData[]) => void;
  onBack: () => void;
  onClose?: () => void;
  isFullScreenMode?: boolean;
}

export function AirbnbResultDialog({
  open,
  logementNom,
  pieces: initialPieces,
  totalPhotos: initialTotalPhotos,
  selectedModele,
  onConfirm,
  onBack,
  onClose,
  isFullScreenMode = false,
}: AirbnbResultDialogProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Changé de "grid" à "list"
  const [expandedPieces, setExpandedPieces] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pieces, setPieces] = useState<PieceData[]>([]);
  const [showAddPieceDialog, setShowAddPieceDialog] = useState(false);
  const [newPieceName, setNewPieceName] = useState("");
  const [newPieceEmoji, setNewPieceEmoji] = useState("🏠");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPieceForUpload, setCurrentPieceForUpload] = useState<number | null>(null);

  // Fonction helper pour obtenir les tâches du modèle pour une pièce donnée
  const getModeleTasks = (pieceName: string): TacheModele[] => {
    if (!selectedModele) return [];

    // Si c'est un modèle prédéfini ("menage" ou "voyageur"), utiliser TACHES_PAR_PIECE
    if (selectedModele === "menage" || selectedModele === "voyageur") {
      return TACHES_PAR_PIECE[pieceName] || [];
    }

    // Si c'est un modèle personnalisé, chercher dans ses pièces
    const pieceModele = selectedModele.pieces.find(p => p.nom === pieceName);
    if (!pieceModele) return [];

    // Retourner les tâches sélectionnées du modèle
    return pieceModele.tachesDisponibles.filter(t =>
      pieceModele.tachesSelectionnees.includes(t.id)
    );
  };

  // Réinitialiser l'état quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setViewMode("list"); // Changé de "grid" à "list"
      setExpandedPieces(new Set());
      setShowConfirmation(false);
      // Initialiser toutes les pièces comme activées
      setPieces(initialPieces.map(p => ({ ...p, enabled: true })));
    }
  }, [open, initialPieces]);

  // Gérer la fermeture automatique après confirmation
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        // Ne passer que les pièces activées avec les tâches du modèle
        const enabledPieces = pieces
          .filter(p => p.enabled !== false)
          .map(piece => ({
            ...piece,
            tasks: getModeleTasks(piece.nom) // Remplacer par les tâches du modèle
          }));
        onConfirm(enabledPieces);
      }, 3000); // 3 secondes

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmation, pieces, onConfirm]); // getModeleTasks dépend de selectedModele qui est stable

  const activePiecesCount = pieces.filter(p => p.enabled !== false).length;
  const totalPhotos = pieces.reduce((sum, piece) => {
    if (piece.enabled === false) return sum;
    return sum + piece.photos.length;
  }, 0);

  const togglePieceExpansion = (pieceName: string) => {
    const newExpanded = new Set(expandedPieces);
    if (newExpanded.has(pieceName)) {
      newExpanded.delete(pieceName);
    } else {
      newExpanded.add(pieceName);
    }
    setExpandedPieces(newExpanded);
  };

  const handleTerminer = () => {
    setShowConfirmation(true);
  };

  const togglePieceEnabled = (index: number) => {
    setPieces(prev => prev.map((p, i) =>
      i === index ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const deletePhoto = (pieceIndex: number, photoIndex: number) => {
    setPieces(prev => prev.map((p, i) => {
      if (i === pieceIndex) {
        const newPhotos = p.photos.filter((_, idx) => idx !== photoIndex);
        return { ...p, photos: newPhotos };
      }
      return p;
    }));
  };

  const handleAddPiece = () => {
    if (!newPieceName.trim()) return;

    // Récupérer les tâches correspondant au type de pièce sélectionné
    const tasksForPiece = TACHES_PAR_PIECE[newPieceName] || [];

    const newPiece: PieceData = {
      nom: newPieceName.trim(),
      quantite: 1,
      emoji: newPieceEmoji,
      photos: [],
      tasks: tasksForPiece,
      enabled: true
    };

    setPieces(prev => [...prev, newPiece]);
    setNewPieceName("");
    setNewPieceEmoji("🏠");
    setShowAddPieceDialog(false);
  };

  const handleFileUpload = (pieceIndex: number, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const readers = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setPieces(prev => prev.map((p, i) => {
        if (i === pieceIndex) {
          return { ...p, photos: [...p.photos, ...results] };
        }
        return p;
      }));
    });
  };

  const openFileUpload = (pieceIndex: number) => {
    setCurrentPieceForUpload(pieceIndex);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentPieceForUpload !== null) {
      handleFileUpload(currentPieceForUpload, e.target.files);
      setCurrentPieceForUpload(null);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto flex flex-col px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "w-[calc(100vw-2rem)] sm:w-full sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0"}
        hideCloseButton={isFullScreenMode}
      >
        {/* Input caché pour l'upload de fichiers */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {showConfirmation ? (
          // Page de confirmation
          <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12 px-3 sm:px-6">
            <div className="text-center space-y-4 sm:space-y-6 max-w-md">
              <div className="flex justify-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-success" />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold">{t('airbnb.validated')}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('airbnb.redirecting')}
                </p>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className={cn(
              "px-4 sm:px-8 md:px-12 lg:px-16 pt-3 sm:pt-6 pb-2 sm:pb-4",
              isFullScreenMode && "pb-2 sm:pb-4"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 sm:left-4 md:left-6 top-2 sm:top-4 h-8 w-8 sm:h-9 sm:w-9 z-50 hover:bg-accent"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 md:right-6 top-2 sm:top-4 h-8 w-8 sm:h-9 sm:w-9 z-50 hover:bg-accent"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="px-9 sm:px-12">
                <div className="space-y-1 sm:space-y-2">
                  <DialogTitle className="text-base sm:text-xl md:text-2xl leading-tight">
                    {t('logement.step', { current: 5, total: 5 })} - {t('airbnb.classification')}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm md:text-base leading-snug">
                    {t('airbnb.analysisResult', { piecesCount: activePiecesCount, photosCount: totalPhotos })}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Statistiques */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 sm:py-4 px-4 sm:px-8 md:px-12 lg:px-16 border-y bg-muted/30">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{t('airbnb.photosSelected')}</p>
                  <p className="text-sm sm:text-lg md:text-xl font-semibold">{totalPhotos}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{t('airbnb.activePieces')}</p>
                  <p className="text-sm sm:text-lg md:text-xl font-semibold">{activePiecesCount}</p>
                </div>
              </div>

              {/* Toggle vue grille/liste - masqué sur mobile */}
              <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1 bg-background shadow-sm flex-shrink-0">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                  title="Vue grille"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Bouton ajouter une pièce */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPieceDialog(true)}
                className="gap-2 flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t('airbnb.addRoom')}</span>
              </Button>
            </div>

            {/* Dialog pour ajouter une pièce */}
            {showAddPieceDialog && (
              <div className="absolute inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{t('airbnb.addRoom')}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAddPieceDialog(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">{t('airbnb.roomType')}</label>
                        <Select
                          value={newPieceName}
                          onValueChange={(value) => {
                            setNewPieceName(value);
                            // Mettre à jour l'emoji automatiquement selon le type de pièce
                            const emoji = EMOJI_PAR_PIECE[value] || "🏠";
                            setNewPieceEmoji(emoji);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={t('airbnb.selectRoomType')} />
                          </SelectTrigger>
                          <SelectContent>
                            {PIECES_STANDARDS.map((piece) => (
                              <SelectItem key={piece} value={piece}>
                                {EMOJI_PAR_PIECE[piece] || "🏠"} {piece}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t('airbnb.roomEmoji')}</label>
                        <div className="mt-1">
                          <EmojiPicker
                            value={newPieceEmoji}
                            onChange={setNewPieceEmoji}
                            placeholder="🏠"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddPieceDialog(false)}
                        className="min-w-[100px]"
                      >
                        {t('airbnb.cancel')}
                      </Button>
                      <Button
                        onClick={handleAddPiece}
                        disabled={!newPieceName.trim()}
                        className="min-w-[100px]"
                      >
                        {t('airbnb.add')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Liste des pièces */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-6">
              <div className={cn(
                "gap-3 sm:gap-4 md:gap-5",
                viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"
              )}>
                {pieces.map((piece, index) => {
                  const isExpanded = expandedPieces.has(piece.nom);
                  const taskCount = piece.tasks?.length || 0;
                  const isEnabled = piece.enabled !== false;
                  // Obtenir les tâches du modèle pour cette pièce
                  const modeleTasks = getModeleTasks(piece.nom);
                  const modeleTaskCount = modeleTasks.length;

                  return (
                    <Card key={index} className={cn(
                      "border-2 hover:shadow-md transition-shadow",
                      isEnabled ? "border-success/50 bg-success/5" : "border-muted bg-muted/30 opacity-60"
                    )}>
                      <CardContent className="p-3 sm:p-5 md:p-6">
                        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-5">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="text-xl sm:text-3xl md:text-4xl flex-shrink-0">{piece.emoji}</div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{piece.nom}</h3>
                              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                                {piece.photos.length} {t('airbnb.photo', { count: piece.photos.length })}
                                {modeleTaskCount > 0 && ` • ${modeleTaskCount} ${t('airbnb.task', { count: modeleTaskCount })}`}
                              </p>
                            </div>
                          </div>

                          {/* Actions - Version Desktop */}
                          <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFileUpload(index)}
                              className="h-8 w-8 p-0"
                              title={t('airbnb.addPhotos')}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePieceEnabled(index)}
                              className="h-8 w-8 p-0"
                              title={isEnabled ? t('airbnb.disable') : t('airbnb.enable')}
                            >
                              {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            {modeleTaskCount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePieceExpansion(piece.nom)}
                                className="gap-1 h-8 w-auto px-3"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                <span className="text-xs">{modeleTaskCount}</span>
                              </Button>
                            )}
                            <Badge variant={isEnabled ? "default" : "secondary"} className={cn(
                              "text-xs px-2 py-0.5 whitespace-nowrap",
                              isEnabled && "bg-success hover:bg-success/90"
                            )}>
                              {isEnabled ? t('airbnb.active') : t('airbnb.disabled')}
                            </Badge>
                          </div>

                          {/* Actions - Version Mobile (Menu dropdown) */}
                          <div className="flex sm:hidden items-center gap-2 flex-shrink-0">
                            <Badge variant={isEnabled ? "default" : "secondary"} className={cn(
                              "text-[9px] px-1.5 py-0.5",
                              isEnabled && "bg-success hover:bg-success/90"
                            )}>
                              {isEnabled ? '✓' : '✕'}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openFileUpload(index)}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  {t('airbnb.addPhotos')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => togglePieceEnabled(index)}>
                                  {isEnabled ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                  {isEnabled ? t('airbnb.disable') : t('airbnb.enable')}
                                </DropdownMenuItem>
                                {modeleTaskCount > 0 && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => togglePieceExpansion(piece.nom)}>
                                      {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                                      {isExpanded ? t('airbnb.hideTasks') : t('airbnb.showTasks')} ({modeleTaskCount})
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Grille de photos avec bouton de suppression */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                          {piece.photos.slice(0, 6).map((photo, photoIndex) => (
                            <div
                              key={photoIndex}
                              className="aspect-square rounded sm:rounded-lg overflow-hidden bg-muted ring-1 ring-border hover:ring-2 hover:ring-primary/50 transition-all relative group"
                            >
                              <img
                                src={photo}
                                alt={`${piece.nom} ${photoIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Bouton de suppression qui apparaît au survol */}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deletePhoto(index, photoIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {piece.photos.length > 6 && (
                            <div className="aspect-square rounded sm:rounded-lg bg-muted flex items-center justify-center ring-1 ring-border">
                              <span className="text-[10px] sm:text-sm md:text-base font-medium text-muted-foreground">
                                +{piece.photos.length - 6}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Liste des tâches (expandable) - Afficher les tâches du modèle */}
                        {isExpanded && modeleTaskCount > 0 && (
                          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t">
                            <h4 className="font-medium text-xs sm:text-sm md:text-base mb-3 sm:mb-4">{t('airbnb.associatedTasks')}</h4>
                            <div className="space-y-2 sm:space-y-3">
                              {modeleTasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-background/50 rounded-md sm:rounded-lg border border-border/50 hover:border-border transition-colors">
                                  <span className="text-base sm:text-lg md:text-xl flex-shrink-0">{task.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs sm:text-sm md:text-base">{task.titre}</p>
                                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">{task.description}</p>
                                    {task.photoObligatoire && (
                                      <Badge variant="secondary" className="text-[10px] sm:text-xs mt-1 sm:mt-2">
                                        📷 {t('airbnb.photoRequired')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Footer avec bouton terminer */}
            <div className="flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-5 md:pt-6 pb-4 sm:pb-5 md:pb-7 px-4 sm:px-8 md:px-12 lg:px-16 border-t bg-background">
              <Button onClick={handleTerminer} size="lg" className="w-full sm:w-auto sm:min-w-[160px] h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                {t('airbnb.finish')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
