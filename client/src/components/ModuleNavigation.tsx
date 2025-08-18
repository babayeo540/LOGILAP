import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  ChevronLeft, 
  Rabbit, 
  Building2, 
  Heart, 
  ShoppingCart, 
  Stethoscope, 
  Package, 
  Users, 
  Receipt, 
  Banknote, 
  BarChart3,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface ModuleNavigationProps {
  currentModule: string;
  moduleTitle: string;
  moduleDescription?: string;
}

/**
 * Composant de navigation pour les modules de l'application.
 * Fournit une barre de navigation avec un fil d'Ariane, un titre,
 * des liens de navigation rapide et une gestion de la navigation pour mobile.
 *
 * @param {string} currentModule - L'identifiant du module actif (ex: 'lapins').
 * @param {string} moduleTitle - Le titre à afficher pour le module.
 * @param {string} [moduleDescription] - Une brève description optionnelle du module.
 */
export default function ModuleNavigation({ 
  currentModule, 
  moduleTitle, 
  moduleDescription 
}: ModuleNavigationProps) {
  // Utilisation de useLocation pour une navigation SPA correcte
  const [, setLocation] = useLocation();

  const modules = [
    { id: "home", name: "Accueil", icon: Home, path: "/", color: "text-gray-600" },
    { id: "lapins", name: "Lapins", icon: Rabbit, path: "/lapins", color: "text-amber-600" },
    { id: "enclos", name: "Enclos", icon: Building2, path: "/enclos", color: "text-gray-600" },
    { id: "reproduction", name: "Reproduction", icon: Heart, path: "/reproduction", color: "text-pink-600" },
    { id: "finances", name: "Ventes & Achats", icon: ShoppingCart, path: "/finances", color: "text-blue-600" },
    { id: "sante", name: "Santé", icon: Stethoscope, path: "/sante", color: "text-red-600" },
    { id: "stocks", name: "Stocks", icon: Package, path: "/stocks", color: "text-yellow-600" },
    { id: "personnel", name: "Personnel", icon: Users, path: "/personnel", color: "text-purple-600" },
    { id: "depenses", name: "Dépenses", icon: Receipt, path: "/depenses", color: "text-orange-600" },
    { id: "tresorerie", name: "Trésorerie", icon: Banknote, path: "/tresorerie", color: "text-green-600" },
    { id: "rapports", name: "Rapports", icon: BarChart3, path: "/rapports", color: "text-indigo-600" },
    { id: "parametres", name: "Paramètres", icon: Settings, path: "/parametres", color: "text-gray-600" }
  ];

  const currentModuleData = modules.find(m => m.id === currentModule);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb et titre du module */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700 flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{moduleTitle}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {currentModuleData && (
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
                  <currentModuleData.icon className={`w-5 h-5 ${currentModuleData.color}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{moduleTitle}</h1>
                  {moduleDescription && (
                    <p className="text-gray-600 text-sm">{moduleDescription}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation rapide et mobile */}
        <div className="flex items-center gap-2">
          {/* Bouton retour */}
          <Link href="/">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
          </Link>

          {/* Navigation entre modules (version large) */}
          <div className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-gray-200">
            {modules.slice(1).map((module) => (
              <Link key={module.id} href={module.path}>
                <Button
                  variant={currentModule === module.id ? "default" : "ghost"}
                  size="sm"
                  className="text-xs px-2 py-1.5 h-auto"
                >
                  <module.icon className="w-3 h-3 mr-1" />
                  <span className="hidden xl:inline">{module.name}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Menu de sélection pour la navigation mobile */}
          <div className="lg:hidden">
            <select
              value={currentModule}
              onChange={(e) => {
                // Utilisation de setLocation de wouter pour une navigation SPA sans rechargement
                const selectedPath = modules.find(m => m.id === e.target.value)?.path;
                if (selectedPath) {
                  setLocation(selectedPath);
                }
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
              aria-label="Sélectionner un module"
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}