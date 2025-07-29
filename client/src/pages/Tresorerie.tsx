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
  Wallet
} from "lucide-react";
import CompteForm from "../components/CompteForm";
import TransactionForm from "../components/TransactionForm";

export default function Tresorerie() {
  const [searchTerm, setSearchTerm] = useState("");
  const [compteFilter, setCompteFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCompteForm, setShowCompteForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingCompte, setEditingCompte] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data pour les comptes
  const mockComptes = [
    {
      id: "1",
      nom: "Compte Courant Principal",
      type: "banque",
      banque: "Crédit Agricole",
      numero: "FR76 1254 8796 4523 1897 65",
      solde: 12850.75,
      dateOuverture: "2023-01-15",
      statut: "actif"
    },
    {
      id: "2", 
      nom: "Épargne Ferme",
      type: "epargne",
      banque: "Banque Populaire",
      numero: "FR45 7896 5412 3698 7412 58",
      solde: 25600.00,
      dateOuverture: "2023-03-20",
      statut: "actif"
    },
    {
      id: "3",
      nom: "Orange Money",
      type: "mobile_money",
      operateur: "Orange",
      numero: "+33612345678",
      solde: 450.25,
      dateOuverture: "2023-06-10",
      statut: "actif"
    },
    {
      id: "4",
      nom: "Wave",
      type: "mobile_money", 
      operateur: "Wave",
      numero: "+33687654321",
      solde: 150.00,
      dateOuverture: "2024-01-05",
      statut: "actif"
    },
    {
      id: "5",
      nom: "Caisse Espèces",
      type: "especes",
      solde: 850.50,
      dateOuverture: "2023-01-01",
      statut: "actif"
    }
  ];

  // Mock data pour les transactions
  const mockTransactions = [
    {
      id: "1",
      date: "2024-07-29",
      type: "depot",
      montant: 2500.00,
      compteId: "1",
      categorie: "vente_lapins",
      description: "Vente lot reproducteurs Dubois",
      reference: "VTE-2024-089",
      beneficiaire: "M. Dubois",
      statut: "valide"
    },
    {
      id: "2",
      date: "2024-07-28",
      type: "retrait",
      montant: 850.00,
      compteId: "1",
      categorie: "salaire",
      description: "Salaire Jean Martin juillet",
      reference: "SAL-2024-07",
      beneficiaire: "Jean Martin",
      statut: "valide"
    },
    {
      id: "3",
      date: "2024-07-27",
      type: "virement",
      montant: 5000.00,
      compteSourceId: "1",
      compteDestId: "2",
      categorie: "epargne",
      description: "Mise de côté bénéfices juillet",
      reference: "VIR-2024-156",
      statut: "valide"
    },
    {
      id: "4",
      date: "2024-07-26",
      type: "depot",
      montant: 100.00,
      compteId: "3",
      categorie: "divers",
      description: "Rechargement Orange Money",
      reference: "OM-789456",
      statut: "valide"
    },
    {
      id: "5",
      date: "2024-07-25",
      type: "retrait",
      montant: 450.00,
      compteId: "1",
      categorie: "alimentation",
      description: "Achat granulés lapins",
      reference: "ACH-2024-234",
      beneficiaire: "Aliments Durand",
      statut: "valide"
    }
  ];

  const getCompteById = (id: string) => {
    return mockComptes.find(c => c.id === id);
  };

  const getCompteIcon = (type: string) => {
    switch(type) {
      case "banque": return <Building2 className="w-5 h-5" />;
      case "epargne": return <PiggyBank className="w-5 h-5" />;
      case "mobile_money": return <Smartphone className="w-5 h-5" />;
      case "especes": return <Wallet className="w-5 h-5" />;
      default: return <Banknote className="w-5 h-5" />;
    }
  };

  const getCompteColor = (type: string) => {
    switch(type) {
      case "banque": return "bg-blue-100 text-blue-800";
      case "epargne": return "bg-green-100 text-green-800";
      case "mobile_money": return "bg-orange-100 text-orange-800";
      case "especes": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
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

  // Calculs des totaux
  const soldeTotal = mockComptes.reduce((sum, compte) => sum + compte.solde, 0);
  const soldeBanque = mockComptes.filter(c => c.type === "banque" || c.type === "epargne")
                               .reduce((sum, c) => sum + c.solde, 0);
  const soldeMobileMoney = mockComptes.filter(c => c.type === "mobile_money")
                                     .reduce((sum, c) => sum + c.solde, 0);
  const soldeEspeces = mockComptes.filter(c => c.type === "especes")
                                 .reduce((sum, c) => sum + c.solde, 0);

  // Filtrage des transactions
  const filteredTransactions = mockTransactions.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.beneficiaire?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompte = compteFilter === "all" || 
                         transaction.compteId === compteFilter ||
                         transaction.compteSourceId === compteFilter ||
                         transaction.compteDestId === compteFilter;
    
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    return matchesSearch && matchesCompte && matchesType;
  });

  // Statistiques des transactions
  const totalDepots = filteredTransactions.filter(t => t.type === "depot")
                                         .reduce((sum, t) => sum + t.montant, 0);
  const totalRetraits = filteredTransactions.filter(t => t.type === "retrait")
                                           .reduce((sum, t) => sum + t.montant, 0);
  const totalVirements = filteredTransactions.filter(t => t.type === "virement")
                                            .reduce((sum, t) => sum + t.montant, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trésorerie & Banque</h1>
          <p className="text-gray-600">Gérez vos comptes et transactions financières</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowTransactionForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Transaction
          </Button>
          <Button 
            onClick={() => setShowCompteForm(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Compte
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-100">Solde Total</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(soldeTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comptes Bancaires</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(soldeBanque)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Smartphone className="text-orange-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mobile Money</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(soldeMobileMoney)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wallet className="text-gray-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Espèces</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(soldeEspeces)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comptes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comptes">Mes comptes</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="comptes" className="space-y-6">
          {/* Liste des comptes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockComptes.map((compte) => (
              <Card key={compte.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCompteColor(compte.type)}`}>
                        {getCompteIcon(compte.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{compte.nom}</CardTitle>
                        <Badge className={getCompteColor(compte.type)}>
                          {compte.type === "banque" ? "Banque" :
                           compte.type === "epargne" ? "Épargne" :
                           compte.type === "mobile_money" ? "Mobile Money" :
                           compte.type === "especes" ? "Espèces" : compte.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Solde actuel</p>
                      <p className={`text-2xl font-bold ${compte.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(compte.solde)}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {compte.banque && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Banque:</span>
                          <span className="font-medium">{compte.banque}</span>
                        </div>
                      )}
                      {compte.operateur && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Opérateur:</span>
                          <span className="font-medium">{compte.operateur}</span>
                        </div>
                      )}
                      {compte.numero && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Numéro:</span>
                          <span className="font-medium font-mono text-xs">{compte.numero}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ouvert le:</span>
                        <span className="font-medium">{formatDate(compte.dateOuverture)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setEditingCompte(compte);
                          setShowCompteForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Ouvrir formulaire transaction avec ce compte pré-sélectionné
                          setShowTransactionForm(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filtres transactions */}
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
                    value={compteFilter}
                    onChange={(e) => setCompteFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tous les comptes</option>
                    {mockComptes.map(compte => (
                      <option key={compte.id} value={compte.id}>{compte.nom}</option>
                    ))}
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tous types</option>
                    <option value="depot">Dépôts</option>
                    <option value="retrait">Retraits</option>
                    <option value="virement">Virements</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats transactions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total dépôts</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDepots)}</p>
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
                    <p className="text-sm font-medium text-gray-600">Total retraits</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalRetraits)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="text-blue-600 w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Virements</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalVirements)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des transactions */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Banknote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
                  <p className="text-gray-600">Modifiez vos critères de recherche ou créez une nouvelle transaction</p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction: any) => {
                const compte = getCompteById(transaction.compteId);
                const compteSource = getCompteById(transaction.compteSourceId);
                const compteDestination = getCompteById(transaction.compteDestId);
                
                return (
                  <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.type === "depot" ? "bg-green-100" :
                              transaction.type === "retrait" ? "bg-red-100" : "bg-blue-100"
                            }`}>
                              {transaction.type === "depot" ? (
                                <ArrowDownLeft className={`w-5 h-5 ${
                                  transaction.type === "depot" ? "text-green-600" : ""
                                }`} />
                              ) : transaction.type === "retrait" ? (
                                <ArrowUpRight className="text-red-600 w-5 h-5" />
                              ) : (
                                <ArrowUpRight className="text-blue-600 w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{transaction.description}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  transaction.type === "depot" ? "bg-green-100 text-green-800" :
                                  transaction.type === "retrait" ? "bg-red-100 text-red-800" : 
                                  "bg-blue-100 text-blue-800"
                                }>
                                  {transaction.type === "depot" ? "Dépôt" :
                                   transaction.type === "retrait" ? "Retrait" : "Virement"}
                                </Badge>
                                <span className="text-sm text-gray-500">#{transaction.reference}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-500">Date</p>
                              <p className="font-medium">{formatDate(transaction.date)}</p>
                            </div>
                            {transaction.type === "virement" ? (
                              <>
                                <div>
                                  <p className="text-gray-500">De</p>
                                  <p className="font-medium">{compteSource?.nom}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Vers</p>
                                  <p className="font-medium">{compteDestination?.nom}</p>
                                </div>
                              </>
                            ) : (
                              <div>
                                <p className="text-gray-500">Compte</p>
                                <p className="font-medium">{compte?.nom}</p>
                              </div>
                            )}
                            {transaction.beneficiaire && (
                              <div>
                                <p className="text-gray-500">Bénéficiaire</p>
                                <p className="font-medium">{transaction.beneficiaire}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <p className={`text-2xl font-bold mb-2 ${
                            transaction.type === "depot" ? "text-green-600" :
                            transaction.type === "retrait" ? "text-red-600" : "text-blue-600"
                          }`}>
                            {transaction.type === "retrait" ? "-" : "+"}{formatCurrency(transaction.montant)}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTransaction(transaction);
                                setShowTransactionForm(true);
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
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="rapports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Rapports financiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Module de rapports avancés à venir</p>
                <p className="text-sm text-gray-500 mt-2">
                  Évolutions des soldes, analyses des flux, prévisions de trésorerie
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showCompteForm} onOpenChange={setShowCompteForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompte ? "Modifier le compte" : "Nouveau compte"}
            </DialogTitle>
            <DialogDescription>
              {editingCompte 
                ? "Modifiez les informations du compte"
                : "Ajoutez un nouveau compte à votre trésorerie"
              }
            </DialogDescription>
          </DialogHeader>
          <CompteForm
            compte={editingCompte}
            onSuccess={() => {
              setShowCompteForm(false);
              setEditingCompte(null);
              toast({
                title: "Succès",
                description: "Compte enregistré avec succès",
              });
            }}
            onCancel={() => {
              setShowCompteForm(false);
              setEditingCompte(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Modifier la transaction" : "Nouvelle transaction"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction 
                ? "Modifiez les détails de la transaction"
                : "Enregistrez une nouvelle opération financière"
              }
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            comptes={mockComptes}
            onSuccess={() => {
              setShowTransactionForm(false);
              setEditingTransaction(null);
              toast({
                title: "Succès",
                description: "Transaction enregistrée avec succès",
              });
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