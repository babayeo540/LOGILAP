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
  Receipt, 
  Plus, 
  Search, 
  Calendar,
  TrendingDown,
  DollarSign,
  FileText,
  Edit,
  Trash2,
  Filter,
  BarChart3,
  PieChart,
  Euro
} from "lucide-react";
import DepenseForm from "../components/DepenseForm";

export default function Depenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("all");
  const [periodeFilter, setPeriodeFilter] = useState("mois");
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [editingDepense, setEditingDepense] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data pour les dépenses
  const mockDepenses = [
    {
      id: "1",
      date: "2024-07-25",
      montant: 850.00,
      categorie: "salaires",
      description: "Salaire mensuel Jean Martin",
      fournisseurBeneficiaire: "Jean Martin",
      facture: "SALAIRE-2024-07",
      moyenPaiement: "virement",
      notes: "Salaire gestionnaire juillet 2024"
    },
    {
      id: "2",
      date: "2024-07-22",
      montant: 120.50,
      categorie: "electricite",
      description: "Facture électricité bâtiment principal",
      fournisseurBeneficiaire: "EDF",
      facture: "EDF-2024-07-001",
      moyenPaiement: "prelevement",
      notes: "Consommation juillet 2024"
    },
    {
      id: "3",
      date: "2024-07-20",
      montant: 450.00,
      categorie: "alimentation",
      description: "Achat granulés lapins 25 sacs",
      fournisseurBeneficiaire: "Aliments Durand",
      facture: "ALI-2024-156",
      moyenPaiement: "cheque",
      notes: "Livraison granulés croissance et reproduction"
    },
    {
      id: "4",
      date: "2024-07-18",
      montant: 75.00,
      categorie: "veterinaire",
      description: "Consultation vétérinaire + vaccins",
      fournisseurBeneficiaire: "Dr. Dubois",
      facture: "VET-2024-089",
      moyenPaiement: "especes",
      notes: "Vaccination lot reproducteurs"
    },
    {
      id: "5",
      date: "2024-07-15",
      montant: 200.00,
      categorie: "maintenance",
      description: "Réparation système ventilation",
      fournisseurBeneficiaire: "Maintenance Pro",
      facture: "MAINT-2024-34",
      moyenPaiement: "virement",
      notes: "Réparation ventilateur hangar A"
    },
    {
      id: "6",
      date: "2024-07-10",
      montant: 35.80,
      categorie: "carburant",
      description: "Carburant véhicule ferme",
      fournisseurBeneficiaire: "Station Total",
      facture: "TOTAL-789456",
      moyenPaiement: "carte",
      notes: "Plein essence pick-up"
    }
  ];

  const categories = [
    { id: "salaires", label: "Salaires", icon: "👥", color: "bg-purple-100 text-purple-800" },
    { id: "electricite", label: "Électricité", icon: "⚡", color: "bg-yellow-100 text-yellow-800" },
    { id: "eau", label: "Eau", icon: "💧", color: "bg-blue-100 text-blue-800" },
    { id: "carburant", label: "Carburant", icon: "⛽", color: "bg-orange-100 text-orange-800" },
    { id: "alimentation", label: "Alimentation", icon: "🌾", color: "bg-green-100 text-green-800" },
    { id: "veterinaire", label: "Vétérinaire", icon: "🏥", color: "bg-red-100 text-red-800" },
    { id: "maintenance", label: "Maintenance", icon: "🔧", color: "bg-gray-100 text-gray-800" },
    { id: "materiel", label: "Matériel", icon: "📦", color: "bg-indigo-100 text-indigo-800" },
    { id: "loyer", label: "Loyer", icon: "🏠", color: "bg-pink-100 text-pink-800" },
    { id: "assurance", label: "Assurance", icon: "🛡️", color: "bg-teal-100 text-teal-800" },
    { id: "administratif", label: "Frais Admin", icon: "📋", color: "bg-cyan-100 text-cyan-800" },
    { id: "transport", label: "Transport", icon: "🚚", color: "bg-lime-100 text-lime-800" }
  ];

  const getCategorieInfo = (categorieId: string) => {
    return categories.find(c => c.id === categorieId) || 
           { id: categorieId, label: categorieId, icon: "📄", color: "bg-gray-100 text-gray-800" };
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

  const filteredDepenses = mockDepenses.filter((depense: any) => {
    const matchesSearch = depense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         depense.fournisseurBeneficiaire.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === "all" || depense.categorie === categorieFilter;
    
    // Filtre par période
    const depenseDate = new Date(depense.date);
    const maintenant = new Date();
    let matchesPeriode = true;
    
    if (periodeFilter === "semaine") {
      const uneSemaineAgo = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesPeriode = depenseDate >= uneSemaineAgo;
    } else if (periodeFilter === "mois") {
      matchesPeriode = depenseDate.getMonth() === maintenant.getMonth() && 
                      depenseDate.getFullYear() === maintenant.getFullYear();
    } else if (periodeFilter === "trimestre") {
      const trimestre = Math.floor(maintenant.getMonth() / 3);
      const depenseTrimestrе = Math.floor(depenseDate.getMonth() / 3);
      matchesPeriode = depenseTrimestrе === trimestre && 
                      depenseDate.getFullYear() === maintenant.getFullYear();
    }
    
    return matchesSearch && matchesCategorie && matchesPeriode;
  });

  // Calculs des statistiques
  const totalDepenses = filteredDepenses.reduce((sum, d) => sum + d.montant, 0);
  const nbDepenses = filteredDepenses.length;
  const depenseMoyenne = nbDepenses > 0 ? totalDepenses / nbDepenses : 0;
  
  // Répartition par catégorie
  const repartitionCategories = categories.map(cat => {
    const depensesCategorie = filteredDepenses.filter(d => d.categorie === cat.id);
    const total = depensesCategorie.reduce((sum, d) => sum + d.montant, 0);
    const pourcentage = totalDepenses > 0 ? (total / totalDepenses) * 100 : 0;
    
    return {
      ...cat,
      total,
      pourcentage,
      nb: depensesCategorie.length
    };
  }).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Dépenses</h1>
          <p className="text-gray-600">Suivez toutes les sorties d'argent de votre ferme</p>
        </div>
        <Button 
          onClick={() => setShowDepenseForm(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Dépense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total dépenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDepenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nb dépenses</p>
                <p className="text-2xl font-bold text-gray-900">{nbDepenses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dépense moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(depenseMoyenne)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart className="text-purple-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Catégories</p>
                <p className="text-2xl font-bold text-gray-900">{repartitionCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="liste" className="space-y-6">
        <TabsList>
          <TabsTrigger value="liste">Liste des dépenses</TabsTrigger>
          <TabsTrigger value="categories">Par catégorie</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une dépense..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={categorieFilter}
                    onChange={(e) => setCategorieFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <select
                    value={periodeFilter}
                    onChange={(e) => setPeriodeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="semaine">Cette semaine</option>
                    <option value="mois">Ce mois</option>
                    <option value="trimestre">Ce trimestre</option>
                    <option value="all">Toutes les périodes</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des dépenses */}
          <div className="space-y-4">
            {filteredDepenses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune dépense trouvée</h3>
                  <p className="text-gray-600">
                    {searchTerm || categorieFilter !== "all" || periodeFilter !== "all"
                      ? "Essayez de modifier vos critères de recherche"
                      : "Commencez par enregistrer votre première dépense"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDepenses.map((depense: any) => {
                const categorieInfo = getCategorieInfo(depense.categorie);
                
                return (
                  <Card key={depense.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-xl">{categorieInfo.icon}</div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{depense.description}</h3>
                              <Badge className={categorieInfo.color}>
                                {categorieInfo.label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-500">Date</p>
                              <p className="font-medium">{formatDate(depense.date)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bénéficiaire</p>
                              <p className="font-medium">{depense.fournisseurBeneficiaire}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Facture</p>
                              <p className="font-medium">{depense.facture}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Paiement</p>
                              <p className="font-medium">
                                {depense.moyenPaiement === "virement" ? "Virement" :
                                 depense.moyenPaiement === "cheque" ? "Chèque" :
                                 depense.moyenPaiement === "especes" ? "Espèces" :
                                 depense.moyenPaiement === "carte" ? "Carte" :
                                 depense.moyenPaiement === "prelevement" ? "Prélèvement" :
                                 depense.moyenPaiement}
                              </p>
                            </div>
                          </div>

                          {depense.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{depense.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-red-600 mb-2">
                            {formatCurrency(depense.montant)}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingDepense(depense);
                                setShowDepenseForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
                                  toast({
                                    title: "Dépense supprimée",
                                    description: "La dépense a été supprimée avec succès",
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repartitionCategories.map((categorie) => (
              <Card key={categorie.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categorie.icon}</span>
                      <CardTitle className="text-lg">{categorie.label}</CardTitle>
                    </div>
                    <Badge className={categorie.color}>
                      {categorie.pourcentage.toFixed(1)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(categorie.total)}
                      </p>
                      <p className="text-sm text-gray-600">{categorie.nb} dépense(s)</p>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(categorie.pourcentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rapports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Rapports de dépenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Module de rapports avancés à venir</p>
                <p className="text-sm text-gray-500 mt-2">
                  Graphiques, évolutions temporelles, analyses comparatives
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dépense Form Dialog */}
      <Dialog open={showDepenseForm} onOpenChange={setShowDepenseForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDepense ? "Modifier la dépense" : "Nouvelle dépense"}
            </DialogTitle>
            <DialogDescription>
              {editingDepense 
                ? "Modifiez les informations de la dépense"
                : "Enregistrez une nouvelle sortie d'argent"
              }
            </DialogDescription>
          </DialogHeader>
          <DepenseForm
            depense={editingDepense}
            categories={categories}
            onSuccess={() => {
              setShowDepenseForm(false);
              setEditingDepense(null);
              toast({
                title: "Succès",
                description: "Dépense enregistrée avec succès",
              });
            }}
            onCancel={() => {
              setShowDepenseForm(false);
              setEditingDepense(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}