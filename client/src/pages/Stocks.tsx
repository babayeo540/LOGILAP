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
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ShoppingCart,
  Wheat,
  Pill,
  Wrench,
  Edit,
  Trash2,
  Calendar,
  Scale
} from "lucide-react";
import ArticleForm from "../components/ArticleForm";
import MouvementStockForm from "../components/MouvementStockForm";

export default function Stocks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("all");
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showMouvementForm, setShowMouvementForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [selectedArticleForMouvement, setSelectedArticleForMouvement] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data pour les articles en stock
  const mockArticles = [
    {
      id: "1",
      nom: "Granulés lapins croissance",
      categorie: "alimentation",
      description: "Aliment complet pour lapins en croissance",
      stockActuel: 45,
      stockMinimum: 20,
      stockMaximum: 100,
      unite: "kg",
      prixUnitaire: 1.85,
      fournisseur: "Aliments Durand",
      datePeremption: "2024-12-15",
      emplacementStock: "Hangar A - Section 1"
    },
    {
      id: "2",
      nom: "Paille de blé",
      categorie: "litiere",
      description: "Paille pour litière cages maternité",
      stockActuel: 8,
      stockMinimum: 15,
      stockMaximum: 50,
      unite: "bottes",
      prixUnitaire: 3.50,
      fournisseur: "Ferme Martin",
      emplacementStock: "Hangar B"
    },
    {
      id: "3",
      nom: "Antibiotique large spectre",
      categorie: "medicament",
      description: "Traitement infections respiratoires",
      stockActuel: 2,
      stockMinimum: 5,
      stockMaximum: 15,
      unite: "flacons",
      prixUnitaire: 12.80,
      fournisseur: "Vétérinaire Dubois",
      datePeremption: "2025-06-30",
      emplacementStock: "Armoire médicaments"
    },
    {
      id: "4",
      nom: "Abreuvoirs automatiques",
      categorie: "equipement",
      description: "Abreuvoirs à tétine pour cages",
      stockActuel: 12,
      stockMinimum: 5,
      stockMaximum: 30,
      unite: "pièces",
      prixUnitaire: 8.90,
      fournisseur: "Matériel Elevage Pro",
      emplacementStock: "Atelier"
    }
  ];

  const mockMouvements = [
    {
      id: "1",
      articleId: "1",
      type: "entree",
      quantite: 25,
      date: "2024-07-20",
      motif: "Livraison fournisseur",
      cout: 46.25,
      responsable: "Jean Dupont"
    },
    {
      id: "2",
      articleId: "1",
      type: "sortie",
      quantite: -5,
      date: "2024-07-25",
      motif: "Consommation quotidienne",
      responsable: "Marie Lambert"
    }
  ];

  const getCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case "alimentation": return <Wheat className="w-4 h-4" />;
      case "medicament": return <Pill className="w-4 h-4" />;
      case "equipement": return <Wrench className="w-4 h-4" />;
      case "litiere": return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getCategorieLabel = (categorie: string) => {
    switch (categorie) {
      case "alimentation": return "Alimentation";
      case "medicament": return "Médicaments";
      case "equipement": return "Équipements";
      case "litiere": return "Litière";
      default: return categorie;
    }
  };

  const getStockStatus = (article: any) => {
    const pourcentage = (article.stockActuel / article.stockMaximum) * 100;
    if (article.stockActuel <= article.stockMinimum) return "critique";
    if (pourcentage <= 30) return "faible";
    if (pourcentage >= 80) return "plein";
    return "normal";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critique":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Critique</Badge>;
      case "faible":
        return <Badge className="bg-orange-100 text-orange-800"><TrendingDown className="w-3 h-3 mr-1" />Faible</Badge>;
      case "normal":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Normal</Badge>;
      case "plein":
        return <Badge className="bg-blue-100 text-blue-800"><Package className="w-3 h-3 mr-1" />Plein</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
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

  const filteredArticles = mockArticles.filter((article: any) => {
    const matchesSearch = article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === "all" || article.categorie === categorieFilter;
    return matchesSearch && matchesCategorie;
  });

  // Calculs des statistiques
  const articlesTotal = mockArticles.length;
  const articlesCritiques = mockArticles.filter(a => getStockStatus(a) === "critique").length;
  const articlesFaibles = mockArticles.filter(a => getStockStatus(a) === "faible").length;
  const valeurTotaleStock = mockArticles.reduce((sum, a) => sum + (a.stockActuel * a.prixUnitaire), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p className="text-gray-600">Gérez votre inventaire, approvisionnements et consommations</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowArticleForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </Button>
          <Button 
            onClick={() => setShowMouvementForm(true)}
            variant="outline"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Mouvement Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Articles total</p>
                <p className="text-2xl font-bold text-gray-900">{articlesTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock critique</p>
                <p className="text-2xl font-bold text-red-600">{articlesCritiques}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-orange-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">{articlesFaibles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Scale className="text-green-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valeur totale</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(valeurTotaleStock)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="mouvements">Mouvements</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
          <TabsTrigger value="inventaire">Inventaire</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un article..."
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
                    <option value="alimentation">Alimentation</option>
                    <option value="medicament">Médicaments</option>
                    <option value="equipement">Équipements</option>
                    <option value="litiere">Litière</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                <p className="text-gray-600">
                  {searchTerm || categorieFilter !== "all" 
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par ajouter votre premier article"
                  }
                </p>
              </div>
            ) : (
              filteredArticles.map((article: any) => {
                const status = getStockStatus(article);
                const pourcentageStock = (article.stockActuel / article.stockMaximum) * 100;
                
                return (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategorieIcon(article.categorie)}
                          <CardTitle className="text-lg">{article.nom}</CardTitle>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                      <p className="text-sm text-gray-600">{article.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Stock actuel */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stock actuel:</span>
                          <span className="font-bold text-lg">
                            {article.stockActuel} {article.unite}
                          </span>
                        </div>

                        {/* Barre de progression du stock */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Min: {article.stockMinimum}</span>
                            <span>Max: {article.stockMaximum}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                status === "critique" ? 'bg-red-500' :
                                status === "faible" ? 'bg-orange-500' :
                                status === "plein" ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(pourcentageStock, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Prix unitaire</p>
                            <p className="font-medium">{formatCurrency(article.prixUnitaire)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Valeur stock</p>
                            <p className="font-medium">{formatCurrency(article.stockActuel * article.prixUnitaire)}</p>
                          </div>
                        </div>

                        {article.datePeremption && (
                          <div className="p-2 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-800">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Péremption: {formatDate(article.datePeremption)}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedArticleForMouvement(article);
                              setShowMouvementForm(true);
                            }}
                            className="flex-1"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Mouvement
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingArticle(article);
                              setShowArticleForm(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
                                toast({
                                  title: "Article supprimé",
                                  description: "L'article a été supprimé avec succès",
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="mouvements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMouvements.map((mouvement) => {
                  const article = mockArticles.find(a => a.id === mouvement.articleId);
                  return (
                    <div key={mouvement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          mouvement.type === "entree" ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {mouvement.type === "entree" ? 
                            <Plus className="text-green-600 w-5 h-5" /> :
                            <TrendingDown className="text-red-600 w-5 h-5" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{article?.nom}</p>
                          <p className="text-sm text-gray-600">{mouvement.motif}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          mouvement.type === "entree" ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mouvement.type === "entree" ? '+' : ''}{mouvement.quantite} {article?.unite}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(mouvement.date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockArticles
                  .filter(a => getStockStatus(a) === "critique" || getStockStatus(a) === "faible")
                  .map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className={`w-6 h-6 ${
                          getStockStatus(article) === "critique" ? 'text-red-600' : 'text-orange-600'
                        }`} />
                        <div>
                          <p className="font-medium">{article.nom}</p>
                          <p className="text-sm text-gray-600">
                            Stock actuel: {article.stockActuel} {article.unite} 
                            (minimum: {article.stockMinimum} {article.unite})
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedArticleForMouvement(article);
                          setShowMouvementForm(true);
                        }}
                      >
                        Réapprovisionner
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventaire" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>État de l'inventaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Module d'inventaire à venir</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article Form Dialog */}
      <Dialog open={showArticleForm} onOpenChange={setShowArticleForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? "Modifier l'article" : "Nouvel article"}
            </DialogTitle>
            <DialogDescription>
              {editingArticle 
                ? "Modifiez les informations de l'article"
                : "Ajoutez un nouvel article à votre stock"
              }
            </DialogDescription>
          </DialogHeader>
          <ArticleForm
            article={editingArticle}
            onSuccess={() => {
              setShowArticleForm(false);
              setEditingArticle(null);
              toast({
                title: "Succès",
                description: "Article enregistré avec succès",
              });
            }}
            onCancel={() => {
              setShowArticleForm(false);
              setEditingArticle(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Mouvement Stock Form Dialog */}
      <Dialog open={showMouvementForm} onOpenChange={setShowMouvementForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mouvement de stock</DialogTitle>
            <DialogDescription>
              Enregistrez une entrée ou sortie de stock
            </DialogDescription>
          </DialogHeader>
          <MouvementStockForm
            articleSelectionne={selectedArticleForMouvement}
            onSuccess={() => {
              setShowMouvementForm(false);
              setSelectedArticleForMouvement(null);
              toast({
                title: "Succès",
                description: "Mouvement enregistré avec succès",
              });
            }}
            onCancel={() => {
              setShowMouvementForm(false);
              setSelectedArticleForMouvement(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}