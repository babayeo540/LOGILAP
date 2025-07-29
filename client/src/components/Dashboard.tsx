import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
  FileText
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const birthChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Lapereaux nés',
      data: [120, 145, 132, 167, 189, 156],
      borderColor: 'hsl(142, 76%, 36%)',
      backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const weightChartData = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5', 'Semaine 6'],
    datasets: [
      {
        label: 'Lot A (45 lapins)',
        data: [0.15, 0.28, 0.45, 0.68, 0.95, 1.2],
        borderColor: 'hsl(217, 91%, 60%)',
        backgroundColor: 'hsla(217, 91%, 60%, 0.1)',
        tension: 0.4,
        borderWidth: 2
      },
      {
        label: 'Lot B (38 lapins)',
        data: [0.12, 0.25, 0.42, 0.65, 0.89, 1.15],
        borderColor: 'hsl(25, 46%, 46%)',
        backgroundColor: 'hsla(25, 46%, 46%, 0.1)',
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const weightChartOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Poids (kg)'
        }
      }
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue !</h2>
        <p className="text-gray-600">Voici un aperçu de votre ferme cunicole aujourd'hui</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lapins</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalLapins || 0}</p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +12 cette semaine
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Rabbit className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reproducteurs Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activeBreeders || 0}</p>
                <p className="text-sm text-blue-600 mt-1">
                  45 Femelles • 12 Mâles
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Naissances Prévues</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.expectedBirths || 0}</p>
                <p className="text-sm text-amber-600 mt-1">
                  <Calendar className="inline w-3 h-3 mr-1" />
                  7 jours
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Baby className="text-amber-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prêts à Vendre</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.readyToSell || 0}</p>
                <p className="text-sm text-green-600 mt-1">
                  <DollarSign className="inline w-3 h-3 mr-1" />
                  ~4,680€
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Évolution des Naissances</h3>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                <option>6 derniers mois</option>
                <option>Année courante</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={birthChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progression Pondérale</h3>
              <span className="text-sm text-gray-500">Moyenne par lot</span>
            </div>
            <div className="h-64">
              <Line data={weightChartData} options={weightChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Urgent Tasks */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tâches Urgentes</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">5</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Vaccination Rappel</p>
                  <p className="text-xs text-red-700">12 lapins - Enclos A3, A7</p>
                  <p className="text-xs text-red-600 mt-1">Échéance: Aujourd'hui</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Weight className="text-amber-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Contrôle Poids</p>
                  <p className="text-xs text-amber-700">Lot L2024-03 (45 lapins)</p>
                  <p className="text-xs text-amber-600 mt-1">Poids cible atteint</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="text-blue-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Mise Bas Prévue</p>
                  <p className="text-xs text-blue-700">Femelle F2024-089</p>
                  <p className="text-xs text-blue-600 mt-1">Demain, 15h-18h</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Voir toutes les tâches →
            </button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="text-green-600 w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Nouvelle portée enregistrée</p>
                  <p className="text-xs text-gray-500">Femelle F2024-067 • 8 lapereaux</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="text-blue-600 w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Vente effectuée</p>
                  <p className="text-xs text-gray-500">23 lapins de chair • 420€</p>
                  <p className="text-xs text-gray-400 mt-1">Hier, 14:30</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="text-red-600 w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Traitement administré</p>
                  <p className="text-xs text-gray-500">Mâle M2024-023 • Antibiotique</p>
                  <p className="text-xs text-gray-400 mt-1">Hier, 09:15</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé Financier</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-green-600 w-4 h-4" />
                  <span className="text-sm font-medium text-green-900">Revenus du mois</span>
                </div>
                <span className="text-lg font-bold text-green-900">
                  {metrics?.monthlyRevenue?.toLocaleString('fr-FR')}€
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="text-red-600 w-4 h-4" />
                  <span className="text-sm font-medium text-red-900">Dépenses du mois</span>
                </div>
                <span className="text-lg font-bold text-red-900">
                  {metrics?.monthlyExpenses?.toLocaleString('fr-FR')}€
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center space-x-3">
                  <DollarSign className="text-blue-600 w-4 h-4" />
                  <span className="text-sm font-bold text-blue-900">Bénéfice net</span>
                </div>
                <span className="text-xl font-bold text-blue-900">
                  {metrics?.netProfit?.toLocaleString('fr-FR')}€
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trésorerie disponible</span>
                  <span className="font-semibold text-gray-900">
                    {metrics?.availableCash?.toLocaleString('fr-FR')}€
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-colors group">
              <Plus className="w-8 h-8 text-primary-600 group-hover:text-primary-700 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">Nouveau Lapin</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group">
              <Heart className="w-8 h-8 text-blue-600 group-hover:text-blue-700 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Accouplement</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors group">
              <Stethoscope className="w-8 h-8 text-red-600 group-hover:text-red-700 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">Soins</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group">
              <ShoppingCart className="w-8 h-8 text-green-600 group-hover:text-green-700 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Vente</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors group">
              <Weight className="w-8 h-8 text-amber-600 group-hover:text-amber-700 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Pesée</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group">
              <FileText className="w-8 h-8 text-purple-600 group-hover:text-purple-700 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Rapport</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
