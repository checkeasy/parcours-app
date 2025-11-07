import { useState } from "react";
import { AddLogementDialog } from "@/components/logements/AddLogementDialog";
import { CustomModeleBuilder } from "@/components/parcours/modele/CustomModeleBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParcoursModele } from "@/types/modele";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customModeles, setCustomModeles] = useState<ParcoursModele[]>([]);
  const [logements, setLogements] = useState<any[]>([]);
  const [customModeleBuilderOpen, setCustomModeleBuilderOpen] = useState(false);
  const [customModeleType, setCustomModeleType] = useState<"menage" | "voyageur">("menage");
  const [editingModele, setEditingModele] = useState<ParcoursModele | undefined>(undefined);
  const [shouldReopenModeleDialog, setShouldReopenModeleDialog] = useState(false);
  const { toast } = useToast();

  const handleComplete = (data: any) => {
    console.log("Logement créé:", data);
    setLogements([...logements, { ...data, id: Date.now() }]);
    toast({
      title: "Logement créé !",
      description: `Le logement "${data.nom}" a été créé avec succès.`,
    });
  };

  const handleCreateCustom = (parcoursType: "menage" | "voyageur") => {
    console.log("Créer un modèle personnalisé:", parcoursType);
    setCustomModeleType(parcoursType);
    setEditingModele(undefined);
    setDialogOpen(false);
    setCustomModeleBuilderOpen(true);
  };

  const handleSaveCustomModele = (modele: ParcoursModele) => {
    console.log("Modèle personnalisé sauvegardé:", modele);

    if (editingModele) {
      // Mise à jour d'un modèle existant
      setCustomModeles(customModeles.map(m => m.id === modele.id ? modele : m));
      toast({
        title: "Modèle mis à jour !",
        description: `Le modèle "${modele.nom}" a été mis à jour avec succès.`,
      });
    } else {
      // Création d'un nouveau modèle
      setCustomModeles([...customModeles, modele]);
      toast({
        title: "Modèle créé !",
        description: `Le modèle "${modele.nom}" a été créé avec succès.`,
      });
    }

    setCustomModeleBuilderOpen(false);
    setEditingModele(undefined);
    setShouldReopenModeleDialog(true);
    setDialogOpen(true);
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
          <CardContent>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              Ajouter un logement
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
                      <span className="text-sm text-slate-500">
                        {logement.parcoursType === "menage" ? "🧹 Ménage" : "✈️ Voyageur"}
                      </span>
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
        onCreateCustom={handleCreateCustom}
        onComplete={handleComplete}
      />

      <Toaster />
    </div>
  );
}

export default App;

