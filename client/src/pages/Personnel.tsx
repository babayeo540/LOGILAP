import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Euro,
  PiggyBank,
  Edit,
  Trash2,
  Phone,
  Mail,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Importez vos formulaires
// import EmployeForm from "@/components/EmployeForm";
// import TacheForm from "@/components/TacheForm";
// import EpargneForm from "@/components/EpargneForm";
import ModuleNavigation from "@/components/ModuleNavigation";

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  statut: "actif" | "inactif" | "conge";
  telephone: string;
  email: string;
}

interface Tache {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut: "en_cours" | "terminee" | "en_retard";
  employeId: string;
}

interface Epargne {
  id: string;
  montant: number;
  date: string;
  employeId: string;
}

const Personnel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEmployeForm, setShowEmployeForm] = useState(false);
  const [showTacheForm, setShowTacheForm] = useState(false);
  const [showEpargneForm, setShowEpargneForm] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null);
  const [selectedEmployeForTache, setSelectedEmployeForTache] = useState<
    Employe | null
  >(null);
  const [selectedEmployeForEpargne, setSelectedEmployeForEpargne] = useState<
    Employe | null
  >(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Requêtes pour les données
  const { data: employes = [], isLoading: isEmployesLoading } = useQuery<
    Employe[]
  >({
    queryKey: ["/api/employes"],
    queryFn: async () => apiRequest("/api/employes"),
  });

  const { data: taches = [], isLoading: isTachesLoading } = useQuery<Tache[]>(
    {
      queryKey: ["/api/taches"],
      queryFn: async () => apiRequest("/api/taches"),
    }
  );

  const { data: epargnes = [], isLoading: isEpargnesLoading } = useQuery<
    Epargne[]
  >({
    queryKey: ["/api/epargne"],
    queryFn: async () => apiRequest("/api/epargne"),
  });

  // Mutations
  const employeMutation = useMutation({
    mutationFn: (employeData: Partial<Employe>) => {
      if (employeData.id) {
        return apiRequest(`/api/employes/${employeData.id}`, {
          method: "PUT",
          body: JSON.stringify(employeData),
        });
      } else {
        return apiRequest("/api/employes", {
          method: "POST",
          body: JSON.stringify(employeData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      setShowEmployeForm(false);
      setEditingEmploye(null);
      toast({
        title: "Succès",
        description: "Employé enregistré avec succès.",
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

  const deleteEmployeMutation = useMutation({
    mutationFn: (employeId: string) =>
      apiRequest(`/api/employes/${employeId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès.",
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

  // Fonctionnalités manquantes
  const tacheMutation = useMutation({
    mutationFn: (tacheData: Partial<Tache>) => {
      if (tacheData.id) {
        return apiRequest(`/api/taches/${tacheData.id}`, {
          method: "PUT",
          body: JSON.stringify(tacheData),
        });
      } else {
        return apiRequest("/api/taches", {
          method: "POST",
          body: JSON.stringify(tacheData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/taches"] });
      setShowTacheForm(false);
      toast({
        title: "Succès",
        description: "Tâche enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'enregistrement de la tâche : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const epargneMutation = useMutation({
    mutationFn: (epargneData: Partial<Epargne>) => {
      if (epargneData.id) {
        return apiRequest(`/api/epargne/${epargneData.id}`, {
          method: "PUT",
          body: JSON.stringify(epargneData),
        });
      } else {
        return apiRequest("/api/epargne", {
          method: "POST",
          body: JSON.stringify(epargneData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epargne"] });
      setShowEpargneForm(false);
      toast({
        title: "Succès",
        description: "Opération d'épargne enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'opération d'épargne : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Logique de filtrage et de recherche optimisée avec useMemo
  const filteredEmployes = useMemo(() => {
    return employes
      .filter((employe) => {
        const matchesSearch =
          employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employe.prenom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || employe.statut === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [employes, searchTerm, statusFilter]);

  const employesActifs = useMemo(
    () => employes.filter((e) => e.statut === "actif").length,
    [employes]
  );
  const employesEnConge = useMemo(
    () => employes.filter((e) => e.statut === "conge").length,
    [employes]
  );
  const tachesEnCours = useMemo(
    () => taches.filter((t) => t.statut === "en_cours").length,
    [taches]
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <ModuleNavigation
            title="Personnel"
            description="Gérez les employés, les salaires, les tâches et l'épargne"
            icon={<Users className="w-6 h-6 text-primary-600" />}
          />
          <Button
            onClick={() => {
              setEditingEmploye(null);
              setShowEmployeForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nouvel Employé
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center space-x-2 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute ml-3" />
            <Input
              placeholder="Rechercher un employé..."
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
              variant={statusFilter === "actif" ? "default" : "secondary"}
              onClick={() => setStatusFilter("actif")}
              className="cursor-pointer"
            >
              Actifs
            </Badge>
            <Badge
              variant={statusFilter === "inactif" ? "default" : "secondary"}
              onClick={() => setStatusFilter("inactif")}
              className="cursor-pointer"
            >
              Inactifs
            </Badge>
            <Badge
              variant={statusFilter === "conge" ? "default" : "secondary"}
              onClick={() => setStatusFilter("conge")}
              className="cursor-pointer"
            >
              En congé
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employés
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employesActifs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Congé</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employesEnConge}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches en Cours</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tachesEnCours}</div>
            </CardContent>
          </Card>
        </div>

        {isEmployesLoading ? (
          <div className="text-center py-8">
            Chargement des employés...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployes.map((employe) => (
              <Card key={employe.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-bold">
                      {employe.prenom} {employe.nom}
                    </CardTitle>
                    <Badge variant="secondary">{employe.role}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4" />
                    <span>{employe.telephone}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{employe.email}</span>
                  </p>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEmploye(employe);
                        setShowEmployeForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployeForTache(employe);
                        setShowTacheForm(true);
                      }}
                    >
                      <Briefcase className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployeForEpargne(employe);
                        setShowEpargneForm(true);
                      }}
                    >
                      <PiggyBank className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const employeTachesEnCours = taches.filter(
                          (t) => t.employeId === employe.id && t.statut === "en_cours"
                        ).length;
                        if (employeTachesEnCours > 0) {
                          toast({
                            title: "Action impossible",
                            description: "Cet employé a des tâches en cours et ne peut pas être supprimé.",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (
                          confirm(
                            `Êtes-vous sûr de vouloir supprimer l'employé ${employe.prenom} ${employe.nom} ?`
                          )
                        ) {
                          deleteEmployeMutation.mutate(employe.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Employe Form Dialog */}
      <Dialog open={showEmployeForm} onOpenChange={setShowEmployeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEmploye ? "Modifier l'employé" : "Nouvel employé"}
            </DialogTitle>
            <DialogDescription>
              {editingEmploye
                ? "Modifiez les informations de l'employé"
                : "Ajoutez un nouvel employé à votre équipe"}
            </DialogDescription>
          </DialogHeader>
          {/* Composant EmployeForm à implémenter */}
          {/* <EmployeForm
            employe={editingEmploye}
            onSuccess={() => {
              employeMutation.onSuccess();
            }}
            onCancel={() => {
              setShowEmployeForm(false);
              setEditingEmploye(null);
            }}
          /> */}
        </DialogContent>
      </Dialog>

      {/* Tache Form Dialog */}
      <Dialog open={showTacheForm} onOpenChange={setShowTacheForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
            <DialogDescription>
              Assignez une nouvelle tâche à un employé
            </DialogDescription>
          </DialogHeader>
          {/* Composant TacheForm à implémenter */}
          {/* <TacheForm
            employes={employes}
            employePreselectionne={selectedEmployeForTache}
            onSuccess={() => {
              tacheMutation.onSuccess();
            }}
            onCancel={() => {
              setShowTacheForm(false);
              setSelectedEmployeForTache(null);
            }}
          /> */}
        </DialogContent>
      </Dialog>

      {/* Epargne Form Dialog */}
      <Dialog open={showEpargneForm} onOpenChange={setShowEpargneForm}>
        <DialogContent className="max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>Gestion de l'épargne</DialogTitle>
            <DialogDescription>
              Gérez l'épargne salariale de l'employé
            </DialogDescription>
          </DialogHeader>
          {/* Composant EpargneForm à implémenter */}
          {/* <EpargneForm
            employe={selectedEmployeForEpargne}
            onSuccess={() => {
              epargneMutation.onSuccess();
            }}
            onCancel={() => {
              setShowEpargneForm(false);
              setSelectedEmployeForEpargne(null);
            }}
          /> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Personnel;