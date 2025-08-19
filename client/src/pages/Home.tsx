import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Dashboard from "@/components/Dashboard";
import {
  Rabbit,
  Heart,
  Stethoscope,
  Package,
  ShoppingCart,
  Users,
  Receipt,
  Banknote,
  BarChart3,
  Bell,
  Sun,
  Moon,
  Menu,
  Settings,
  ChevronDown,
  ChevronRight,
  Euro,
  Scale,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Définition de types pour une meilleure sécurité
interface DashboardStats {
  totalLapins: number;
  totalVentes: number;
  totalDepenses: number;
  tauxMortalite: number;
  nombreNotifications: number;
}

// Initialisation de React Query Client
const queryClient = new QueryClient();

// Composant principal pour le tableau de bord
function HomeContent() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rabbitMenuOpen, setRabbitMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Récupération des statistiques du tableau de bord
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        
        // Vérifier si la réponse est un succès HTTP
        if (!response.ok) {
          throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
        }

        // Vérifier le Content-Type pour s'assurer qu'il s'agit de JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Réponse du serveur non-JSON:", textResponse);
          throw new Error("Le serveur n'a pas renvoyé de JSON. Problème d'API côté serveur.");
        }

        return await response.json();
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        setErrorMessage(err.message);
        throw err;
      }
    },
  });

  if (isLoadingStats) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Si la requête a échoué
  if (isErrorStats || !stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-red-600 text-center">
        <p>
          Erreur lors du chargement des données. Veuillez vérifier la connexion ou l'API.
        </p>
        {errorMessage && (
          <p className="mt-4 p-2 bg-red-100 dark:bg-red-950 rounded-lg text-sm text-red-800 dark:text-red-300">
            Détails : {errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
                <Rabbit className="text-primary-600 w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  LAPGEST-PRO
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v2.0
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`} />
                <AvatarFallback>{user?.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>
            </div>

            {/* Navigation Menus */}
            <nav className="mt-6 space-y-1">
              {/* Main menu */}
              <Link href="/">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-primary-600 bg-primary-50 dark:bg-primary-900 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                  <span>Tableau de bord</span>
                </a>
              </Link>
              <Link href="/lapins">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors">
                  <Rabbit className="w-5 h-5" />
                  <span>Cheptel de lapins</span>
                </a>
              </Link>
              <Link href="/enclos">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors">
                  <Package className="w-5 h-5" />
                  <span>Enclos & Logements</span>
                </a>
              </Link>
              <Link href="/sante">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors">
                  <Stethoscope className="w-5 h-5" />
                  <span>Santé & Reproduction</span>
                </a>
              </Link>
              <Link href="/finances">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors">
                  <Banknote className="w-5 h-5" />
                  <span>Finances</span>
                </a>
              </Link>
              <Link href="/personnel">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors">
                  <Users className="w-5 h-5" />
                  <span>Personnel</span>
                </a>
              </Link>
              <Link href="/parametres">
                <a className="flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Paramètres</span>
                </a>
              </Link>
            </nav>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/parametres">
                <a className="flex items-center justify-between text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              LAPGEST-PRO
            </h1>
            <Rabbit className="w-6 h-6 text-primary-600" />
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="w-6 h-6" />
            {stats && stats.nombreNotifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.nombreNotifications}
              </span>
            )}
          </Button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="hidden lg:flex items-center space-x-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Accueil</span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-primary-600 font-medium">
                Tableau de Bord
              </span>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {stats && stats.nombreNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.nombreNotifications}
                  </span>
                )}
              </Button>
              {/* Dark Mode Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Nombre de lapins
                </CardTitle>
                <Rabbit className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalLapins}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ventes
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalVentes.toFixed(2)} XOF
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Dépenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalDepenses.toFixed(2)} XOF
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Taux de Mortalité
                </CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.tauxMortalite.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Main Dashboard Content - Remplacer avec un composant Dashboard réel */}
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

// Wrapper pour inclure le QueryClientProvider
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
