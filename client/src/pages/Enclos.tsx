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
  DialogTitle 
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
  XCircle
} from "lucide-react";
import EnclosForm from "../components/EnclosForm";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Enclos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEnclos, setEditingEnclos] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: enclos = [], isLoading } = useQuery({
    queryKey: ["/api/enclos"],
  });

  const { data: lapins = [] } = useQuery({
    queryKey: ["/api/lapins"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/enclos/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/enclos"] });
      toast({
        title: "Succès",
        description: "Enclos supprimé avec succès",
      });
    },
  });

  const filteredEnclos = (enclos as any[]).filter((e: any) => {
    const matchesSearch = e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesType = typeFilter === "all" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "vide": return "bg-green-100 text-green-800";
      case "occupe": return "bg-blue-100 text-blue-800";
      case "a_nettoyer": return "bg-yellow-100 text-yellow-800";
      case "en_maintenance": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "vide": return "Vide";
      case "occupe": return "Occupé";
      case "a_nettoyer": return "À nettoyer";
      case "en_maintenance": return "En maintenance";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "maternite": return "Maternité";
      case "engraissement": return "Engraissement";
      case "quarantaine": return "Quarantaine";
      case "reproducteur_male": return "Reproducteur mâle";
      case "reproducteur_femelle": return "Reproducteur femelle";
      default: return type;
    }
  };

  const getEnclosOccupancy = (enclosId: string) => {
    const lapinsInEnclos = (lapins as any[]).filter((l: any) => l.enclosId === enclosId);
    return lapinsInEnclos.length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "vide": return <CheckCircle className="w-4 h-4" />;
      case "occupe": return <Users className="w-4 h-4" />;
      case "a_nettoyer": return <AlertTriangle className="w-4 h-4" />;
      case "en_maintenance": return <XCircle className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleNavigation 
        currentModule="enclos"
        moduleTitle="Gestion des Enclos"
        moduleDescription="Gérez vos installations et leur occupation"
      />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Actions rapides</span>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Enclos
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{enclos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enclos.filter((e: any) => e.status === "vide").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enclos.filter((e: any) => e.status === "occupe").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À nettoyer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enclos.filter((e: any) => e.status === "a_nettoyer").length}
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
                  placeholder="Rechercher par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="maternite">Maternité</option>
                <option value="engraissement">Engraissement</option>
                <option value="quarantaine">Quarantaine</option>
                <option value="reproducteur_male">Reproducteur mâle</option>
                <option value="reproducteur_femelle">Reproducteur femelle</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enclos List */}
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
        ) : filteredEnclos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enclos trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier enclos"
              }
            </p>
          </div>
        ) : (
          filteredEnclos.map((enclosItem: any) => {
            const occupancy = getEnclosOccupancy(enclosItem.id);
            const occupancyRate = enclosItem.capaciteMax > 0 ? (occupancy / enclosItem.capaciteMax) * 100 : 0;
            
            return (
              <Card key={enclosItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{enclosItem.nom}</CardTitle>
                    <Badge className={getStatusBadgeColor(enclosItem.status)}>
                      {getStatusIcon(enclosItem.status)}
                      <span className="ml-1">{getStatusLabel(enclosItem.status)}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{getTypeLabel(enclosItem.type)}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacité:</span>
                      <span className="font-medium">{enclosItem.capaciteMax} places</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation:</span>
                      <span className="font-medium">
                        {occupancy}/{enclosItem.capaciteMax}
                        {enclosItem.capaciteMax > 0 && (
                          <span className="text-gray-500 ml-1">
                            ({occupancyRate.toFixed(0)}%)
                          </span>
                        )}
                      </span>
                    </div>
                    
                    {/* Barre de progression d'occupation */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Taux d'occupation</span>
                        <span>{occupancyRate.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            occupancyRate === 0 ? 'bg-gray-300' :
                            occupancyRate < 70 ? 'bg-green-500' :
                            occupancyRate < 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEnclos(enclosItem);
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
                        if (occupancy > 0) {
                          toast({
                            title: "Impossible de supprimer",
                            description: "L'enclos contient encore des lapins",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (confirm("Êtes-vous sûr de vouloir supprimer cet enclos ?")) {
                          deleteMutation.mutate(enclosItem.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
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
                : "Ajoutez un nouvel enclos à votre élevage"
              }
            </DialogDescription>
          </DialogHeader>
          <EnclosForm
            enclos={editingEnclos}
            onSuccess={() => {
              setShowForm(false);
              setEditingEnclos(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingEnclos(null);
            }}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}