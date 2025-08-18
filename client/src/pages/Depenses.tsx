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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  TrendingDown,
  Edit,
  Trash2,
  Filter,
  BarChart3,
  PieChart,
  Euro,
} from "lucide-react";
import DepenseForm from "../components/DepenseForm";
import ModuleNavigation from "@/components/ModuleNavigation";

// Définition de l'interface pour une meilleure typage
interface Depense {
  id: string;
  date: string;
  montant: number;
  categorie: string;
  description: string;
  fournisseurBeneficiaire: string;
  facture: string;
  moyenPaiement: string;
  notes: string;
}

const categories = [
  "all",
  "nourriture",
  "medicaments",
  "salaires",
  "electricite",
  "entretien",
  "transport",
  "autres",
];

const periodes = ["mois", "semaine", "annee"];

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
};

export default function Depenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("all");
  const [periodeFilter, setPeriodeFilter] = useState("mois");
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Utilisation de useQuery pour la logique de production
  const {
    data: depenses,
    isLoading,
    isError,
  } = useQuery<Depense[]>({
    queryKey: ["/api/depenses"],
    queryFn: async () => {
      const response = await fetch("/api/depenses");
      if (!response.ok) {
        throw new Error("Échec de la récupération des dépenses");
      }
      return response.json();
    },
  });

  // Mutation pour la suppression
  const deleteDepenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/depenses/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/depenses"] });
      toast({
        title: "Succès",
        description: "Dépense supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      deleteDepenseMutation.mutate(id);
    }
  };

  const handleEdit = (depense: Depense) => {
    setEditingDepense(depense);
    setShowDepenseForm(true);
  };

  const handleOpenForm = () => {
    setEditingDepense(null);
    setShowDepenseForm(true);
  };

  // Filtrage et recherche
  const filteredDepenses = useMemo(() => {
    if (!depenses) return [];

    const now = new Date();
    let startDate = new Date();

    switch (periodeFilter) {
      case "semaine":
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case "mois":
        startDate.setDate(1);
        break;
      case "annee":
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
    }

    const filtered = depenses.filter((d) => {
      const depenseDate = new Date(d.date);
      const passesPeriodeFilter = depenseDate >= startDate;

      const passesCategorieFilter =
        categorieFilter === "all" || d.categorie === categorieFilter;

      const passesSearchTerm =
        d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fournisseurBeneficiaire
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return passesPeriodeFilter && passesCategorieFilter && passesSearchTerm;
    });

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [depenses, searchTerm, categorieFilter, periodeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement des dépenses...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>
          Erreur lors du chargement des dépenses. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ModuleNavigation />
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary-600" />
            Gestion des Dépenses
          </h1>
          <p className="mt-2 text-gray-600">
            Suivez et analysez toutes les sorties d'argent de votre élevage.
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une dépense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={
                periodeFilter === "mois"
                  ? ""
                  : new Date().toISOString().slice(0, 10)
              }
              onChange={(e) => setPeriodeFilter("date")}
              className="hidden md:block w-auto"
            />
            <Button
              onClick={handleOpenForm}
              className="bg-primary-600 hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Dépense
            </Button>
          </div>
        </div>

        {/* Filters and Tabs */}
        <Tabs defaultValue="liste" className="mb-6">
          <TabsList className="flex overflow-x-auto justify-start">
            <TabsTrigger value="liste">
              <FileText className="w-4 h-4 mr-2" />
              Liste des dépenses
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
              <div className="flex items-center gap-2">
                <select
                  value={categorieFilter}
                  onChange={(e) => setCategorieFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={periodeFilter}
                  onChange={(e) => setPeriodeFilter(e.target.value)}
                  className="p-2 border rounded-md text-sm"
                >
                  {periodes.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filteredDepenses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDepenses.map((depense) => (
                  <Card key={depense.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-gray-900">
                            {depense.description}
                          </span>
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-medium text-xs"
                        >
                          {depense.categorie}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span>Montant:</span>
                        </div>
                        <span className="font-bold text-red-500">
                          {depense.montant.toFixed(2)} XOF
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Date:</span>
                        </div>
                        <span className="font-medium">
                          {formatDate(depense.date)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>Bénéficiaire:</span>
                        </div>
                        <span className="font-medium">
                          {depense.fournisseurBeneficiaire}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>Facture:</span>
                        </div>
                        <span className="font-medium">{depense.facture}</span>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(depense)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(depense.id)}
                          disabled={deleteDepenseMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-8">
                Aucune dépense trouvée pour les critères de recherche.
              </p>
            )}
          </TabsContent>

          {/* Statistics Tab Content (Production-ready version) */}
          <TabsContent value="stats" className="mt-4">
            <Card>
              <CardContent className="p-6 text-center">
                <PieChart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Module de rapports avancés à venir</p>
                <p className="text-sm text-gray-500 mt-2">
                  Graphiques, évolutions temporelles, analyses comparatives
                </p>
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
                  : "Enregistrez une nouvelle sortie d'argent"}
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
    </div>
  );
}