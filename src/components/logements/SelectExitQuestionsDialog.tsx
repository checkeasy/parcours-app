import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, X, Plus, Pencil, Trash2 } from "lucide-react";
import { QuestionModele } from "@/types/modele";
import { QuestionDialog } from "@/components/parcours/dialogs/QuestionDialog";

interface SelectExitQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logementNom: string;
  parcoursType: "menage" | "voyageur";
  modeleQuestions?: QuestionModele[]; // Questions du modèle de conciergerie pour pré-sélection
  onSave: (questions: QuestionModele[]) => void;
  onBack?: () => void;
  isFullScreenMode?: boolean;
}

// Helper function to load default questions from translations
const loadQuestionsFromTranslations = (t: any, parcoursType: "menage" | "voyageur"): QuestionModele[] => {
  const questionIds = ["q1", "q2", "q3", "q4", "q5", "q6"];
  const questions: QuestionModele[] = [];

  const questionMetadata: Record<string, Record<string, { type: "oui-non" | "ouverte", obligatoire: boolean, photoObligatoire?: boolean }>> = {
    "menage": {
      "q1": { type: "oui-non", obligatoire: true },
      "q2": { type: "oui-non", obligatoire: true },
      "q3": { type: "ouverte", obligatoire: false },
      "q4": { type: "ouverte", obligatoire: false },
      "q5": { type: "oui-non", obligatoire: true, photoObligatoire: true },
      "q6": { type: "oui-non", obligatoire: true }
    },
    "voyageur": {
      "q1": { type: "oui-non", obligatoire: true },
      "q2": { type: "oui-non", obligatoire: true },
      "q3": { type: "oui-non", obligatoire: true },
      "q4": { type: "ouverte", obligatoire: false },
      "q5": { type: "oui-non", obligatoire: true, photoObligatoire: true },
      "q6": { type: "oui-non", obligatoire: true }
    }
  };

  questionIds.forEach(id => {
    const intitule = t(`defaultQuestions.${parcoursType}.${id}`);
    const metadata = questionMetadata[parcoursType][id];

    if (intitule && metadata) {
      questions.push({
        id,
        intitule,
        type: metadata.type,
        obligatoire: metadata.obligatoire,
        ...(metadata.photoObligatoire && { photoObligatoire: metadata.photoObligatoire })
      });
    }
  });

  return questions;
};

