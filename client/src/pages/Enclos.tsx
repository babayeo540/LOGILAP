import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Rabbit,
} from "lucide-react";
import EnclosForm from "../components/EnclosForm";
import ModuleNavigation from "@/components/ModuleNavigation";

// Définition de types pour une meilleure sécurité
interface Enclos {
  id: string;
  nom: string;
  type: string;
  capacite: number;
  statut: "sain" | "nettoyage" | "quarantaine";
}

interface Lapin {
  id: string;
  enclosId: string;
}

export default function Enclos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEnclos, setEditingEnclos] = useState<Enclos | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Utilisation de useQuery pour la logique de production
  const {
    data: enclos = [],
    isLoading,
    isError,
  } = useQuery<Enclos[]>({
    queryKey: ["/api/enclos"],
    queryFn: async () => {
      const response = await fetch("/api/enclos");
      if (!response.ok) {
        throw new Error("Échec de la récupération des enclos");
      }
      return response.json();
    },
  });

  const { data: lapins = [] } = useQuery<Lapin[]>({
    queryKey: ["/api/lapins"],
    queryFn: async () => {
      const response = await fetch("/api/lapins");
      if (!response.ok) {
        throw new Error("Échec de la récupération des lapins");
      }
      return response.json();
    },
  });

  // Fonction de comptage des lapins par enclos, optimisée avec useMemo
  const getNombreLapins = useMemo(() => {
    const lapinsCount: { [key: string]: number } = {};
    lapins.forEach((lapin) => {
      if (lapin.enclosId) {
        lapinsCount[lapin.enclosId] = (lapinsCount[lapin.enclosId] || 0) + 1;
      }
    });
    return lapinsCount;
  }, [lapins]);

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/enclos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enclos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
      toast({
        title: "Succès",
        description: "Enclos supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (enclosItem: Enclos) => {
    if (getNombreLapins[enclosItem.id] > 0) {
      toast({
        title: "Action impossible",
        description:
          "Impossible de supprimer cet enclos, car il contient encore des lapins.",
        variant: "destructive",
      });
      return;
    }
    if (confirm("Êtes-vous sûr de vouloir supprimer cet enclos ?")) {
      deleteMutation.mutate(enclosItem.id);
    }
  };

  const handleEdit = (enclosItem: Enclos) => {
    setEditingEnclos(enclosItem);
    setShowForm(true);
  };

  const filteredEnclos = useMemo(() => {
    return enclos
      .filter((enclosItem) => {
        const passesTypeFilter =
          typeFilter === "all" || enclosItem.type === typeFilter;
        const passesSearchTerm =
          enclosItem.nom.toLowerCase().includes(searchTerm.toLowerCase());
        return passesTypeFilter && passesSearchTerm;
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [enclos, searchTerm, typeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement des enclos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>
          Erreur lors du chargement des enclos. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ModuleNavigation />
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Home className="w-8 h-8 text-primary-600" />
            Gestion des Enclos
          </h1>
          <p className="mt-2 text-gray-600">
            Organisez et gérez les enclos de votre élevage.
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un enclos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="cage">Cage</option>
              <option value="parc">Parc</option>
              <option value="clapier">Clapier</option>
            </select>
            <Button
              onClick={() => {
                setEditingEnclos(null);
                setShowForm(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvel Enclos
            </Button>
          </div>
        </div>

        {/* Enclos List */}
        {filteredEnclos.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun enclos trouvé pour les critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEnclos.map((enclosItem) => {
              const nombreLapins = getNombreLapins[enclosItem.id] || 0;
              const isFull = nombreLapins >= enclosItem.capacite;
              return (
                <Card
                  key={enclosItem.id}
                  className={`relative overflow-hidden ${
                    enclosItem.statut === "quarantaine"
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {enclosItem.nom}
                      </span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {enclosItem.type}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {nombreLapins}/{enclosItem.capacite} lapins
                      {isFull && (
                        <span className="text-red-500 font-semibold ml-2">
                          (Plein)
                        </span>
                      )}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        {enclosItem.statut === "sain" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {enclosItem.statut === "nettoyage" && (
                          <XCircle className="w-4 h-4 text-orange-500" />
                        )}
                        {enclosItem.statut === "quarantaine" && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium text-gray-700">
                          Statut : {enclosItem.statut}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(enclosItem)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(enclosItem)}
                        disabled={
                          deleteMutation.isPending || nombreLapins > 0
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEnclos ? "Modifier l'enclos" : "Nouvel enclos"}
            </DialogTitle>
            <DialogDescription>
              {editingEnclos
                ? "Modifiez les informations de l'enclos"
                : "Ajoutez un nouvel enclos à votre élevage"}
            </DialogDescription>
          </DialogHeader>
          <EnclosForm
            enclos={editingEnclos}
            onSuccess={() => {
              setShowForm(false);
              setEditingEnclos(null);
              queryClient.invalidateQueries({ queryKey: ["/api/enclos"] });
              toast({
                title: "Succès",
                description: "Enclos enregistré avec succès",
              });
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingEnclos(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}