import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AddLogementDialog } from "@/components/logements/AddLogementDialog";
import { CustomModeleBuilder } from "@/components/parcours/modele/CustomModeleBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParcoursModele } from "@/types/modele";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { dispatchWebhook, dispatchModeleWebhook, dispatchDeleteModeleWebhook, getConciergerieID, isTestMode, getLogementID, loadLogementFromBubble } from "@/utils/webhook";
import {
  loadModelesFromBubble,
  loadAndMergeModeles,
  saveModelesToLocalStorage,
  loadModelesFromLocalStorage
} from "@/utils/loadModeles";
import { RefreshCw } from "lucide-react";

function App() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customModeles, setCustomModeles] = useState<ParcoursModele[]>([]);
  const [logements, setLogements] = useState<any[]>([]);
  const [customModeleBuilderOpen, setCustomModeleBuilderOpen] = useState(false);
  const [customModeleType, setCustomModeleType] = useState<"menage" | "voyageur">("menage");
  const [editingModele, setEditingModele] = useState<ParcoursModele | undefined>(undefined);
  const [shouldReopenModeleDialog, setShouldReopenModeleDialog] = useState(false);
  const [isLoadingModeles, setIsLoadingModeles] = useState(false);
  const { toast } = useToast();

  // Détecter le mode plein écran depuis l'URL
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [viewModeFromURL, setViewModeFromURL] = useState(false);

  // Stocker les données du logement chargé depuis l'URL
  const [initialLogementData, setInitialLogementData] = useState<any>(null);

  // Détecter le viewmode depuis l'URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewMode = params.get('viewmode');
    if (viewMode === 'full') {
      setViewModeFromURL(true);
      setIsFullScreenMode(true);
      setDialogOpen(true); // Ouvrir automatiquement la modal
    }
  }, []);

  // Détecter les changements de taille d'écran pour adapter le mode fullscreen
  useEffect(() => {
    // Ne s'applique que si viewmode=full est dans l'URL
    if (!viewModeFromURL) return;

    const handleResize = () => {
      // Détecter si on est en mode mobile/responsive (< 640px = breakpoint sm de Tailwind)
      const isMobile = window.innerWidth < 640;

      // En mode viewmode=full, on reste toujours en fullscreen
      // mais on peut ajuster certains comportements si nécessaire
      setIsFullScreenMode(true);

      console.log(`📱 Resize détecté: ${window.innerWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`);
    };

    // Écouter les changements de taille
    window.addEventListener('resize', handleResize);

    // Appeler une fois au montage
    handleResize();

    // Nettoyer l'écouteur
    return () => window.removeEventListener('resize', handleResize);
  }, [viewModeFromURL]);

  // Charger le logement depuis l'URL si le paramètre logementid est présent
  useEffect(() => {
    const logementId = getLogementID();
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VÉRIFICATION DU PARAMÈTRE logementid DANS L\'URL');
    console.log('='.repeat(60));
    console.log(`   URL actuelle: ${window.location.href}`);
    console.log(`   Query string: ${window.location.search}`);
    console.log(`   logementid extrait: ${logementId || 'NON TROUVÉ'}`);
    console.log('='.repeat(60) + '\n');

    if (logementId) {
      const loadLogement = async () => {
        try {
          console.log("✅ Paramètre logementid détecté, chargement en cours...");
          const response = await loadLogementFromBubble(logementId, isTestMode());

          // Extraire les données du logement de la réponse
          if (response?.status === 'success' && response?.response?.logement) {
            const logementData = response.response.logement;

            // Préparer les données pour le formulaire
            // Le champ "link" contient l'URL Airbnb si présent (minuscule dans la réponse Bubble)
            setInitialLogementData({
              nom: logementData.Nom || '',
              // Note: L'adresse n'est pas dans la réponse actuelle, on la laisse vide
              adresse: '',
              // Récupérer le lien Airbnb depuis le champ link (minuscule)
              airbnbLink: logementData.link || '',
            });

            console.log("🔗 Lien Airbnb récupéré:", logementData.link || 'Aucun');

            // Ouvrir automatiquement le dialog
            setDialogOpen(true);

            toast({
              title: "Logement chargé",
              description: `Les données du logement "${logementData.Nom}" ont été chargées.`,
            });
          } else {
            console.warn("⚠️ Logement non trouvé ou réponse invalide");
          }
        } catch (error: any) {
          // Si le logement n'existe pas (erreur 400), ne pas afficher de toast d'erreur
          if (error?.message?.includes('400') || error?.message?.includes('does not exist')) {
            console.warn(`⚠️ Le logement ${logementId} n'existe pas dans Bubble.io`);
          } else {
            console.error("❌ Erreur lors du chargement du logement:", error);
            toast({
              title: "Erreur de chargement",
              description: "Impossible de charger les données du logement.",
              variant: "destructive",
            });
          }
        }
      };
      loadLogement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuter une seule fois au démarrage - toast est stable

  // Charger les modèles au démarrage de l'application
  useEffect(() => {
    const loadModeles = async () => {
      setIsLoadingModeles(true);
      try {
        console.log("🚀 Chargement des modèles au démarrage de l'application...");

        const conciergerieID = getConciergerieID();

        // Charger les modèles locaux pour cette conciergerie
        const localModeles = loadModelesFromLocalStorage(conciergerieID);

        // Charger et fusionner avec les modèles Bubble
        const mergedModeles = await loadAndMergeModeles(
          conciergerieID,
          localModeles,
          isTestMode()
        );

        // Mettre à jour l'état
        setCustomModeles(mergedModeles);

        // Sauvegarder dans le localStorage
        saveModelesToLocalStorage(mergedModeles, conciergerieID);

        console.log("✅ Modèles chargés avec succès");
      } catch (error) {
        console.error("❌ Erreur lors du chargement des modèles:", error);
        toast({
          title: t('toast.error'),
          description: t('toast.modelesLoadError'),
          variant: "destructive",
        });
      } finally {
        setIsLoadingModeles(false);
      }
    };

    loadModeles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuter une seule fois au démarrage - toast et t sont stables

  const handleComplete = (data: any) => {
    console.log("Logement créé:", data);
    // Generate a logementId if not present
    const logementId = `logement_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setLogements([...logements, { ...data, id: Date.now(), logementId }]);
    toast({
      title: t('toast.logementCreated'),
      description: `${t('logement.createNew')} "${data.nom}" ${t('toast.logementCreated').toLowerCase()}.`,
    });

    // En mode plein écran, rafraîchir la page après l'envoi du webhook
    if (isFullScreenMode) {
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Attendre 2 secondes pour que l'utilisateur voie le toast
    }
  };

  const handleCreateCustom = (parcoursType: "menage" | "voyageur") => {
    console.log("Créer un modèle personnalisé:", parcoursType);
    setCustomModeleType(parcoursType);
    setEditingModele(undefined);
    setDialogOpen(false);
    setCustomModeleBuilderOpen(true);
  };

  const handleSaveCustomModele = async (modele: ParcoursModele) => {
    console.log("Modèle personnalisé sauvegardé:", modele);

    let updatedModeles: ParcoursModele[];
    const isUpdate = !!editingModele;

    if (isUpdate) {
      // Mise à jour d'un modèle existant
      updatedModeles = customModeles.map(m => m.id === modele.id ? modele : m);
      setCustomModeles(updatedModeles);
    } else {
      // Création d'un nouveau modèle
      updatedModeles = [...customModeles, modele];
      setCustomModeles(updatedModeles);
    }

    // Send webhook to Bubble.io (for both create and update)
    try {
      console.log(`📤 Sending ${isUpdate ? 'update' : 'create'} webhook for modele: ${modele.nom}`);
      const webhookResult = await dispatchModeleWebhook(modele);

      if (webhookResult.success) {
        console.log('✅ Modèle webhook sent successfully');
      } else {
        console.error('⚠️ Modèle webhook failed');
      }
    } catch (error) {
      console.error('❌ Error sending modele webhook:', error);
    }

    // Sauvegarder dans le localStorage
    saveModelesToLocalStorage(updatedModeles, getConciergerieID());

    setCustomModeleBuilderOpen(false);
    setEditingModele(undefined);
    setShouldReopenModeleDialog(true);
    setDialogOpen(true);
  };

  // Fonction pour recharger manuellement les modèles depuis Bubble.io
  const handleReloadModeles = async () => {
    setIsLoadingModeles(true);
    try {
      console.log("🔄 Rechargement manuel des modèles...");

      const conciergerieID = getConciergerieID();
      const bubbleModeles = await loadModelesFromBubble(conciergerieID, isTestMode());

      setCustomModeles(bubbleModeles);
      saveModelesToLocalStorage(bubbleModeles, conciergerieID);

      toast({
        title: "Modèles rechargés !",
        description: `${bubbleModeles.length} modèle(s) chargé(s) depuis Bubble.io.`,
      });
    } catch (error) {
      console.error("❌ Erreur lors du rechargement des modèles:", error);
      toast({
        title: "Erreur de rechargement",
        description: "Impossible de recharger les modèles depuis Bubble.io.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingModeles(false);
    }
  };

  const handleDeleteCustom = async (modeleId: string) => {
    const modele = customModeles.find(m => m.id === modeleId);

    // Remove from local state
    const updatedModeles = customModeles.filter(m => m.id !== modeleId);
    setCustomModeles(updatedModeles);

    // Save to localStorage
    saveModelesToLocalStorage(updatedModeles, getConciergerieID());

    // Show success toast
    toast({
      title: "Modèle supprimé",
      description: `Le modèle "${modele?.nom}" a été supprimé.`,
    });

    // Send delete webhook to Bubble.io
    try {
      console.log(`🗑️ Sending delete webhook for modele: ${modele?.nom} (ID: ${modeleId})`);
      const result = await dispatchDeleteModeleWebhook(modeleId);

      if (result.success) {
        console.log('✅ Delete webhook sent successfully');
      } else {
        console.error('⚠️ Delete webhook failed, but modele was removed locally');
      }
    } catch (error) {
      console.error('❌ Error sending delete webhook:', error);
      // Don't show error to user since the modele was already removed locally
    }
  };

  const handleEditCustom = (modele: ParcoursModele) => {
    setEditingModele(modele);
    setCustomModeleType(modele.type);
    setDialogOpen(false);
    setCustomModeleBuilderOpen(true);
  };

  const handleModeleDialogReopened = () => {
    setShouldReopenModeleDialog(false);
  };

  const handleResendWebhook = async (logement: any) => {
    try {
      const result = await dispatchWebhook({
        nom: logement.nom,
        adresse: logement.adresse,
        airbnbLink: logement.airbnbLink,
        parcoursType: logement.parcoursType,
        modele: logement.modele,
        pieces: logement.pieces,
        piecesPhotos: logement.piecesPhotos,
        logementId: logement.logementId, // Use existing ID
      });

      if (result.success) {
        toast({
          title: "Webhook envoyé !",
          description: `Le webhook pour "${logement.nom}" a été renvoyé avec succès.`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Échec de l'envoi du webhook.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du webhook.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={isFullScreenMode ? "relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100" : "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8"}>
      {!isFullScreenMode && (
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          <div className="text-center space-y-2 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              {t('app.title')}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 px-4">
              {t('app.description')}
            </p>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{t('logement.createNew')}</CardTitle>
              <CardDescription className="text-sm">
                {t('logement.basicInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={() => setDialogOpen(true)} size="lg" className="w-full sm:w-auto">
                {t('logement.createNew')}
              </Button>
              <Button
                onClick={handleReloadModeles}
                size="lg"
                variant="outline"
                disabled={isLoadingModeles}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingModeles ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoadingModeles ? t('common.loading') : t('modele.create')}</span>
                <span className="sm:hidden">{isLoadingModeles ? t('common.loading') : t('modele.create')}</span>
              </Button>
            </CardContent>
          </Card>

          {logements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{t('logement.createNew')} ({logements.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {logements.map((logement) => (
                    <div
                      key={logement.id}
                      className="p-3 sm:p-4 border rounded-lg bg-white space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-semibold text-base sm:text-lg">{logement.nom}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm text-slate-500">
                            {logement.parcoursType === "menage" ? `🧹 ${t('parcours.menage')}` : `✈️ ${t('parcours.voyageur')}`}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendWebhook(logement)}
                            className="gap-1 text-xs sm:text-sm"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span className="hidden sm:inline">Relancer webhook</span>
                            <span className="sm:hidden">Relancer</span>
                          </Button>
                        </div>
                      </div>
                      {logement.adresse && (
                        <p className="text-xs sm:text-sm text-slate-600">📍 {logement.adresse}</p>
                      )}
                      <div className="text-xs sm:text-sm text-slate-600">
                        <strong>Pièces:</strong> {logement.pieces.map((p: any) => `${p.nom} (${p.quantite})`).join(", ")}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600">
                        <strong>Photos:</strong> {Object.values(logement.piecesPhotos).flat().length} photo(s)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <AddLogementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customModeles={customModeles}
        onDeleteCustom={handleDeleteCustom}
        onEditCustom={handleEditCustom}
        onCreateCustom={handleCreateCustom}
        onComplete={handleComplete}
        shouldReopenModeleDialog={shouldReopenModeleDialog}
        onModeleDialogReopened={handleModeleDialogReopened}
        isFullScreenMode={isFullScreenMode}
        initialLogementData={initialLogementData}
      />

      <CustomModeleBuilder
        open={customModeleBuilderOpen}
        onOpenChange={setCustomModeleBuilderOpen}
        onSave={handleSaveCustomModele}
        onBack={() => {
          setCustomModeleBuilderOpen(false);
          setShouldReopenModeleDialog(true);
          setDialogOpen(true);
        }}
        parcoursType={customModeleType}
        editingModele={editingModele}
        isFullScreenMode={isFullScreenMode}
      />

      {/* Ne pas afficher les toasts en mode viewmode=full */}
      {!viewModeFromURL && <Toaster />}
    </div>
  );
}

export default App;

