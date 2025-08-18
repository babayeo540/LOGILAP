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
  Scale,
  TrendingUp,
  FileText,
} from "lucide-react";
import ArticleForm from "../components/ArticleForm";
import MouvementStockForm from "../components/MouvementStockForm";
import ModuleNavigation from "@/components/ModuleNavigation";

interface Article {
  id: string;
  nom: string;
  categorie: "aliment" | "medicament" | "materiel";
  quantite: number;
  unite: string;
  alertSeuil: number;
}

interface MouvementStock {
  id: string;
  articleId: string;
  date: string;
  type: "entree" | "sortie";
  quantite: number;
  description: string;
}

export default function Stocks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("all");
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showMouvementForm, setShowMouvementForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [selectedArticleForMouvement, setSelectedArticleForMouvement] =
    useState<Article | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Requêtes pour les données
  const { data: articles = [], isLoading: isArticlesLoading } = useQuery<
    Article[]
  >({
    queryKey: ["/api/stocks/articles"],
    queryFn: async () => apiRequest("/api/stocks/articles"),
  });

  const { data: mouvements = [], isLoading: isMouvementsLoading } = useQuery<
    MouvementStock[]
  >({
    queryKey: ["/api/stocks/mouvements"],
    queryFn: async () => apiRequest("/api/stocks/mouvements"),
  });

  // Mutations pour les articles
  const articleMutation = useMutation({
    mutationFn: (articleData: Partial<Article>) => {
      if (articleData.id) {
        return apiRequest(`/api/stocks/articles/${articleData.id}`, {
          method: "PUT",
          body: JSON.stringify(articleData),
        });
      } else {
        return apiRequest("/api/stocks/articles", {
          method: "POST",
          body: JSON.stringify(articleData),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/stocks/articles"],
      });
      setShowArticleForm(false);
      setEditingArticle(null);
      toast({
        title: "Succès",
        description: "Article enregistré avec succès.",
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

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: string) =>
      apiRequest(`/api/stocks/articles/${articleId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/stocks/articles"],
      });
      toast({
        title: "Succès",
        description: "Article supprimé avec succès.",
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

  // Mutation pour les mouvements de stock
  const mouvementMutation = useMutation({
    mutationFn: (mouvementData: Partial<MouvementStock>) => {
      return apiRequest("/api/stocks/mouvements", {
        method: "POST",
        body: JSON.stringify(mouvementData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/stocks/articles"],
      }); // Invalider aussi les articles pour mettre à jour la quantité
      queryClient.invalidateQueries({
        queryKey: ["/api/stocks/mouvements"],
      });
      setShowMouvementForm(false);
      setSelectedArticleForMouvement(null);
      toast({
        title: "Succès",
        description: "Mouvement de stock enregistré avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'enregistrement du mouvement : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = article.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categorieFilter === "all" || article.categorie === categorieFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, categorieFilter]);

  if (isArticlesLoading || isMouvementsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <ModuleNavigation
            title="Gestion des Stocks"
            description="Gérez vos articles, inventaire et mouvements de stock"
            icon={<Package className="w-6 h-6 text-primary-600" />}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => setShowArticleForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvel Article
            </Button>
            <Button
              onClick={() => setShowMouvementForm(true)}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Mouvement
            </Button>
          </div>
        </div>

        <Tabs defaultValue="articles" className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="mouvements">Mouvements</TabsTrigger>
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

          <TabsContent value="articles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucun article trouvé.
                </p>
              ) : (
                filteredArticles.map((article) => {
                  const isLowStock =
                    article.quantite <= article.alertSeuil;
                  const iconMap = {
                    aliment: <Wheat className="w-5 h-5 text-yellow-500" />,
                    medicament: <Pill className="w-5 h-5 text-blue-500" />,
                    materiel: <Wrench className="w-5 h-5 text-gray-500" />,
                  };
                  return (
                    <Card key={article.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {iconMap[article.categorie]}
                            {article.nom}
                          </CardTitle>
                          <Badge variant="secondary">{article.categorie}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <Scale className="w-4 h-4" />
                          <span>
                            Quantité en stock:{" "}
                            <span className="font-medium">
                              {article.quantite} {article.unite}
                            </span>
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>
                            Seuil d'alerte:{" "}
                            <span className="font-medium">
                              {article.alertSeuil} {article.unite}
                            </span>
                          </span>
                        </p>
                        {isLowStock && (
                          <div className="flex items-center gap-2 text-red-500 mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Stock faible !
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingArticle(article);
                              setShowArticleForm(true);
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
                                  `Êtes-vous sûr de vouloir supprimer l'article ${article.nom} ?`
                                )
                              ) {
                                deleteArticleMutation.mutate(article.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedArticleForMouvement(article);
                              setShowMouvementForm(true);
                            }}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="mouvements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mouvements.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucun mouvement de stock enregistré.
                </p>
              ) : (
                mouvements.map((mouvement) => {
                  const article = articles.find(
                    (a) => a.id === mouvement.articleId
                  );
                  return (
                    <Card key={mouvement.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {mouvement.type === "entree" ? (
                              <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                            Mouvement de stock
                          </CardTitle>
                          <Badge variant="secondary">{mouvement.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Article :{" "}
                          <span className="font-medium">
                            {article?.nom || "N/A"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Date :{" "}
                          <span className="font-medium">
                            {new Date(mouvement.date).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantité :{" "}
                          <span className="font-medium">
                            {mouvement.quantite} {article?.unite || ""}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Description :{" "}
                          <span className="font-medium">
                            {mouvement.description}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog pour Article Form */}
      <Dialog open={showArticleForm} onOpenChange={setShowArticleForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? "Modifier l'article" : "Nouvel article"}
            </DialogTitle>
            <DialogDescription>
              {editingArticle
                ? "Modifiez les informations de l'article"
                : "Enregistrez un nouvel article dans le stock"}
            </DialogDescription>
          </DialogHeader>
          <ArticleForm
            article={editingArticle}
            onSuccess={() => {
              articleMutation.onSuccess();
            }}
            onCancel={() => {
              setShowArticleForm(false);
              setEditingArticle(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pour Mouvement Stock Form */}
      <Dialog open={showMouvementForm} onOpenChange={setShowMouvementForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mouvement de stock</DialogTitle>
            <DialogDescription>
              Enregistrez une entrée ou une sortie de stock
            </DialogDescription>
          </DialogHeader>
          <MouvementStockForm
            articleSelectionne={selectedArticleForMouvement}
            onSuccess={(data) => {
              mouvementMutation.mutate(data);
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