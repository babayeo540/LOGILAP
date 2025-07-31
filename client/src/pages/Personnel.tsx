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
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Clock,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Euro,
  PiggyBank,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import EmployeForm from "../components/EmployeForm";
import TacheForm from "../components/TacheForm";
import EpargneForm from "../components/EpargneForm";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Personnel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showEmployeForm, setShowEmployeForm] = useState(false);
  const [showTacheForm, setShowTacheForm] = useState(false);
  const [showEpargneForm, setShowEpargneForm] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<any>(null);
  const [selectedEmployeForTache, setSelectedEmployeForTache] = useState<any>(null);
  const [selectedEmployeForEpargne, setSelectedEmployeForEpargne] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutations pour supprimer employés et tâches
  const deleteEmployeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employes/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès",
      });
    },
  });

  const deleteTacheMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/taches/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/taches"] });
      toast({
        title: "Succès",
        description: "Tâche supprimée avec succès",
      });
    },
  });

  // Données réelles depuis l'API
  const { data: employes = [], isLoading: employesLoading } = useQuery({
    queryKey: ['/api/employes'],
  });

  const { data: taches = [], isLoading: tachesLoading } = useQuery({
    queryKey: ['/api/taches'],
  });

  // Utilisation des vraies données uniquement
  const employesArray = Array.isArray(employes) ? employes : [];
  const tachesArray = Array.isArray(taches) ? taches : [];

  const getEmployeNom = (employeId: string) => {
    const employe = employesArray.find((e: any) => e.id === employeId);
    return employe ? `${employe.prenom} ${employe.nom}` : employeId;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "administrateur": return "Administrateur";
      case "gestionnaire": return "Gestionnaire";
      case "soigneur": return "Soigneur";
      default: return role;
    }
  };

  // Filtres et calculs basés sur les données réelles
  const filteredEmployes = employesArray.filter((employe: any) => {
    const matchesSearch = (employe.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employe.prenom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employe.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalEmployes = employesArray.length;
  const employesActifs = employesArray.filter((e: any) => e.statut === "actif").length;
  const tachesEnCours = tachesArray.filter((t: any) => t.statut === "en_cours").length;
  const tachesEnRetard = tachesArray.filter((t: any) => {
    return t.dateLimite < new Date().toISOString().split('T')[0] && t.statut !== "terminee";
  }).length;
  const totalEpargne = employesArray.reduce((sum: number, e: any) => sum + (e.soldeEpargne || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case "inactif":
        return <Badge className="bg-red-100 text-red-800">Inactif</Badge>;
      case "conge":
        return <Badge className="bg-yellow-100 text-yellow-800">En congé</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const getPrioriteBadge = (priorite: string) => {
    switch (priorite) {
      case "haute":
        return <Badge className="bg-red-100 text-red-800">Haute</Badge>;
      case "normale":
        return <Badge className="bg-blue-100 text-blue-800">Normale</Badge>;
      case "basse":
        return <Badge className="bg-gray-100 text-gray-800">Basse</Badge>;
      default:
        return <Badge variant="outline">{priorite}</Badge>;
    }
  };

  const getStatutTache = (statut: string) => {
    switch (statut) {
      case "terminee":
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Terminée
        </Badge>;
      case "en_cours":
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          En cours
        </Badge>;
      case "a_faire":
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          À faire
        </Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <ModuleNavigation />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-600" />
          Gestion du Personnel
        </h1>
        <Button 
          onClick={() => setShowEmployeForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Employé
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-8 h-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmployes}</p>
              <p className="text-gray-600">Total Employés</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{employesActifs}</p>
              <p className="text-gray-600">Employés Actifs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="w-8 h-8 text-orange-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{tachesEnCours}</p>
              <p className="text-gray-600">Tâches en Cours</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <PiggyBank className="w-8 h-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEpargne)}</p>
              <p className="text-gray-600">Total Épargne</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employes">Employés</TabsTrigger>
          <TabsTrigger value="taches">Tâches</TabsTrigger>
        </TabsList>

        <TabsContent value="employes" className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous les rôles</option>
              <option value="administrateur">Administrateur</option>
              <option value="gestionnaire">Gestionnaire</option>
              <option value="soigneur">Soigneur</option>
            </select>
          </div>

          {/* Liste des employés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployes.map((employe: any) => (
              <Card key={employe.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{employe.prenom} {employe.nom}</CardTitle>
                      <p className="text-sm text-gray-600">{getRoleLabel(employe.role)}</p>
                    </div>
                    {getStatutBadge(employe.statut)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{employe.telephone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{employe.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Embauché le {formatDate(employe.dateEmbauche)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Euro className="w-4 h-4 text-gray-400" />
                      <span>Salaire: {formatCurrency(employe.salaire)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PiggyBank className="w-4 h-4 text-gray-400" />
                      <span>Épargne: {formatCurrency(employe.soldeEpargne || 0)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
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
                      onClick={() => deleteEmployeMutation.mutate(employe.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun employé trouvé</p>
                <Button 
                  onClick={() => setShowEmployeForm(true)}
                  className="mt-4"
                >
                  Ajouter un employé
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="taches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des Tâches</h2>
            <Button 
              onClick={() => setShowTacheForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Tâche
            </Button>
          </div>

          <div className="space-y-4">
            {tachesArray.map((tache: any) => (
              <Card key={tache.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{tache.titre}</h3>
                        {getStatutTache(tache.statut)}
                        {getPrioriteBadge(tache.priorite)}
                      </div>
                      <p className="text-gray-600 mb-3">{tache.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Assigné à: {getEmployeNom(tache.assigneA)}</span>
                        <span>Échéance: {formatDate(tache.dateLimite)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTacheMutation.mutate(tache.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tachesArray.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune tâche trouvée</p>
                <Button 
                  onClick={() => setShowTacheForm(true)}
                  className="mt-4"
                >
                  Créer une tâche
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showEmployeForm} onOpenChange={setShowEmployeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEmploye ? "Modifier l'employé" : "Nouvel employé"}
            </DialogTitle>
            <DialogDescription>
              {editingEmploye ? "Modifiez les informations de l'employé" : "Ajoutez un nouvel employé à votre équipe"}
            </DialogDescription>
          </DialogHeader>
          <EmployeForm
            employe={editingEmploye}
            onSuccess={() => {
              setShowEmployeForm(false);
              setEditingEmploye(null);
            }}
            onCancel={() => {
              setShowEmployeForm(false);
              setEditingEmploye(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTacheForm} onOpenChange={setShowTacheForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
            <DialogDescription>
              Assignez une nouvelle tâche à un employé
            </DialogDescription>
          </DialogHeader>
          <TacheForm
            employes={employesArray}
            employePreselectionne={selectedEmployeForTache}
            onSuccess={() => {
              setShowTacheForm(false);
              setSelectedEmployeForTache(null);
            }}
            onCancel={() => {
              setShowTacheForm(false);
              setSelectedEmployeForTache(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEpargneForm} onOpenChange={setShowEpargneForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gestion de l'épargne</DialogTitle>
            <DialogDescription>
              Gérez l'épargne salariale de l'employé
            </DialogDescription>
          </DialogHeader>
          <EpargneForm
            employe={selectedEmployeForEpargne}
            onSuccess={() => {
              setShowEpargneForm(false);
              setSelectedEmployeForEpargne(null);
            }}
            onCancel={() => {
              setShowEpargneForm(false);
              setSelectedEmployeForEpargne(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}