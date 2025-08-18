import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Rabbit,
  Heart,
  Baby,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
  Weight,
  Plus,
  Stethoscope,
  FileText,
  Euro,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { apiRequest } from "@/lib/queryClient";

// Enregistrer les composants de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Définition des types pour les données de l'API
interface DashboardMetrics {
  totalLapins: number;
  activeBreeders: number;
  expectedBirths: number;
  readyToSell: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  availableCash: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "rgba(229, 231, 235, 1)",
      },
    },
  },
};

// Fonction de formatage pour les devises
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amount);
};

export default function Dashboard() {
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    isError: isErrorMetrics,
  } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: () => apiRequest("/api/dashboard/metrics"),
  });

  const {
    data: chartData,
    isLoading: isLoadingChart,
    isError: isErrorChart,
  } = useQuery<ChartData>({
    queryKey: ["/api/dashboard/chart-data"],
    queryFn: () => apiRequest("/api/dashboard/chart-data"),
  });

  if (isLoadingMetrics || isLoadingChart) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isErrorMetrics || isErrorChart) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p>Erreur lors du chargement des données. Veuillez réessayer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Tableau de Bord
        </h2>
        {/* Métriques clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Lapins au total
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {metrics?.totalLapins}
                </div>
              </div>
              <Rabbit className="w-8 h-8 text-primary-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Reproducteurs actifs
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {metrics?.activeBreeders}
                </div>
              </div>
              <Heart className="w-8 h-8 text-pink-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Mises-bas attendues
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {metrics?.expectedBirths}
                </div>
              </div>
              <Baby className="w-8 h-8 text-blue-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Prêts à la vente
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {metrics?.readyToSell}
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Recettes du mois
                </CardTitle>
                <div className="text-2xl font-bold mt-1 text-green-600">
                  {formatCurrency(metrics?.monthlyRevenue || 0)}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Dépenses du mois
                </CardTitle>
                <div className="text-2xl font-bold mt-1 text-red-600">
                  {formatCurrency(metrics?.monthlyExpenses || 0)}
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Bénéfice net
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(metrics?.netProfit || 0)}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500 opacity-80" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Liquidités disponibles
                </CardTitle>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(metrics?.availableCash || 0)}
                </div>
              </div>
              <Euro className="w-8 h-8 text-primary-500 opacity-80" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graphique de revenus/dépenses */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenus et Dépenses (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData ? (
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Aucune donnée de graphique disponible.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Actions Rapides
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group">
            <Plus className="w-8 h-8 text-blue-600 group-hover:text-blue-700 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
              Nouveau Lapin
            </span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-pink-50 hover:border-pink-300 transition-colors group">
            <Heart className="w-8 h-8 text-pink-600 group-hover:text-pink-700 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700">
              Accouplement
            </span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors group">
            <Stethoscope className="w-8 h-8 text-red-600 group-hover:text-red-700 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">
              Soin
            </span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group">
            <ShoppingCart className="w-8 h-8 text-green-600 group-hover:text-green-700 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
              Vente
            </span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors group">
            <Weight className="w-8 h-8 text-amber-600 group-hover:text-amber-700 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">
              Pesée
            </span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group">
            <FileText className="w-8 h-8 text-purple-600 group-hover:text-purple-700 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
              Rapport
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}