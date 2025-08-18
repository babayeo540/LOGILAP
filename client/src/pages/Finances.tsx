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
  Euro,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Banknote,
  Receipt,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import VenteForm from "../components/VenteForm";
import DepenseForm from "../components/DepenseForm";
import ModuleNavigation from "@/components/ModuleNavigation";

// Définition des interfaces pour une meilleure sécurité
interface Vente {
  id: string;
  type: "vente";
  date: string;
  montant: number;
  description: string;
}

interface Depense {
  id: string;
  type: "depense";
  date: string;
  montant: number;
  description: string;
}

type Transaction = Vente | Depense;

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
};

export default function Finances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showVenteForm, setShowVenteForm] = useState(false);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Récupération des ventes
  const {
    data: ventes = [],
    isLoading: isLoadingVentes,
    isError: isErrorVentes,
  } = useQuery<Vente[]>({
    queryKey: ["/api/ventes"],
    queryFn: async () => {
      const response = await fetch("/api/ventes");
      if (!response.ok) {
        throw new Error("Échec de la récupération des ventes");
      }
      return response.json();
    },
  });

  // Récupération des dépenses
  const {
    data: depenses = [],
    isLoading: isLoadingDepenses,
    isError: isErrorDepenses,
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

  const isLoading = isLoadingVentes || isLoadingDepenses;
  const isError = isErrorVentes || isErrorDepenses;

  // Combinaison et tri des transactions
  const transactions = useMemo(() => {
    const allTransactions = [...ventes, ...depenses];
    return allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [ventes, depenses]);

  // Calcul des totaux
  const { totalVentes, totalDepenses, solde } = useMemo(() => {
    const totalVentes = ventes.reduce((sum, v) => sum + v.montant, 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
    const solde = totalVentes - totalDepenses;
    return { totalVentes, totalDepenses, solde };
  }, [ventes, depenses]);

  // Filtrage et recherche
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const passesTypeFilter =
        typeFilter === "all" || transaction.type === typeFilter;
      const passesSearchTerm = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return passesTypeFilter && passesSearchTerm;
    });
  }, [transactions, searchTerm, typeFilter]);

  // Mutations pour la suppression
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "vente" | "depense" }) => {
      const endpoint = type === "vente" ? "/api/ventes" : "/api/depenses";
      const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }
      return response.json();
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ventes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/depenses"] });
      toast({
        title: "Succès",
        description: `${type === "vente" ? "Vente" : "Dépense"} supprimée avec succès`,
      });
    },
    onError: (error, { type }) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la suppression de la ${
          type === "vente" ? "vente" : "dépense"
        }: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (transaction: Transaction) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      deleteMutation.mutate({ id: transaction.id, type: transaction.type });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    if (transaction.type === "vente") {
      setShowVenteForm(true);
    } else {
      setShowDepenseForm(true);
    }
  };

  const handleOpenVenteForm = () => {
    setEditingTransaction(null);
    setShowVenteForm(true);
  };

  const handleOpenDepenseForm = () => {
    setEditingTransaction(null);
    setShowDepenseForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement des finances...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>
          Erreur lors du chargement des données financières. Veuillez réessayer
          plus tard.
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
            <Banknote className="w-8 h-8 text-primary-600" />
            Gestion Financière
          </h1>
          <p className="mt-2 text-gray-600">
            Suivez les recettes, les dépenses et la santé financière de votre
            élevage.
          </p>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Euro className="w-6 h-6 text-yellow-500" />
                  Solde
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-4xl font-bold ${
                  solde >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {solde.toFixed(2)} XOF
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  Total Ventes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {totalVentes.toFixed(2)} XOF
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                  Total Dépenses
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600">
                {totalDepenses.toFixed(2)} XOF
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleOpenVenteForm}
              className="bg-green-600 hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Vente
            </Button>
            <Button
              onClick={handleOpenDepenseForm}
              className="bg-red-600 hover:bg-red-700 transition"
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
              <Receipt className="w-4 h-4 mr-2" />
              Historique des transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="liste" className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 border rounded-md text-sm"
              >
                <option value="all">Tous</option>
                <option value="vente">Ventes</option>
                <option value="depense">Dépenses</option>
              </select>
            </div>
            {filteredTransactions.length > 0 ? (
              <div className="grid gap-4">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center gap-2">
                          {transaction.type === "vente" ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                          <span className="font-semibold text-gray-900">
                            {transaction.description}
                          </span>
                        </span>
                        <Badge
                          variant={
                            transaction.type === "vente"
                              ? "default"
                              : "destructive"
                          }
                          className="font-medium text-xs"
                        >
                          {transaction.type === "vente" ? "Vente" : "Dépense"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <span>Montant:</span>
                        </div>
                        <span
                          className={`font-bold ${
                            transaction.type === "vente"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.montant.toFixed(2)} XOF
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Date:</span>
                        </div>
                        <span className="font-medium">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction)}
                          disabled={deleteMutation.isPending}
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
                Aucune transaction trouvée pour les critères de recherche.
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Vente Form Dialog */}
        <Dialog open={showVenteForm} onOpenChange={setShowVenteForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction?.type === "vente"
                  ? "Modifier la vente"
                  : "Nouvelle vente"}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction?.type === "vente"
                  ? "Modifiez les informations de la vente"
                  : "Enregistrez une nouvelle recette"}
              </DialogDescription>
            </DialogHeader>
            <VenteForm
              vente={
                editingTransaction?.type === "vente" ? editingTransaction : null
              }
              onSuccess={() => {
                setShowVenteForm(false);
                setEditingTransaction(null);
                queryClient.invalidateQueries({ queryKey: ["/api/ventes"] });
                toast({
                  title: "Succès",
                  description: "Vente enregistrée avec succès",
                });
              }}
              onCancel={() => {
                setShowVenteForm(false);
                setEditingTransaction(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Dépense Form Dialog */}
        <Dialog open={showDepenseForm} onOpenChange={setShowDepenseForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction?.type === "depense"
                  ? "Modifier la dépense"
                  : "Nouvelle dépense"}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction?.type === "depense"
                  ? "Modifiez les informations de la dépense"
                  : "Enregistrez une nouvelle dépense"}
              </DialogDescription>
            </DialogHeader>
            <DepenseForm
              depense={
                editingTransaction?.type === "depense"
                  ? editingTransaction
                  : null
              }
              onSuccess={() => {
                setShowDepenseForm(false);
                setEditingTransaction(null);
                queryClient.invalidateQueries({ queryKey: ["/api/depenses"] });
                toast({
                  title: "Succès",
                  description: "Dépense enregistrée avec succès",
                });
              }}
              onCancel={() => {
                setShowDepenseForm(false);
                setEditingTransaction(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}