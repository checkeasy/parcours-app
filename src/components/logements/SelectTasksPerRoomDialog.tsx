import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, X, Pencil, Plus } from "lucide-react";
import { TacheModele, PieceModele } from "@/types/modele";
import { TACHES_MENAGE, TACHES_VOYAGEUR } from "@/components/parcours/modele/CustomModeleBuilder";
import { TacheDialog } from "@/components/parcours/dialogs/TacheDialog";

export interface PieceQuantity {
  nom: string;
  quantite: number;
  id?: string;
  isCustom?: boolean;
}

interface SelectTasksPerRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  parcoursType: "menage" | "voyageur";
  selectedRooms: PieceQuantity[]; // Pièces sélectionnées à l'étape précédente
  modeleData?: PieceModele[]; // Données du modèle de conciergerie pour pré-sélection
  onSave: (tasksPerRoom: Map<string, string[]>) => void; // Map<nomPiece, tacheIds[]>
  onBack?: () => void;
  isFullScreenMode?: boolean;
}

export default function SelectTasksPerRoomDialog({
  open,
  onOpenChange,
  logementNom,
  parcoursType,
  selectedRooms,
  modeleData = [],
  onSave,
  onBack,
  isFullScreenMode = false,
}: SelectTasksPerRoomDialogProps) {
  const { t } = useTranslation();

  // Map pour stocker les tâches sélectionnées par type de pièce
  const [selectedTasksPerRoom, setSelectedTasksPerRoom] = useState<Map<string, string[]>>(new Map());

  // Map pour stocker les tâches personnalisées par pièce
  const [customTasksPerRoom, setCustomTasksPerRoom] = useState<Map<string, TacheModele[]>>(new Map());

  // État pour le dialog d'édition/ajout de tâche
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ roomName: string; task?: TacheModele } | null>(null);

  // Obtenir les tâches disponibles pour une pièce (tâches par défaut + tâches personnalisées)
  const getTasksForRoom = (roomName: string): TacheModele[] => {
    const tasksSource = parcoursType === "menage" ? TACHES_MENAGE : TACHES_VOYAGEUR;
    const defaultTasks = tasksSource[roomName] || [];
    const customTasks = customTasksPerRoom.get(roomName) || [];
    return [...defaultTasks, ...customTasks];
  };

  // Initialiser les tâches sélectionnées depuis le modèle
  useEffect(() => {
    if (open) {
      const initialSelection = new Map<string, string[]>();
      
      // Obtenir les types de pièces uniques (sans les quantités)
      const uniqueRoomTypes = Array.from(new Set(selectedRooms.map(r => r.nom)));
      
      uniqueRoomTypes.forEach(roomName => {
        // Chercher les tâches pré-sélectionnées dans le modèle
        const modeleRoom = modeleData.find(p => p.nom === roomName);
        if (modeleRoom && modeleRoom.tachesSelectionnees.length > 0) {
          initialSelection.set(roomName, modeleRoom.tachesSelectionnees);
        } else {
          initialSelection.set(roomName, []);
        }
      });
      
      setSelectedTasksPerRoom(initialSelection);
    }
  }, [open, selectedRooms, modeleData]);

  const handleToggleTask = (roomName: string, taskId: string) => {
    setSelectedTasksPerRoom(prev => {
      const newMap = new Map(prev);
      const currentTasks = newMap.get(roomName) || [];
      
      if (currentTasks.includes(taskId)) {
        // Retirer la tâche
        newMap.set(roomName, currentTasks.filter(id => id !== taskId));
      } else {
        // Ajouter la tâche
        newMap.set(roomName, [...currentTasks, taskId]);
      }
      
      return newMap;
    });
  };

  const handleSave = () => {
    onSave(selectedTasksPerRoom);
  };

  // Handler pour éditer une tâche
  const handleEditTask = (roomName: string, task: TacheModele) => {
    setEditingTask({ roomName, task });
    setEditTaskDialogOpen(true);
  };

  // Handler pour ajouter une nouvelle tâche
  const handleAddTask = (roomName: string) => {
    setEditingTask({ roomName });
    setEditTaskDialogOpen(true);
  };

  // Handler pour sauvegarder une tâche éditée ou nouvelle
  const handleSaveTask = (updatedTask: Partial<TacheModele>) => {
    if (!editingTask) return;

    const { roomName, task: originalTask } = editingTask;

    if (originalTask) {
      // Édition d'une tâche existante
      const customTasks = customTasksPerRoom.get(roomName) || [];
      const customTaskIndex = customTasks.findIndex(t => t.id === originalTask.id);

      if (customTaskIndex !== -1) {
        // C'est une tâche personnalisée - la mettre à jour
        const newCustomTasks = new Map(customTasksPerRoom);
        const updatedCustomTasks = [...customTasks];
        updatedCustomTasks[customTaskIndex] = { ...originalTask, ...updatedTask } as TacheModele;
        newCustomTasks.set(roomName, updatedCustomTasks);
        setCustomTasksPerRoom(newCustomTasks);
      } else {
        // C'est une tâche par défaut - créer une version personnalisée
        const newTaskId = `custom-edited-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newTask: TacheModele = {
          id: newTaskId,
          emoji: updatedTask.emoji || originalTask.emoji,
          titre: updatedTask.titre || originalTask.titre,
          description: updatedTask.description || originalTask.description,
          photoObligatoire: updatedTask.photoObligatoire ?? originalTask.photoObligatoire,
          photoUrl: updatedTask.photoUrl,
        };

        // Ajouter aux tâches personnalisées
        const newCustomTasks = new Map(customTasksPerRoom);
        const existingCustomTasks = newCustomTasks.get(roomName) || [];
        newCustomTasks.set(roomName, [...existingCustomTasks, newTask]);
        setCustomTasksPerRoom(newCustomTasks);

        // Remplacer l'ancienne tâche par la nouvelle dans la sélection
        setSelectedTasksPerRoom(prev => {
          const newMap = new Map(prev);
          const selectedTasks = newMap.get(roomName) || [];
          const updatedSelection = selectedTasks.map(taskId =>
            taskId === originalTask.id ? newTaskId : taskId
          );
          newMap.set(roomName, updatedSelection);
          return newMap;
        });
      }
    } else {
      // Ajout d'une nouvelle tâche
      const newTaskId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newTask: TacheModele = {
        id: newTaskId,
        emoji: updatedTask.emoji || "📋",
        titre: updatedTask.titre || "",
        description: updatedTask.description || "",
        photoObligatoire: updatedTask.photoObligatoire || false,
        photoUrl: updatedTask.photoUrl,
      };

      // Ajouter aux tâches personnalisées
      const newCustomTasks = new Map(customTasksPerRoom);
      const existingCustomTasks = newCustomTasks.get(roomName) || [];
      newCustomTasks.set(roomName, [...existingCustomTasks, newTask]);
      setCustomTasksPerRoom(newCustomTasks);

      // Ajouter automatiquement à la sélection
      setSelectedTasksPerRoom(prev => {
        const newMap = new Map(prev);
        const selectedTasks = newMap.get(roomName) || [];
        newMap.set(roomName, [...selectedTasks, newTaskId]);
        return newMap;
      });
    }

    setEditTaskDialogOpen(false);
    setEditingTask(null);
  };

  // Obtenir les types de pièces uniques
  const uniqueRoomTypes = Array.from(new Set(selectedRooms.map(r => r.nom)));

  // Calculer le nombre total de tâches sélectionnées
  const totalSelectedTasks = Array.from(selectedTasksPerRoom.values()).reduce(
    (sum, tasks) => sum + tasks.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "sm:max-w-[700px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
        hideCloseButton
      >
        <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 z-50"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
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
              Étape 4/6 - Sélectionnez les tâches pour chaque pièce
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-1">
              Pour {logementNom} - {parcoursType === "menage" ? "Ménage" : "Voyageur"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className={isFullScreenMode ? "space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-260px)] px-1" : "space-y-3 sm:space-y-4 overflow-y-auto max-h-[55vh] sm:max-h-[50vh] px-1"}>
          {uniqueRoomTypes.map((roomName) => {
            const tasks = getTasksForRoom(roomName);
            const selectedTasks = selectedTasksPerRoom.get(roomName) || [];
            const roomQuantity = selectedRooms.find(r => r.nom === roomName)?.quantite || 1;

            return (
              <Card key={roomName} className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base">{roomName}</h3>
                    {roomQuantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        x{roomQuantity}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedTasks.length} / {tasks.length}
                  </Badge>
                </div>

                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Aucune tâche disponible pour cette pièce
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 p-2 hover:bg-accent/50 rounded transition-colors group"
                      >
                        <Checkbox
                          id={`task-${roomName}-${task.id}`}
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => handleToggleTask(roomName, task.id)}
                          className="mt-0.5 shrink-0"
                        />
                        <Label
                          htmlFor={`task-${roomName}-${task.id}`}
                          className="flex-1 cursor-pointer min-w-0"
                        >
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-base">{task.emoji}</span>
                            <span className="font-medium text-xs sm:text-sm">{task.titre}</span>
                            {task.photoObligatoire && (
                              <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">
                                📷 Photo requise
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditTask(roomName, task);
                          }}
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton pour ajouter une tâche */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => handleAddTask(roomName)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une tâche
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalSelectedTasks === 0 ? (
                "Aucune tâche sélectionnée"
              ) : (
                `${totalSelectedTasks} tâche${totalSelectedTasks > 1 ? 's' : ''} sélectionnée${totalSelectedTasks > 1 ? 's' : ''}`
              )}
            </p>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Continuer
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dialog pour éditer/ajouter une tâche */}
      <TacheDialog
        open={editTaskDialogOpen}
        onOpenChange={setEditTaskDialogOpen}
        tache={editingTask?.task}
        pieceNom={editingTask?.roomName || ""}
        onSave={handleSaveTask}
      />
    </Dialog>
  );
}

