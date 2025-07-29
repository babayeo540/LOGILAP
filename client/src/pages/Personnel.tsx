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

  // Mock data pour les employés
  const mockEmployes = [
    {
      id: "1",
      nom: "Martin",
      prenom: "Jean",
      role: "gestionnaire",
      dateEmbauche: "2023-01-15",
      telephone: "06 12 34 56 78",
      email: "jean.martin@lapgest.fr",
      adresse: "12 rue des Lapins, 75001 Paris",
      qualifications: ["Soins vétérinaires", "Gestion reproduction"],
      statut: "actif",
      salaire: 2500,
      soldeEpargne: 1250.00
    },
    {
      id: "2",
      nom: "Dubois",
      prenom: "Marie",
      role: "soigneur",
      dateEmbauche: "2023-03-20",
      telephone: "06 98 76 54 32",
      email: "marie.dubois@lapgest.fr",
      adresse: "45 avenue des Éleveurs, 75002 Paris",
      qualifications: ["Alimentation", "Nettoyage"],
      statut: "actif",
      salaire: 1800,
      soldeEpargne: 540.00
    },
    {
      id: "3",
      nom: "Lambert",
      prenom: "Pierre",
      role: "administrateur",
      dateEmbauche: "2022-09-10",
      telephone: "06 55 44 33 22",
      email: "pierre.lambert@lapgest.fr",
      adresse: "78 boulevard de la Ferme, 75003 Paris",
      qualifications: ["Comptabilité", "Management", "Reproduction"],
      statut: "actif",
      salaire: 3200,
      soldeEpargne: 2100.50
    }
  ];

  // Mock data pour les tâches
  const mockTaches = [
    {
      id: "1",
      titre: "Nettoyage enclos maternité",
      description: "Nettoyage complet des cages de maternité section A",
      assigneA: ["1", "2"],
      dateLimite: "2024-07-30",
      priorite: "normale",
      statut: "en_cours",
      dateCreation: "2024-07-28",
      dateCompletion: null,
      creePar: "3"
    },
    {
      id: "2",
      titre: "Vaccination lot reproducteurs",
      description: "Vaccination RHD pour les reproducteurs mâles",
      assigneA: ["1"],
      dateLimite: "2024-08-02",
      priorite: "haute",
      statut: "a_faire",
      dateCreation: "2024-07-25",
      dateCompletion: null,
      creePar: "3"
    },
    {
      id: "3",
      titre: "Inventaire aliments",
      description: "Contrôle stock granulés et mise à jour système",
      assigneA: ["2"],
      dateLimite: "2024-07-29",
      priorite: "normale",
      statut: "terminee",
      dateCreation: "2024-07-20",
      dateCompletion: "2024-07-28",
      creePar: "1"
    }
  ];

  const getEmployeNom = (employeId: string) => {
    const employe = mockEmployes.find(e => e.id === employeId);
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrateur":
        return <Badge className="bg-purple-100 text-purple-800">Administrateur</Badge>;
      case "gestionnaire":
        return <Badge className="bg-blue-100 text-blue-800">Gestionnaire</Badge>;
      case "soigneur":
        return <Badge className="bg-green-100 text-green-800">Soigneur</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "a_faire":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />À faire</Badge>;
      case "en_cours":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />En cours</Badge>;
      case "terminee":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Terminée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{statut}</Badge>;
    }
  };

  const getPrioriteBadge = (priorite: string) => {
    switch (priorite) {
      case "haute":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Haute</Badge>;
      case "normale":
        return <Badge className="bg-gray-100 text-gray-800">Normale</Badge>;
      case "basse":
        return <Badge className="bg-green-100 text-green-800">Basse</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priorite}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredEmployes = mockEmployes.filter((employe: any) => {
    const matchesSearch = employe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employe.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employe.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculs des statistiques
  const totalEmployes = mockEmployes.length;
  const employesActifs = mockEmployes.filter(e => e.statut === "actif").length;
  const tachesEnCours = mockTaches.filter(t => t.statut === "en_cours").length;
  const tachesEnRetard = mockTaches.filter(t => {
    return t.statut !== "terminee" && new Date(t.dateLimite) < new Date();
  }).length;
  const totalEpargne = mockEmployes.reduce((sum, e) => sum + e.soldeEpargne, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Personnel</h1>
          <p className="text-gray-600">Gérez vos employés, tâches et épargne salariale</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowEmployeForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Employé
          </Button>
          <Button 
            onClick={() => setShowTacheForm(true)}
            variant="outline"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Nouvelle Tâche
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employés</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployes}</p>
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
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{employesActifs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tâches en cours</p>
                <p className="text-2xl font-bold text-yellow-600">{tachesEnCours}</p>
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
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600">{tachesEnRetard}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="text-purple-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Épargne totale</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalEpargne)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employes">Employés</TabsTrigger>
          <TabsTrigger value="taches">Tâches</TabsTrigger>
          <TabsTrigger value="epargne">Épargne</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="employes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
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
                <div className="flex gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="administrateur">Administrateurs</option>
                    <option value="gestionnaire">Gestionnaires</option>
                    <option value="soigneur">Soigneurs</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employés List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== "all" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par ajouter votre premier employé"
                  }
                </p>
              </div>
            ) : (
              filteredEmployes.map((employe: any) => (
                <Card key={employe.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="text-primary-600 w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{employe.prenom} {employe.nom}</CardTitle>
                          {getRoleBadge(employe.role)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Embauché le {formatDate(employe.dateEmbauche)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employe.telephone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employe.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Salaire: {formatCurrency(employe.salaire)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PiggyBank className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Épargne: {formatCurrency(employe.soldeEpargne)}</span>
                        </div>
                      </div>

                      {/* Qualifications */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Qualifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {employe.qualifications.map((qual: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {qual}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployeForTache(employe);
                            setShowTacheForm(true);
                          }}
                          className="flex-1"
                        >
                          <Briefcase className="w-3 h-3 mr-1" />
                          Tâche
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployeForEpargne(employe);
                            setShowEpargneForm(true);
                          }}
                          className="flex-1"
                        >
                          <PiggyBank className="w-3 h-3 mr-1" />
                          Épargne
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEmploye(employe);
                            setShowEmployeForm(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="taches" className="space-y-6">
          <div className="space-y-4">
            {mockTaches.map((tache) => (
              <Card key={tache.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{tache.titre}</h3>
                        {getStatutBadge(tache.statut)}
                        {getPrioriteBadge(tache.priorite)}
                      </div>
                      <p className="text-gray-600 mb-3">{tache.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Assigné à</p>
                          <div className="space-y-1">
                            {tache.assigneA.map((employeId: string) => (
                              <p key={employeId} className="font-medium">{getEmployeNom(employeId)}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Date limite</p>
                          <p className="font-medium">{formatDate(tache.dateLimite)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Créé par</p>
                          <p className="font-medium">{getEmployeNom(tache.creePar)}</p>
                        </div>
                        {tache.dateCompletion && (
                          <div>
                            <p className="text-gray-500">Terminé le</p>
                            <p className="font-medium">{formatDate(tache.dateCompletion)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {tache.statut !== "terminee" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Tâche marquée comme terminée",
                              description: `La tâche "${tache.titre}" a été marquée comme terminée`,
                            });
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
                            toast({
                              title: "Tâche supprimée",
                              description: "La tâche a été supprimée avec succès",
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="epargne" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEmployes.map((employe) => (
              <Card key={employe.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{employe.prenom} {employe.nom}</span>
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
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(employe.soldeEpargne)}
                      </p>
                      <p className="text-sm text-gray-600">Solde épargne</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(employe.salaire)}
                      </p>
                      <p className="text-sm text-gray-600">Salaire mensuel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planning et absences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Module de planning à venir</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employé Form Dialog */}
      <Dialog open={showEmployeForm} onOpenChange={setShowEmployeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEmploye ? "Modifier l'employé" : "Nouvel employé"}
            </DialogTitle>
            <DialogDescription>
              {editingEmploye 
                ? "Modifiez les informations de l'employé"
                : "Ajoutez un nouvel employé à votre équipe"
              }
            </DialogDescription>
          </DialogHeader>
          <EmployeForm
            employe={editingEmploye}
            onSuccess={() => {
              setShowEmployeForm(false);
              setEditingEmploye(null);
              toast({
                title: "Succès",
                description: "Employé enregistré avec succès",
              });
            }}
            onCancel={() => {
              setShowEmployeForm(false);
              setEditingEmploye(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Tâche Form Dialog */}
      <Dialog open={showTacheForm} onOpenChange={setShowTacheForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
            <DialogDescription>
              Créez et assignez une nouvelle tâche
            </DialogDescription>
          </DialogHeader>
          <TacheForm
            employePreselectionne={selectedEmployeForTache}
            onSuccess={() => {
              setShowTacheForm(false);
              setSelectedEmployeForTache(null);
              toast({
                title: "Succès",
                description: "Tâche créée avec succès",
              });
            }}
            onCancel={() => {
              setShowTacheForm(false);
              setSelectedEmployeForTache(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Épargne Form Dialog */}
      <Dialog open={showEpargneForm} onOpenChange={setShowEpargneForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion de l'épargne</DialogTitle>
            <DialogDescription>
              Enregistrez un versement ou une restitution d'épargne
            </DialogDescription>
          </DialogHeader>
          <EpargneForm
            employe={selectedEmployeForEpargne}
            onSuccess={() => {
              setShowEpargneForm(false);
              setSelectedEmployeForEpargne(null);
              toast({
                title: "Succès",
                description: "Transaction d'épargne enregistrée avec succès",
              });
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