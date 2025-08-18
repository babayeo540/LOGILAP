import { useState, useMemo } from "react";
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
  DialogTitle,
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
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AccouplementForm from "@/components/AccouplementForm";
import MiseBasForm from "@/components/MiseBasForm";
import ModuleNavigation from "@/components/ModuleNavigation";

interface Lapin {
  id: string;
  identifiant: string;
  sexe: "male" | "femelle";
}

interface Accouplement {
  id: string;
  maleId: string;
  femelleId: string;
  date: string;
  statut: "en_cours" | "echec" | "reussi";
}

interface MiseBas {
  id: string;
  accouplementId: string;
  date: string;
  nombreLapereaux: number;
  nombreSurvie: number;
}

export default function Reproduction() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAccouplementForm, setShowAccouplementForm] = useState(false);
  const [showMiseBasForm, setShowMiseBasForm] = useState(false);
  const [editingAccouplement, setEditingAccouplement] =
    useState<Accouplement | null>(null);
  const [selectedAccouplementForMiseBas, setSelectedAccouplementForMiseBas] =
    useState<Accouplement | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Requêtes pour les données
  const { data: lapins = [], isLoading: isLapinsLoading } = useQuery<Lapin[]>(
    {
      queryKey: ["/api/lapins"],
      queryFn: async () => apiRequest("/api/lapins"),
    }
  );

  const { data: accouplements = [], isLoading: isAccouplementsLoading } =
    useQuery<Accouplement[]>({
      queryKey: ["/api/accouplements"],
      queryFn: async () => apiRequest("/api/accouplements"),
    });

  const { data: misesBas = [], isLoading: isMisesBasLoading } = useQuery<
    MiseBas[]
  >({
    queryKey: ["/api/misesbas"],
    queryFn: async () => apiRequest("/api/misesbas"),
  });

  // Mutations
  const accouplementMutation = useMutation({
    mutationFn: (accouplementData: Partial<Accouplement>) => {
      if (accouplementData.id) {
        return apiRequest(`/api/accouplements/${accouplementData.id}`, {
          method: "PUT",
          body: JSON.stringify(accouplementData),
        });
      } else {
        return apiRequest("/api/accouplements", {
          method: "POST",
          body: JSON.stringify(accouplementData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accouplements"] });
      setShowAccouplementForm(false);
      setEditingAccouplement(null);
      toast({
        title: "Succès",
        description: "Accouplement enregistré avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'opération : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteAccouplementMutation = useMutation({
    mutationFn: (accouplementId: string) =>
      apiRequest(`/api/accouplements/${accouplementId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accouplements"] });
      toast({
        title: "Succès",
        description: "Accouplement supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const miseBasMutation = useMutation({
    mutationFn: (miseBasData: Partial<MiseBas>) => {
      if (miseBasData.id) {
        return apiRequest(`/api/misesbas/${miseBasData.id}`, {
          method: "PUT",
          body: JSON.stringify(miseBasData),
        });
      } else {
        return apiRequest("/api/misesbas", {
          method: "POST",
          body: JSON.stringify(miseBasData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/misesbas"] });
      setShowMiseBasForm(false);
      setSelectedAccouplementForMiseBas(null);
      toast({
        title: "Succès",
        description: "Mise-bas enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'enregistrement de la mise-bas : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Logique de filtrage et de recherche optimisée
  const filteredAccouplements = useMemo(() => {
    return accouplements
      .filter((accouplement) => {
        const male = lapins.find((l) => l.id === accouplement.maleId);
        const femelle = lapins.find((l) => l.id === accouplement.femelleId);
        const matchesSearch =
          (male?.identifiant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            femelle
              ?.identifiant.toLowerCase()
              .includes(searchTerm.toLowerCase()));
        const matchesStatus =
          statusFilter === "all" || accouplement.statut === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [accouplements, lapins, searchTerm, statusFilter]);

  const accouplementsEnCours = useMemo(
    () => accouplements.filter((a) => a.statut === "en_cours").length,
    [accouplements]
  );
  const accouplementsReussis = useMemo(
    () => accouplements.filter((a) => a.statut === "reussi").length,
    [accouplements]
  );
  const totalLapereauxNees = useMemo(
    () => misesBas.reduce((total, miseBas) => total + miseBas.nombreLapereaux, 0),
    [misesBas]
  );

  if (isLapinsLoading || isAccouplementsLoading || isMisesBasLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <ModuleNavigation
            title="Reproduction"
            description="Gérez les accouplements et les mises-bas"
            icon={<Heart className="w-6 h-6 text-primary-600" />}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAccouplementForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvel Accouplement
            </Button>
            <Button
              onClick={() => setShowMiseBasForm(true)}
              className="flex items-center gap-2"
            >
              <Baby className="w-4 h-4" /> Nouvelle Mise-bas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Accouplements Totaux
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accouplements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Cours</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accouplementsEnCours}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réussis</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accouplementsReussis}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lapereaux Nées
              </CardTitle>
              <Baby className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLapereauxNees}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accouplements" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="accouplements">Accouplements</TabsTrigger>
              <TabsTrigger value="misesbas">Mises-bas</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
          </div>

          <TabsContent value="accouplements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccouplements.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucun accouplement trouvé.
                </p>
              ) : (
                filteredAccouplements.map((accouplement) => {
                  const male = lapins.find((l) => l.id === accouplement.maleId);
                  const femelle = lapins.find(
                    (l) => l.id === accouplement.femelleId
                  );
                  const miseBasLiee = misesBas.find(
                    (mb) => mb.accouplementId === accouplement.id
                  );
                  return (
                    <Card key={accouplement.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Accouplement
                          </CardTitle>
                          <Badge variant="secondary">{accouplement.statut}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {male?.identifiant} & {femelle?.identifiant}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(accouplement.date).toLocaleDateString()}
                          </span>
                        </p>
                        <div className="flex items-center space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAccouplement(accouplement);
                              setShowAccouplementForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAccouplementForMiseBas(accouplement);
                              setShowMiseBasForm(true);
                            }}
                          >
                            <Baby className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (
                                miseBasLiee ||
                                accouplement.statut === "reussi"
                              ) {
                                toast({
                                  title: "Action impossible",
                                  description:
                                    "Cet accouplement a une mise-bas liée ou est déjà réussi et ne peut être supprimé.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              if (
                                confirm(
                                  `Êtes-vous sûr de vouloir supprimer cet accouplement ?`
                                )
                              ) {
                                deleteAccouplementMutation.mutate(
                                  accouplement.id
                                );
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

          <TabsContent value="misesbas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {misesBas.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucune mise-bas enregistrée.
                </p>
              ) : (
                misesBas.map((miseBas) => {
                  const accouplement = accouplements.find(
                    (a) => a.id === miseBas.accouplementId
                  );
                  const femelle = lapins.find(
                    (l) => l.id === accouplement?.femelleId
                  );
                  return (
                    <Card key={miseBas.id}>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Baby className="w-5 h-5 text-pink-500" />
                          Mise-bas
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(miseBas.date).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Femelle: {femelle?.identifiant || "N/A"}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Lapereaux nés : {miseBas.nombreLapereaux}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Lapereaux survivants : {miseBas.nombreSurvie}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs pour les formulaires */}
      <Dialog open={showAccouplementForm} onOpenChange={setShowAccouplementForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAccouplement
                ? "Modifier l'accouplement"
                : "Nouvel accouplement"}
            </DialogTitle>
            <DialogDescription>
              {editingAccouplement
                ? "Modifiez les informations de l'accouplement"
                : "Enregistrez un nouvel accouplement"}
            </DialogDescription>
          </DialogHeader>
          <AccouplementForm
            accouplement={editingAccouplement}
            onSuccess={() => {
              accouplementMutation.onSuccess();
            }}
            onCancel={() => {
              setShowAccouplementForm(false);
              setEditingAccouplement(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showMiseBasForm} onOpenChange={setShowMiseBasForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle mise-bas</DialogTitle>
            <DialogDescription>Enregistrez une nouvelle naissance</DialogDescription>
          </DialogHeader>
          <MiseBasForm
            accouplement={selectedAccouplementForMiseBas}
            onSuccess={() => {
              miseBasMutation.onSuccess();
            }}
            onCancel={() => {
              setShowMiseBasForm(false);
              setSelectedAccouplementForMiseBas(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}