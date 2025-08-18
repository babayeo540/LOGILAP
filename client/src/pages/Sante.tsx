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
  Stethoscope,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Shield,
  Pill,
  Thermometer,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import SoinForm from "../components/SoinForm";
import VaccinForm from "../components/VaccinForm";
import ModuleNavigation from "@/components/ModuleNavigation";
import { apiRequest } from "@/lib/queryClient";

interface Lapin {
  id: string;
  identifiant: string;
}

interface Soin {
  id: string;
  lapinId: string;
  type: "soin";
  date: string;
  description: string;
  cout: number;
}

interface Vaccin {
  id: string;
  lapinId: string;
  type: "vaccin";
  date: string;
  vaccin: string;
  cout: number;
}

type SanteRecord = Soin | Vaccin;

export default function Sante() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSoinForm, setShowSoinForm] = useState(false);
  const [showVaccinForm, setShowVaccinForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SanteRecord | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Requêtes pour les données
  const { data: lapins = [], isLoading: isLapinsLoading } = useQuery<Lapin[]>(
    {
      queryKey: ["/api/lapins"],
      queryFn: async () => apiRequest("/api/lapins"),
    }
  );

  const { data: soins = [], isLoading: isSoinsLoading } = useQuery<Soin[]>({
    queryKey: ["/api/sante/soins"],
    queryFn: async () => apiRequest("/api/sante/soins"),
  });

  const { data: vaccins = [], isLoading: isVaccinsLoading } = useQuery<
    Vaccin[]
  >({
    queryKey: ["/api/sante/vaccins"],
    queryFn: async () => apiRequest("/api/sante/vaccins"),
  });

  // Mutations
  const recordMutation = useMutation({
    mutationFn: (recordData: Partial<SanteRecord>) => {
      const endpoint =
        recordData.type === "soin" ? "/api/sante/soins" : "/api/sante/vaccins";
      if (recordData.id) {
        return apiRequest(`${endpoint}/${recordData.id}`, {
          method: "PUT",
          body: JSON.stringify(recordData),
        });
      } else {
        return apiRequest(endpoint, {
          method: "POST",
          body: JSON.stringify(recordData),
        });
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/sante/soins"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/sante/vaccins"],
      });
      setShowSoinForm(false);
      setShowVaccinForm(false);
      setEditingRecord(null);
      toast({
        title: "Succès",
        description: `Le dossier de santé a été enregistré avec succès.`,
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

  const deleteMutation = useMutation({
    mutationFn: (record: SanteRecord) => {
      const endpoint =
        record.type === "soin" ? "/api/sante/soins" : "/api/sante/vaccins";
      return apiRequest(`${endpoint}/${record.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/sante/soins"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/sante/vaccins"],
      });
      toast({
        title: "Succès",
        description: "Dossier de santé supprimé avec succès.",
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

  // Logique de filtrage et de recherche optimisée
  const filteredSoins = useMemo(() => {
    return soins
      .filter((soin) => {
        const lapin = lapins.find((l) => l.id === soin.lapinId);
        return (
          soin.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          lapin?.identifiant.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [soins, lapins, searchTerm]);

  const filteredVaccins = useMemo(() => {
    return vaccins
      .filter((vaccin) => {
        const lapin = lapins.find((l) => l.id === vaccin.lapinId);
        return (
          vaccin.vaccin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lapin?.identifiant.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vaccins, lapins, searchTerm]);

  if (isLapinsLoading || isSoinsLoading || isVaccinsLoading) {
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
            title="Santé & Traitements"
            description="Gérez les soins et les vaccinations de vos lapins"
            icon={<Stethoscope className="w-6 h-6 text-primary-600" />}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowSoinForm(true);
                setEditingRecord(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouveau Soin
            </Button>
            <Button
              onClick={() => {
                setShowVaccinForm(true);
                setEditingRecord(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouveau Vaccin
            </Button>
          </div>
        </div>

        <Tabs defaultValue="soins" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="soins">Soins</TabsTrigger>
              <TabsTrigger value="vaccins">Vaccinations</TabsTrigger>
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

          <TabsContent value="soins">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSoins.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucun soin enregistré.
                </p>
              ) : (
                filteredSoins.map((soin) => {
                  const lapin = lapins.find((l) => l.id === soin.lapinId);
                  return (
                    <Card key={soin.id}>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Pill className="w-5 h-5 text-blue-500" />
                          Soin
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-2">
                          Lapin :{" "}
                          <span className="font-medium">
                            {lapin?.identifiant || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Date :{" "}
                          <span className="font-medium">
                            {new Date(soin.date).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Description :{" "}
                          <span className="font-medium">
                            {soin.description}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Coût :{" "}
                          <span className="font-medium">
                            {soin.cout.toFixed(2)} FCFA
                          </span>
                        </p>
                        <div className="flex items-center space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRecord(soin);
                              setShowSoinForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  `Êtes-vous sûr de vouloir supprimer ce soin ?`
                                )
                              ) {
                                deleteMutation.mutate(soin);
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

          <TabsContent value="vaccins">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVaccins.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucune vaccination enregistrée.
                </p>
              ) : (
                filteredVaccins.map((vaccin) => {
                  const lapin = lapins.find((l) => l.id === vaccin.lapinId);
                  return (
                    <Card key={vaccin.id}>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Vaccination
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-2">
                          Lapin :{" "}
                          <span className="font-medium">
                            {lapin?.identifiant || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Date :{" "}
                          <span className="font-medium">
                            {new Date(vaccin.date).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Type de vaccin :{" "}
                          <span className="font-medium">{vaccin.vaccin}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Coût :{" "}
                          <span className="font-medium">
                            {vaccin.cout.toFixed(2)} FCFA
                          </span>
                        </p>
                        <div className="flex items-center space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRecord(vaccin);
                              setShowVaccinForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  `Êtes-vous sûr de vouloir supprimer ce vaccin ?`
                                )
                              ) {
                                deleteMutation.mutate(vaccin);
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
        </Tabs>
      </div>

      {/* Dialogs pour les formulaires */}
      <Dialog open={showSoinForm} onOpenChange={setShowSoinForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord?.type === "soin"
                ? "Modifier le soin"
                : "Nouveau soin"}
            </DialogTitle>
            <DialogDescription>
              {editingRecord?.type === "soin"
                ? "Modifiez les informations du soin"
                : "Enregistrez un nouveau soin"}
            </DialogDescription>
          </DialogHeader>
          <SoinForm
            soin={editingRecord?.type === "soin" ? editingRecord : null}
            onSuccess={(data) => {
              recordMutation.mutate(data as Soin);
            }}
            onCancel={() => {
              setShowSoinForm(false);
              setEditingRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showVaccinForm} onOpenChange={setShowVaccinForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord?.type === "vaccin"
                ? "Modifier le vaccin"
                : "Nouveau vaccin"}
            </DialogTitle>
            <DialogDescription>Enregistrez une vaccination</DialogDescription>
          </DialogHeader>
          <VaccinForm
            vaccin={editingRecord?.type === "vaccin" ? editingRecord : null}
            onSuccess={(data) => {
              recordMutation.mutate(data as Vaccin);
            }}
            onCancel={() => {
              setShowVaccinForm(false);
              setEditingRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}