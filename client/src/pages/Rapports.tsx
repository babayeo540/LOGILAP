import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Rabbit,
  Heart,
  Baby,
  Scale,
  DollarSign,
  Users,
} from "lucide-react";
import ModuleNavigation from "@/components/ModuleNavigation";
import { apiRequest } from "@/lib/queryClient";

interface Lapin {
  id: string;
  identifiant: string;
  sexe: "male" | "femelle";
  statut:
    | "reproduction"
    | "engraissement"
    | "malade"
    | "gestation"
    | "laiton";
}

interface Vente {
  id: string;
  montant: number;
  date: string;
}

interface Depense {
  id: string;
  montant: number;
  date: string;
}

export default function Rapports() {
  const [periodeFilter, setPeriodeFilter] = useState("mois");

  // Récupération des données via l'API
  const {
    data: lapins = [],
    isLoading: isLapinsLoading,
    isError: isLapinsError,
  } = useQuery<Lapin[]>({
    queryKey: ["/api/lapins"],
    queryFn: async () => apiRequest("/api/lapins"),
  });

  const {
    data: ventes = [],
    isLoading: isVentesLoading,
    isError: isVentesError,
  } = useQuery<Vente[]>({
    queryKey: ["/api/ventes"],
    queryFn: async () => apiRequest("/api/ventes"),
  });

  const {
    data: depenses = [],
    isLoading: isDepensesLoading,
    isError: isDepensesError,
  } = useQuery<Depense[]>({
    queryKey: ["/api/depenses"],
    queryFn: async () => apiRequest("/api/depenses"),
  });

  // Calcul des statistiques
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    const filteredVentes = ventes.filter((vente) => {
      const date = new Date(vente.date);
      if (periodeFilter === "mois") {
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      }
      return date.getFullYear() === currentYear;
    });

    const filteredDepenses = depenses.filter((depense) => {
      const date = new Date(depense.date);
      if (periodeFilter === "mois") {
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      }
      return date.getFullYear() === currentYear;
    });

    const totalVentes = filteredVentes.reduce(
      (sum, item) => sum + item.montant,
      0
    );
    const totalDepenses = filteredDepenses.reduce(
      (sum, item) => sum + item.montant,
      0
    );
    const benefice = totalVentes - totalDepenses;

    const lapinsReproduction = lapins.filter(
      (l) => l.statut === "reproduction"
    ).length;
    const lapinsEngraissement = lapins.filter(
      (l) => l.statut === "engraissement"
    ).length;
    const lapinsGestation = lapins.filter(
      (l) => l.statut === "gestation"
    ).length;

    // TODO: Logique pour les performeurs si les données API le permettent
    const topPerformers = [{ nom: "N/A", id: "0", portees: 0 }];

    return {
      financier: {
        chiffreAffaires: totalVentes,
        depenses: totalDepenses,
        benefice: benefice,
        bilan: benefice >= 0 ? "positif" : "négatif",
      },
      production: {
        totalLapins: lapins.length,
        lapinsReproduction: lapinsReproduction,
        lapinsEngraissement: lapinsEngraissement,
        lapinsGestation: lapinsGestation,
      },
      performeurs: {
        reproducteur: {
          performeurs: topPerformers,
        },
      },
    };
  }, [lapins, ventes, depenses, periodeFilter]);

  if (isLapinsLoading || isVentesLoading || isDepensesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (isLapinsError || isVentesError || isDepensesError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">
          Erreur de chargement des données. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ModuleNavigation
          title="Rapports & Statistiques"
          description="Analysez les performances de votre élevage"
          icon={<BarChart3 className="w-6 h-6 text-primary-600" />}
        />

        <Tabs defaultValue="financier" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="financier">
              <DollarSign className="w-4 h-4 mr-2" /> Financier
            </TabsTrigger>
            <TabsTrigger value="production">
              <Rabbit className="w-4 h-4 mr-2" /> Production
            </TabsTrigger>
            <TabsTrigger value="performeurs">
              <TrendingUp className="w-4 h-4 mr-2" /> Performeurs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="financier" className="mt-4">
            <div className="flex justify-end mb-4 gap-2">
              <Button
                variant={periodeFilter === "mois" ? "default" : "outline"}
                onClick={() => setPeriodeFilter("mois")}
              >
                Mois
              </Button>
              <Button
                variant={periodeFilter === "annee" ? "default" : "outline"}
                onClick={() => setPeriodeFilter("annee")}
              >
                Année
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chiffre d'Affaires</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-primary-600">
                  {stats.financier.chiffreAffaires.toFixed(2)} FCFA
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Dépenses Totales</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-red-600">
                  {stats.financier.depenses.toFixed(2)} FCFA
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Bénéfice Net</CardTitle>
                </CardHeader>
                <CardContent
                  className={`text-3xl font-bold ${
                    stats.financier.benefice >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.financier.benefice.toFixed(2)} FCFA
                </CardContent>
              </Card>
            </div>
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Évolution du Bilan
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-400">
                  <p>Graphique à venir</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Lapins</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold flex items-center gap-2">
                  <Rabbit className="w-8 h-8" />
                  {stats.production.totalLapins}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>En Reproduction</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold flex items-center gap-2">
                  <Heart className="w-8 h-8" />
                  {stats.production.lapinsReproduction}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>En Engraissement</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold flex items-center gap-2">
                  <Scale className="w-8 h-8" />
                  {stats.production.lapinsEngraissement}
                </CardContent>
              </Card>
            </div>
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Répartition par Statut
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-gray-400">
                  <p>Graphique à venir</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performeurs" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Meilleurs Reproducteurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.performeurs.reproducteur.performeurs.map(
                      (animal, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{animal.nom}</span>
                              <Badge variant="outline" className="text-xs">
                                #{animal.id}
                              </Badge>
                            </div>
                            {animal.portees !== undefined && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {animal.portees} portées
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}