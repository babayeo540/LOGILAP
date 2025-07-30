import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2,
  Baby,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react";
import AccouplementForm from "../components/AccouplementForm";
import MiseBasForm from "../components/MiseBasForm";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Reproduction() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAccouplementForm, setShowAccouplementForm] = useState(false);
  const [showMiseBasForm, setShowMiseBasForm] = useState(false);
  const [editingAccouplement, setEditingAccouplement] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accouplements = [], isLoading: loadingAccouplements } = useQuery({
    queryKey: ["/api/accouplements"],
  });

  const { data: misesBas = [], isLoading: loadingMisesBas } = useQuery({
    queryKey: ["/api/mises-bas"],
  });

  const { data: lapins = [] } = useQuery({
    queryKey: ["/api/lapins"],
  });

  const deleteAccouplementMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/accouplements/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/accouplements"] });
      toast({
        title: "Succès",
        description: "Accouplement supprimé avec succès",
      });
    },
  });

  const getLapinName = (lapinId: string) => {
    const lapin = lapins.find((l: any) => l.id === lapinId);
    return lapin ? lapin.identifiant : lapinId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateDaysUntilBirth = (dateMiseBasPrevue: string) => {
    const today = new Date();
    const birthDate = new Date(dateMiseBasPrevue);
    const diffTime = birthDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAccouplementStatus = (accouplement: any) => {
    if (accouplement.succes === false) return "echec";
    if (accouplement.succes === true) return "reussi";
    if (accouplement.dateMiseBasPrevue) {
      const daysUntil = calculateDaysUntilBirth(accouplement.dateMiseBasPrevue);
      if (daysUntil <= 0) return "terme";
      if (daysUntil <= 7) return "proche";
    }
    return "en_cours";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_cours":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case "proche":
        return <Badge className="bg-orange-100 text-orange-800">Terme proche</Badge>;
      case "terme":
        return <Badge className="bg-red-100 text-red-800">À terme</Badge>;
      case "reussi":
        return <Badge className="bg-green-100 text-green-800">Réussi</Badge>;
      case "echec":
        return <Badge className="bg-gray-100 text-gray-800">Échec</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  const filteredAccouplements = accouplements.filter((acc: any) => {
    const femelleNom = getLapinName(acc.femelleId);
    const maleNom = getLapinName(acc.maleId);
    const matchesSearch = femelleNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maleNom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getAccouplementStatus(acc);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleNavigation 
        currentModule="reproduction"
        moduleTitle="Gestion de la Reproduction"
        moduleDescription="Suivez les accouplements et les naissances"
      />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Actions rapides</span>
          </div>
          <div className="flex gap-2">
          <Button 
            onClick={() => setShowAccouplementForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Heart className="w-4 h-4 mr-2" />
            Nouvel Accouplement
          </Button>
          <Button 
            onClick={() => setShowMiseBasForm(true)}
            variant="outline"
          >
            <Baby className="w-4 h-4 mr-2" />
            Nouvelle Mise-bas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="text-pink-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accouplements</p>
                <p className="text-2xl font-bold text-gray-900">{accouplements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En gestation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accouplements.filter((a: any) => getAccouplementStatus(a) === "en_cours").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À terme</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accouplements.filter((a: any) => ["terme", "proche"].includes(getAccouplementStatus(a))).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Baby className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Naissances</p>
                <p className="text-2xl font-bold text-gray-900">{misesBas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accouplements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accouplements">Accouplements</TabsTrigger>
          <TabsTrigger value="mises-bas">Mises-bas</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="accouplements" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par nom de lapin..."
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
                    <option value="en_cours">En cours</option>
                    <option value="proche">Terme proche</option>
                    <option value="terme">À terme</option>
                    <option value="reussi">Réussi</option>
                    <option value="echec">Échec</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accouplements List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingAccouplements ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredAccouplements.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun accouplement trouvé</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par enregistrer votre premier accouplement"
                  }
                </p>
              </div>
            ) : (
              filteredAccouplements.map((accouplement: any) => {
                const status = getAccouplementStatus(accouplement);
                const daysUntilBirth = accouplement.dateMiseBasPrevue ? 
                  calculateDaysUntilBirth(accouplement.dateMiseBasPrevue) : null;
                
                return (
                  <Card key={accouplement.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {getLapinName(accouplement.femelleId)} × {getLapinName(accouplement.maleId)}
                        </CardTitle>
                        {getStatusBadge(status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date accouplement:</span>
                          <span className="font-medium">
                            {formatDate(accouplement.dateAccouplement)}
                          </span>
                        </div>
                        {accouplement.dateMiseBasPrevue && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mise-bas prévue:</span>
                            <span className="font-medium">
                              {formatDate(accouplement.dateMiseBasPrevue)}
                            </span>
                          </div>
                        )}
                        {daysUntilBirth !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Jours restants:</span>
                            <span className={`font-medium ${
                              daysUntilBirth <= 0 ? 'text-red-600' :
                              daysUntilBirth <= 7 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {daysUntilBirth <= 0 ? 'À terme' : `${daysUntilBirth} jours`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAccouplement(accouplement);
                            setShowAccouplementForm(true);
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
                            if (confirm("Êtes-vous sûr de vouloir supprimer cet accouplement ?")) {
                              deleteAccouplementMutation.mutate(accouplement.id);
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
        </TabsContent>

        <TabsContent value="mises-bas" className="space-y-6">
          {/* Mises-bas List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingMisesBas ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))
            ) : misesBas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mise-bas enregistrée</h3>
                <p className="text-gray-600">
                  Les naissances apparaîtront ici une fois enregistrées
                </p>
              </div>
            ) : (
              misesBas.map((miseBas: any) => {
                const accouplement = accouplements.find((a: any) => a.id === miseBas.accouplementId);
                
                return (
                  <Card key={miseBas.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Portée #{miseBas.id.slice(-6)}
                        </CardTitle>
                        <Badge className="bg-green-100 text-green-800">
                          <Baby className="w-3 h-3 mr-1" />
                          {miseBas.nombreLapereaux} lapereaux
                        </Badge>
                      </div>
                      {accouplement && (
                        <p className="text-sm text-gray-600">
                          {getLapinName(accouplement.femelleId)} × {getLapinName(accouplement.maleId)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date naissance:</span>
                          <span className="font-medium">
                            {formatDate(miseBas.dateMiseBas)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lapereaux nés:</span>
                          <span className="font-medium">{miseBas.nombreLapereaux}</span>
                        </div>
                        {miseBas.nombreMortsNes > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Morts-nés:</span>
                            <span className="font-medium text-red-600">{miseBas.nombreMortsNes}</span>
                          </div>
                        )}
                        {miseBas.nombreSurvivants24h && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Survivants 24h:</span>
                            <span className="font-medium text-green-600">{miseBas.nombreSurvivants24h}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planning des naissances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accouplements
                  .filter((a: any) => a.dateMiseBasPrevue && getAccouplementStatus(a) !== "echec")
                  .sort((a: any, b: any) => new Date(a.dateMiseBasPrevue).getTime() - new Date(b.dateMiseBasPrevue).getTime())
                  .map((accouplement: any) => {
                    const daysUntil = calculateDaysUntilBirth(accouplement.dateMiseBasPrevue);
                    return (
                      <div key={accouplement.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {getLapinName(accouplement.femelleId)} × {getLapinName(accouplement.maleId)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Mise-bas prévue: {formatDate(accouplement.dateMiseBasPrevue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            daysUntil <= 0 ? 'text-red-600' :
                            daysUntil <= 7 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {daysUntil <= 0 ? 'À terme' : `dans ${daysUntil} jours`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accouplement Form Dialog */}
      <Dialog open={showAccouplementForm} onOpenChange={setShowAccouplementForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAccouplement ? "Modifier l'accouplement" : "Nouvel accouplement"}
            </DialogTitle>
            <DialogDescription>
              {editingAccouplement 
                ? "Modifiez les informations de l'accouplement"
                : "Enregistrez un nouvel accouplement"
              }
            </DialogDescription>
          </DialogHeader>
          <AccouplementForm
            accouplement={editingAccouplement}
            onSuccess={() => {
              setShowAccouplementForm(false);
              setEditingAccouplement(null);
            }}
            onCancel={() => {
              setShowAccouplementForm(false);
              setEditingAccouplement(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Mise-bas Form Dialog */}
      <Dialog open={showMiseBasForm} onOpenChange={setShowMiseBasForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle mise-bas</DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle naissance
            </DialogDescription>
          </DialogHeader>
          <MiseBasForm
            onSuccess={() => setShowMiseBasForm(false)}
            onCancel={() => setShowMiseBasForm(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}