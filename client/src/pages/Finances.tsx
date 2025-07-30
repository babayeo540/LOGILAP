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
  Calendar
} from "lucide-react";
import VenteForm from "../components/VenteForm";
import DepenseForm from "../components/DepenseForm";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Finances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showVenteForm, setShowVenteForm] = useState(false);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data for now - would come from API in real implementation
  const mockTransactions = [
    {
      id: "1",
      type: "vente",
      description: "Vente de 3 lapins",
      montant: 45.00,
      date: "2024-07-25",
      status: "payé"
    },
    {
      id: "2", 
      type: "depense",
      description: "Achat aliment granulés 25kg",
      montant: -28.50,
      date: "2024-07-20",
      status: "payé"
    },
    {
      id: "3",
      type: "vente",
      description: "Vente lapins reproducteurs",
      montant: 120.00,
      date: "2024-07-18",
      status: "en_attente"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "payé":
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case "en_attente":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "annulé":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Calculs des totaux
  const totalVentes = mockTransactions
    .filter(t => t.type === "vente" && t.status === "payé")
    .reduce((sum, t) => sum + t.montant, 0);

  const totalDepenses = Math.abs(mockTransactions
    .filter(t => t.type === "depense" && t.status === "payé")
    .reduce((sum, t) => sum + t.montant, 0));

  const beneficeNet = totalVentes - totalDepenses;

  const filteredTransactions = mockTransactions.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleNavigation 
        currentModule="finances"
        moduleTitle="Gestion Financière"
        moduleDescription="Suivez vos ventes, achats et la rentabilité"
      />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Actions rapides</span>
          </div>
          <div className="flex gap-2">
          <Button 
            onClick={() => setShowVenteForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Nouvelle Vente
          </Button>
          <Button 
            onClick={() => setShowDepenseForm(true)}
            variant="outline"
            className="border-red-200 hover:bg-red-50"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Nouvelle Dépense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ventes</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalVentes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDepenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                beneficeNet >= 0 ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <Euro className={`w-6 h-6 ${beneficeNet >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bénéfice net</p>
                <p className={`text-2xl font-bold ${
                  beneficeNet >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(beneficeNet)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="text-purple-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{mockTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une transaction..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tous les types</option>
                    <option value="vente">Ventes</option>
                    <option value="depense">Dépenses</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Euro className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
                  <p className="text-gray-600">
                    {searchTerm || typeFilter !== "all" 
                      ? "Essayez de modifier vos critères de recherche"
                      : "Commencez par enregistrer votre première transaction"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction: any) => (
                <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          transaction.type === "vente" ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === "vente" ? (
                            <TrendingUp className="text-green-600 w-6 h-6" />
                          ) : (
                            <TrendingDown className="text-red-600 w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {transaction.description}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            transaction.type === "vente" ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === "depense" && "-"}
                            {formatCurrency(Math.abs(transaction.montant))}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTransaction(transaction);
                              if (transaction.type === "vente") {
                                setShowVenteForm(true);
                              } else {
                                setShowDepenseForm(true);
                              }
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
                                toast({
                                  title: "Transaction supprimée",
                                  description: "La transaction a été supprimée avec succès",
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
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rapports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Graphiques à venir</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analyse des catégories à venir</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budgets et objectifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Euro className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Gestion des budgets à venir</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vente Form Dialog */}
      <Dialog open={showVenteForm} onOpenChange={setShowVenteForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction?.type === "vente" ? "Modifier la vente" : "Nouvelle vente"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction?.type === "vente" 
                ? "Modifiez les informations de la vente"
                : "Enregistrez une nouvelle vente"
              }
            </DialogDescription>
          </DialogHeader>
          <VenteForm
            vente={editingTransaction?.type === "vente" ? editingTransaction : null}
            onSuccess={() => {
              setShowVenteForm(false);
              setEditingTransaction(null);
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
              {editingTransaction?.type === "depense" ? "Modifier la dépense" : "Nouvelle dépense"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction?.type === "depense" 
                ? "Modifiez les informations de la dépense"
                : "Enregistrez une nouvelle dépense"
              }
            </DialogDescription>
          </DialogHeader>
          <DepenseForm
            depense={editingTransaction?.type === "depense" ? editingTransaction : null}
            onSuccess={() => {
              setShowDepenseForm(false);
              setEditingTransaction(null);
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