export default function SelectExitQuestionsDialog({
  open,
  onOpenChange,
  logementNom,
  parcoursType,
  modeleQuestions = [],
  onSave,
  onBack,
  isFullScreenMode = false,
}: SelectExitQuestionsDialogProps) {
  const { t } = useTranslation();

  // Questions par défaut
  const defaultQuestions = loadQuestionsFromTranslations(t, parcoursType);

  // État pour les questions sélectionnées (IDs des questions par défaut)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // État pour les questions personnalisées
  const [customQuestions, setCustomQuestions] = useState<QuestionModele[]>([]);

  // État pour les questions par défaut modifiées
  const [editedDefaultQuestions, setEditedDefaultQuestions] = useState<Map<string, QuestionModele>>(new Map());

  // Dialog pour ajouter/modifier une question
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionModele | undefined>();

  // Flag pour éviter la réinitialisation à chaque re-render
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser les questions depuis le modèle UNIQUEMENT à l'ouverture
  useEffect(() => {
    if (open && !isInitialized) {
      const selectedSet = new Set<string>();
      const customQs: QuestionModele[] = [];

      modeleQuestions.forEach(q => {
        const isDefault = defaultQuestions.find(dq => dq.id === q.id);
        if (isDefault) {
          selectedSet.add(q.id);
        } else {
          customQs.push(q);
        }
      });

      setSelectedQuestions(selectedSet);
      setCustomQuestions(customQs);
      setIsInitialized(true);
    }

    // Reset isInitialized quand le dialog se ferme
    if (!open) {
      setIsInitialized(false);
    }
  }, [open, isInitialized]);

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAddQuestion = () => {
    setCurrentQuestion(undefined);
    setQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: QuestionModele) => {
    setCurrentQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleSaveQuestion = (questionData: Omit<QuestionModele, "id">) => {
    if (currentQuestion) {
      // Vérifier si c'est une question par défaut
      const isDefaultQuestion = defaultQuestions.find(q => q.id === currentQuestion.id);

      if (isDefaultQuestion) {
        // Modifier une question par défaut - la stocker dans editedDefaultQuestions
        setEditedDefaultQuestions(prev => {
          const newMap = new Map(prev);
          newMap.set(currentQuestion.id, { ...questionData, id: currentQuestion.id });
          return newMap;
        });
      } else {
        // Modifier une question personnalisée
        setCustomQuestions(prev =>
          prev.map(q => q.id === currentQuestion.id ? { ...questionData, id: currentQuestion.id } : q)
        );
      }
    } else {
      // Ajouter une nouvelle question
      const newQuestion: QuestionModele = {
        ...questionData,
        id: `q-${Date.now()}`
      };
      setCustomQuestions(prev => [...prev, newQuestion]);
    }
  };

  const handleSave = () => {
    // Combiner les questions par défaut sélectionnées (avec modifications si applicable) et les questions personnalisées
    const selectedDefaults = defaultQuestions
      .filter(q => selectedQuestions.has(q.id))
      .map(q => editedDefaultQuestions.get(q.id) || q); // Utiliser la version modifiée si elle existe
    const allQuestions = [...selectedDefaults, ...customQuestions];
    onSave(allQuestions);
  };

  const totalQuestions = selectedQuestions.size + customQuestions.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={isFullScreenMode ? "!absolute !inset-0 !w-full !h-full !max-w-none !max-h-none !m-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 overflow-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 gap-1 sm:gap-2" : "sm:max-w-[700px] w-[calc(100vw-2rem)] max-w-[95vw] max-h-[90vh] sm:max-h-[85vh]"}
          hideCloseButton
        >
          <DialogHeader className={isFullScreenMode ? "pb-0" : ""}>
            {onBack && (
              <div
                className="absolute left-3 top-3 sm:left-4 sm:top-4 h-8 w-8 z-50 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBack();
                }}
                style={{ touchAction: 'none' }}
              >
                <ArrowLeft className="h-4 w-4" />
              </div>
            )}
            <div
              className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 z-50 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}
              style={{ touchAction: 'none' }}
            >
              <X className="h-4 w-4" />
            </div>
            <div className="pl-8 sm:pl-10 pr-8">
              <DialogTitle className={isFullScreenMode ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"}>
                Étape 5/6 - Les questions de sortie
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1">
                Pour {logementNom} - {parcoursType === "menage" ? "Ménage" : "Voyageur"}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className={isFullScreenMode ? "space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-260px)] px-1" : "space-y-3 sm:space-y-4 overflow-y-auto max-h-[55vh] sm:max-h-[50vh] px-1"}>
            {/* Questions par défaut */}
            <Card className="p-3 sm:p-4">
              <h3 className="font-semibold text-sm sm:text-base mb-3">Questions par défaut</h3>
              <div className="space-y-2">
                {defaultQuestions.map((question) => {
                  // Utiliser la version modifiée si elle existe
                  const displayQuestion = editedDefaultQuestions.get(question.id) || question;

                  return (
                    <div
                      key={question.id}
                      className="flex items-start gap-2 p-2 border rounded-lg group"
                    >
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={() => handleToggleQuestion(question.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm">{displayQuestion.intitule}</div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {displayQuestion.photoObligatoire && (
                            <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">📷 Photo</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {displayQuestion.type === "oui-non" ? "Oui/Non" : displayQuestion.type === "ouverte" ? "Ouverte" : displayQuestion.type}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditQuestion(displayQuestion);
                        }}
                        style={{ touchAction: 'none' }}
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Questions personnalisées */}
            {customQuestions.length > 0 && (
              <Card className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base mb-3">Questions personnalisées</h3>
                <div className="space-y-2">
                  {customQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-2 p-2 border rounded-lg group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm">{question.intitule}</div>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {question.photoObligatoire && (
                            <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">📷 Photo</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.type === "oui-non" ? "Oui/Non" : question.type === "ouverte" ? "Ouverte" : question.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <div
                          className="h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditQuestion(question);
                          }}
                          style={{ touchAction: 'none' }}
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <div
                          className="h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                          style={{ touchAction: 'none' }}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Bouton pour ajouter une question personnalisée */}
            <div
              className="w-full h-9 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm font-medium"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddQuestion();
              }}
              style={{ touchAction: 'none' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question personnalisée
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {totalQuestions === 0 ? (
                  "Aucune question sélectionnée"
                ) : (
                  `${totalQuestions} question${totalQuestions > 1 ? 's' : ''} sélectionnée${totalQuestions > 1 ? 's' : ''}`
                )}
              </p>
              <div
                className="h-9 px-4 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium w-full sm:w-auto cursor-pointer"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
                style={{ touchAction: 'none' }}
              >
                Continuer
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter/modifier une question */}
      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        onSave={handleSaveQuestion}
        question={currentQuestion}
      />
    </>
  );
}

