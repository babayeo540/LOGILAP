import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Banknote,
  Plus,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Edit,
  Trash2,
  PiggyBank,
  Wallet,
} from "lucide-react";
import CompteForm from "@/components/CompteForm";
import TransactionForm from "@/components/TransactionForm";
import ModuleNavigation from "@/components/ModuleNavigation";

interface Compte {
  id: string;
  nom: string;
  solde: number;
}

interface Transaction {
  id: string;
  compteId: string;
  type: "entree" | "sortie";
  date: string;
  montant: number;
  description: string;
}

export default function Tresorerie() {
  const [searchTerm, setSearchTerm] = useState("");
  const [compteFilter, setCompteFilter] = useState("all");
  const [showCompteForm, setShowCompteForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingCompte, setEditingCompte] = useState<Compte | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Requêtes de données
  const {
    data: comptes = [],
    isLoading: isComptesLoading,
    error: comptesError,
  } = useQuery<Compte[]>({
    queryKey: ["/api/tresorerie/comptes"],
    queryFn: async () => apiRequest("/api/tresorerie/comptes"),
  });

  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    error: transactionsError,
  } = useQuery<Transaction[]>({
    queryKey: ["/api/tresorerie/transactions"],
    queryFn: async () => apiRequest("/api/tresorerie/transactions"),
  });

  // Mutations pour les comptes
  const compteMutation = useMutation({
    mutationFn: (compteData: Partial<Compte>) => {
      if (compteData.id) {
        return apiRequest(`/api/tresorerie/comptes/${compteData.id}`, {
          method: "PUT",
          body: JSON.stringify(compteData),
        });
      } else {
        return apiRequest("/api/tresorerie/comptes", {
          method: "POST",
          body: JSON.stringify(compteData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tresorerie/comptes"],
      });
      setShowCompteForm(false);
      setEditingCompte(null);
      toast({
        title: "Succès",
        description: "Compte enregistré avec succès.",
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

  const deleteCompteMutation = useMutation({
    mutationFn: (compteId: string) =>
      apiRequest(`/api/tresorerie/comptes/${compteId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tresorerie/comptes"],
      });
      toast({
        title: "Succès",
        description: "Compte supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression du compte : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutations pour les transactions
  const transactionMutation = useMutation({
    mutationFn: (transactionData: Partial<Transaction>) => {
      if (transactionData.id) {
        return apiRequest(`/api/tresorerie/transactions/${transactionData.id}`, {
          method: "PUT",
          body: JSON.stringify(transactionData),
        });
      } else {
        return apiRequest("/api/tresorerie/transactions", {
          method: "POST",
          body: JSON.stringify(transactionData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tresorerie/transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/tresorerie/comptes"],
      }); // Mettre à jour les soldes des comptes
      setShowTransactionForm(false);
      setEditingTransaction(null);
      toast({
        title: "Succès",
        description: "Transaction enregistrée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'enregistrement de la transaction : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (transactionId: string) =>
      apiRequest(`/api/tresorerie/transactions/${transactionId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/tresorerie/transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/tresorerie/comptes"],
      }); // Mettre à jour les soldes des comptes
      toast({
        title: "Succès",
        description: "Transaction supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression de la transaction : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filtrage et recherche optimisés
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch = t.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCompte =
          compteFilter === "all" || t.compteId === compteFilter;
        return matchesSearch && matchesCompte;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, compteFilter]);

  const getCompteNom = (id: string) => {
    const compte = comptes.find((c) => c.id === id);
    return compte ? compte.nom : "N/A";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  if (isComptesLoading || isTransactionsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (comptesError || transactionsError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Erreur de chargement des données. Veuillez réessayer.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <ModuleNavigation
            title="Trésorerie"
            description="Gérez vos comptes et transactions financières"
            icon={<Banknote className="w-6 h-6 text-primary-600" />}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowCompteForm(true);
                setEditingCompte(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouveau Compte
            </Button>
            <Button
              onClick={() => {
                setShowTransactionForm(true);
                setEditingTransaction(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvelle Transaction
            </Button>
          </div>
        </div>

        <Tabs defaultValue="comptes" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="comptes">Comptes</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
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

          <TabsContent value="comptes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comptes.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucun compte enregistré.
                </p>
              ) : (
                comptes.map((compte) => (
                  <Card key={compte.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-purple-500" />
                          {compte.nom}
                        </CardTitle>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          Solde :{" "}
                          <span className="font-bold">
                            {formatCurrency(compte.solde)}
                          </span>
                        </span>
                      </p>
                      <div className="flex items-center space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCompte(compte);
                            setShowCompteForm(true);
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
                                `Êtes-vous sûr de vouloir supprimer le compte ${compte.nom} ?`
                              )
                            ) {
                              deleteCompteMutation.mutate(compte.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucune transaction trouvée.
                </p>
              ) : (
                filteredTransactions.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {t.type === "entree" ? (
                            <ArrowUpRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-red-500" />
                          )}
                          Transaction
                        </CardTitle>
                        <Badge variant="secondary">{t.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Compte :{" "}
                        <span className="font-medium">
                          {getCompteNom(t.compteId)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Date :{" "}
                        <span className="font-medium">
                          {new Date(t.date).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Montant :{" "}
                        <span className="font-medium">
                          {formatCurrency(t.montant)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Description :{" "}
                        <span className="font-medium">{t.description}</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTransaction(t);
                            setShowTransactionForm(true);
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
                                `Êtes-vous sûr de vouloir supprimer cette transaction ?`
                              )
                            ) {
                              deleteTransactionMutation.mutate(t.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog pour Compte Form */}
      <Dialog open={showCompteForm} onOpenChange={setShowCompteForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCompte ? "Modifier le compte" : "Nouveau compte"}
            </DialogTitle>
            <DialogDescription>
              {editingCompte
                ? "Modifiez les informations du compte"
                : "Enregistrez un nouveau compte pour la gestion de votre trésorerie"}
            </DialogDescription>
          </DialogHeader>
          <CompteForm
            compte={editingCompte}
            onSuccess={(data) => {
              compteMutation.mutate(data);
            }}
            onCancel={() => {
              setShowCompteForm(false);
              setEditingCompte(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pour Transaction Form */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction
                ? "Modifier la transaction"
                : "Nouvelle transaction"}
            </DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle entrée ou sortie d'argent
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            comptes={comptes}
            onSuccess={(data) => {
              transactionMutation.mutate(data);
            }}
            onCancel={() => {
              setShowTransactionForm(false);
              setEditingTransaction(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}