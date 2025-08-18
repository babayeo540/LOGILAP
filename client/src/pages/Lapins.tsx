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
  Rabbit,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Heart,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import LapinForm from "@/components/LapinForm";
import LapinDetails from "@/components/LapinDetails";
import ModuleNavigation from "@/components/ModuleNavigation";

interface Lapin {
  id: string;
  identifiant: string;
  sexe: "male" | "femelle";
  race: string;
  dateNaissance: string;
  poids: number;
  statut:
    | "reproduction"
    | "engraissement"
    | "malade"
    | "gestation"
    | "laiton";
  enclos: string;
}

export default function Lapins() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLapin, setSelectedLapin] = useState<Lapin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLapin, setEditingLapin] = useState<Lapin | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: lapins = [],
    isLoading,
    error,
  } = useQuery<Lapin[]>({
    queryKey: ["/api/lapins"],
    queryFn: async () => apiRequest("/api/lapins"),
  });

  const deleteMutation = useMutation({
    mutationFn: (lapinId: string) =>
      apiRequest(`/api/lapins/${lapinId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
      toast({
        title: "Succès",
        description: "Lapin supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Échec de la suppression du lapin",
        variant: "destructive",
      });
    },
  });

  const filteredLapins = useMemo(() => {
    return lapins
      .filter((lapin) => {
        const matchesSearch = lapin.identifiant
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || lapin.statut === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.identifiant.localeCompare(b.identifiant));
  }, [lapins, searchTerm, statusFilter]);

  const totalLapins = useMemo(() => lapins.length, [lapins]);
  const lapinsRepro = useMemo(
    () => lapins.filter((l) => l.statut === "reproduction").length,
    [lapins]
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <ModuleNavigation
            title="Lapins"
            description="Gérez les lapins de votre cheptel"
            icon={<Rabbit className="w-6 h-6 text-primary-600" />}
          />
          <Button
            onClick={() => {
              setEditingLapin(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nouveau Lapin
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center space-x-2 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute ml-3" />
            <Input
              placeholder="Rechercher un lapin..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 flex-wrap">
            <Badge
              variant={statusFilter === "all" ? "default" : "secondary"}
              onClick={() => setStatusFilter("all")}
              className="cursor-pointer"
            >
              Tous
            </Badge>
            <Badge
              variant={
                statusFilter === "reproduction" ? "default" : "secondary"
              }
              onClick={() => setStatusFilter("reproduction")}
              className="cursor-pointer"
            >
              Reproduction
            </Badge>
            <Badge
              variant={
                statusFilter === "engraissement" ? "default" : "secondary"
              }
              onClick={() => setStatusFilter("engraissement")}
              className="cursor-pointer"
            >
              Engraissement
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lapins</CardTitle>
              <Rabbit className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLapins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reproduction</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lapinsRepro}</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Chargement des lapins...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Erreur: {error.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLapins.map((lapin) => (
              <Card key={lapin.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-bold">
                      {lapin.identifiant}
                    </CardTitle>
                    <Badge
                      variant={
                        lapin.sexe === "male" ? "default" : "secondary"
                      }
                    >
                      {lapin.sexe === "male" ? "Mâle" : "Femelle"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Race: {lapin.race}</p>
                  <p className="text-sm text-gray-500">
                    Statut: {lapin.statut}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Rabbit className="w-4 h-4 mr-2" />
                    <span>Enclos: {lapin.enclos}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLapin(lapin)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingLapin(lapin);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        if (
                          confirm(
                            `Êtes-vous sûr de vouloir supprimer le lapin ${lapin.identifiant} ?`
                          )
                        ) {
                          deleteMutation.mutate(lapin.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLapin ? "Modifier le lapin" : "Nouveau lapin"}
            </DialogTitle>
            <DialogDescription>
              {editingLapin
                ? "Modifiez les informations du lapin"
                : "Ajoutez un nouveau lapin à votre cheptel"}
            </DialogDescription>
          </DialogHeader>
          <LapinForm
            lapin={editingLapin}
            onSuccess={() => {
              setShowForm(false);
              setEditingLapin(null);
              queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingLapin(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedLapin} onOpenChange={() => setSelectedLapin(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fiche de {selectedLapin?.identifiant}</DialogTitle>
          </DialogHeader>
          {selectedLapin && (
            <LapinDetails
              lapin={selectedLapin}
              onClose={() => setSelectedLapin(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}