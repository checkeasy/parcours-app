import { useState, useEffect } from "react";
import { AddLogementDialog } from "@/components/logements/AddLogementDialog";
import { CustomModeleBuilder } from "@/components/parcours/modele/CustomModeleBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParcoursModele } from "@/types/modele";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { dispatchWebhook, dispatchModeleWebhook } from "@/utils/webhook";
import {
  loadModelesFromBubble,
  loadAndMergeModeles,
  saveModelesToLocalStorage,
  loadModelesFromLocalStorage
} from "@/utils/loadModeles";
import { RefreshCw } from "lucide-react";

// Configuration de la conciergerie (à remplacer par la vraie valeur de l'utilisateur connecté)
const CONCIERGERIE_ID = "1730741276842x778024514623373300";
const IS_TEST_MODE = true; // Mode test par défaut

function App() {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewMode = params.get('viewmode');
    if (viewMode === 'full') {
      setIsFullScreenMode(true);
      setDialogOpen(true); // Ouvrir automatiquement la modal
    }
  }, []);

  // Charger les modèles au démarrage de l'application
  useEffect(() => {
    const loadModeles = async () => {
      setIsLoadingModeles(true);
      try {
        console.log("🚀 Chargement des modèles au démarrage de l'application...");

        // Charger les modèles locaux
        const localModeles = loadModelesFromLocalStorage();

        // Charger et fusionner avec les modèles Bubble
        const mergedModeles = await loadAndMergeModeles(
          CONCIERGERIE_ID,
          localModeles,
          IS_TEST_MODE
        );

        // Mettre à jour l'état
        setCustomModeles(mergedModeles);

        // Sauvegarder dans le localStorage
        saveModelesToLocalStorage(mergedModeles);

        console.log("✅ Modèles chargés avec succès");
      } catch (error) {
        console.error("❌ Erreur lors du chargement des modèles:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les modèles depuis Bubble.io. Utilisation des modèles locaux.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingModeles(false);
      }
    };

    loadModeles();
  }, []); // Exécuter une seule fois au démarrage

  const handleComplete = (data: any) => {
    console.log("Logement créé:", data);
    // Generate a logementId if not present
    const logementId = `logement_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setLogements([...logements, { ...data, id: Date.now(), logementId }]);
    toast({
      title: "Logement créé !",
      description: `Le logement "${data.nom}" a été créé avec succès.`,
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

    if (editingModele) {
      // Mise à jour d'un modèle existant
      updatedModeles = customModeles.map(m => m.id === modele.id ? modele : m);
      setCustomModeles(updatedModeles);
      toast({
        title: "Modèle mis à jour !",
        description: `Le modèle "${modele.nom}" a été mis à jour avec succès.`,
      });
    } else {
      // Création d'un nouveau modèle
      updatedModeles = [...customModeles, modele];
      setCustomModeles(updatedModeles);

      // Send webhook to Bubble.io
      const webhookResult = await dispatchModeleWebhook(modele);

      if (webhookResult.success) {
        toast({
          title: "Modèle créé !",
          description: `Le modèle "${modele.nom}" a été créé avec succès et envoyé à Bubble.`,
        });
      } else {
        toast({
          title: "Modèle créé localement",
          description: `Le modèle "${modele.nom}" a été créé mais l'envoi à Bubble a échoué.`,
          variant: "destructive",
        });
      }
    }

    // Sauvegarder dans le localStorage
    saveModelesToLocalStorage(updatedModeles);

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

      const bubbleModeles = await loadModelesFromBubble(CONCIERGERIE_ID, IS_TEST_MODE);

      setCustomModeles(bubbleModeles);
      saveModelesToLocalStorage(bubbleModeles);

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

  const handleDeleteCustom = (modeleId: string) => {
    const modele = customModeles.find(m => m.id === modeleId);
    setCustomModeles(customModeles.filter(m => m.id !== modeleId));
    toast({
      title: "Modèle supprimé",
      description: `Le modèle "${modele?.nom}" a été supprimé.`,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            Démo AddLogementDialog
          </h1>
          <p className="text-lg text-slate-600">
            Modal complète pour ajouter un logement avec parcours de ménage ou voyageur
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Tester la modal</CardTitle>
            <CardDescription>
              Cliquez sur le bouton ci-dessous pour ouvrir la modal d'ajout de logement
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => setDialogOpen(true)} size="lg">
              Ajouter un logement
            </Button>
            <Button
              onClick={handleReloadModeles}
              size="lg"
              variant="outline"
              disabled={isLoadingModeles}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingModeles ? 'animate-spin' : ''}`} />
              {isLoadingModeles ? 'Chargement...' : 'Recharger les modèles'}
            </Button>
          </CardContent>
        </Card>

        {logements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Logements créés ({logements.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logements.map((logement) => (
                  <div
                    key={logement.id}
                    className="p-4 border rounded-lg bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{logement.nom}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                          {logement.parcoursType === "menage" ? "🧹 Ménage" : "✈️ Voyageur"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendWebhook(logement)}
                          className="gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Relancer webhook
                        </Button>
                      </div>
                    </div>
                    {logement.adresse && (
                      <p className="text-sm text-slate-600">📍 {logement.adresse}</p>
                    )}
                    <div className="text-sm text-slate-600">
                      <strong>Pièces:</strong> {logement.pieces.map((p: any) => `${p.nom} (${p.quantite})`).join(", ")}
                    </div>
                    <div className="text-sm text-slate-600">
                      <strong>Photos:</strong> {Object.values(logement.piecesPhotos).flat().length} photo(s)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
      />

      <Toaster />
    </div>
  );
}

export default App;

