import { useState } from "react";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Rabbit, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Heart,
  Baby,
  Scale,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import LapinForm from "@/components/LapinForm";
import LapinDetails from "@/components/LapinDetails";

export default function Lapins() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLapin, setSelectedLapin] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLapin, setEditingLapin] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lapins = [], isLoading } = useQuery({
    queryKey: ["/api/lapins"],
  });

  const { data: enclos = [] } = useQuery({
    queryKey: ["/api/enclos"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/lapins/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
      toast({
        title: "Success",
        description: "Lapin supprimé avec succès",
      });
    },
  });

  const filteredLapins = lapins.filter((lapin: any) => {
    const matchesSearch = lapin.identifiant?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === "all" || lapin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "reproducteur": return "bg-blue-100 text-blue-800";
      case "engraissement": return "bg-yellow-100 text-yellow-800";
      case "stock_a_vendre": return "bg-green-100 text-green-800";
      case "vendu": return "bg-gray-100 text-gray-800";
      case "decede": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reproducteur": return "Reproducteur";
      case "engraissement": return "Engraissement";
      case "stock_a_vendre": return "À vendre";
      case "vendu": return "Vendu";
      case "decede": return "Décédé";
      default: return status;
    }
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} jours`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return `${years}a ${months}m`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Lapins</h1>
          <p className="text-gray-600">Gérez votre cheptel et suivez vos animaux</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Lapin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Rabbit className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{lapins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="text-pink-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reproducteurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lapins.filter((l: any) => l.status === "reproducteur").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Scale className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Engraissement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lapins.filter((l: any) => l.status === "engraissement").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Baby className="text-green-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À vendre</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lapins.filter((l: any) => l.status === "stock_a_vendre").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par identifiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="reproducteur">Reproducteurs</option>
                <option value="engraissement">Engraissement</option>
                <option value="stock_a_vendre">À vendre</option>
                <option value="vendu">Vendus</option>
                <option value="decede">Décédés</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lapins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredLapins.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Rabbit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lapin trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier lapin"
              }
            </p>
          </div>
        ) : (
          filteredLapins.map((lapin: any) => (
            <Card key={lapin.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{lapin.identifiant}</CardTitle>
                  <Badge className={getStatusBadgeColor(lapin.status)}>
                    {getStatusLabel(lapin.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Race:</span>
                    <span className="font-medium">{lapin.race}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sexe:</span>
                    <span className="font-medium">
                      {lapin.sexe === "male" ? "Mâle" : "Femelle"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Âge:</span>
                    <span className="font-medium">
                      {calculateAge(lapin.dateNaissance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Santé:</span>
                    <span className="font-medium">
                      {lapin.healthStatus === "sain" ? "Sain" : 
                       lapin.healthStatus === "malade" ? "Malade" : "Quarantaine"}
                    </span>
                  </div>
                  {lapin.enclosId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enclos:</span>
                      <span className="font-medium">
                        {enclos.find((e: any) => e.id === lapin.enclosId)?.nom || lapin.enclosId}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLapin(lapin)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLapin(lapin);
                      setShowForm(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer ce lapin ?")) {
                        deleteMutation.mutate(lapin.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLapin ? "Modifier le lapin" : "Nouveau lapin"}
            </DialogTitle>
            <DialogDescription>
              {editingLapin 
                ? "Modifiez les informations du lapin"
                : "Ajoutez un nouveau lapin à votre cheptel"
              }
            </DialogDescription>
          </DialogHeader>
          <LapinForm
            lapin={editingLapin}
            onSuccess={() => {
              setShowForm(false);
              setEditingLapin(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingLapin(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!selectedLapin} onOpenChange={() => setSelectedLapin(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Fiche de {selectedLapin?.identifiant}
            </DialogTitle>
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