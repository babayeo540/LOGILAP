import { useState } from "react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DemoDashboard from "@/components/DemoDashboard";
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
  ChevronRight
} from "lucide-react";

export default function Demo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rabbitMenuOpen, setRabbitMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Mock user data for demo
  const mockUser = {
    firstName: "Jean",
    lastName: "Dubois",
    email: "jean.dubois@ferme.com",
    profileImageUrl: ""
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Rabbit className="text-primary-600 w-5 h-5" />
              </div>
              <div className="text-white">
                <h1 className="text-lg font-bold">LAPGEST-PRO</h1>
                <p className="text-xs opacity-90">v2.0 - Mode Démo</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Dashboard */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg">
              <BarChart3 className="w-5 h-5 mr-3" />
              Tableau de Bord
            </a>
            
            {/* Rabbit Management */}
            <div className="space-y-1">
              <div 
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => setRabbitMenuOpen(!rabbitMenuOpen)}
              >
                <Rabbit className="w-5 h-5 mr-3 text-earth-500" />
                Gestion des Lapins
                {rabbitMenuOpen ? (
                  <ChevronDown className="ml-auto w-4 h-4" />
                ) : (
                  <ChevronRight className="ml-auto w-4 h-4" />
                )}
              </div>
              {rabbitMenuOpen && (
                <div className="ml-8 space-y-1">
                  <a href="#" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded">Fiches Individuelles</a>
                  <a href="#" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded">Enclos & Cages</a>
                  <a href="#" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded">Reproduction</a>
                  <a href="#" className="block px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded">Sevrage</a>
                </div>
              )}
            </div>

            {/* Health Management */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <Stethoscope className="w-5 h-5 mr-3 text-red-500" />
              Santé & Soins
            </a>

            {/* Stock Management */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <Package className="w-5 h-5 mr-3 text-amber-500" />
              Gestion des Stocks
            </a>

            {/* Sales & Purchases */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 mr-3 text-blue-500" />
              Ventes & Achats
            </a>

            {/* Personnel */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 mr-3 text-purple-500" />
              Personnel
            </a>

            {/* Expenses */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <Receipt className="w-5 h-5 mr-3 text-orange-500" />
              Dépenses
            </a>

            {/* Banking */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <Banknote className="w-5 h-5 mr-3 text-green-500" />
              Trésorerie
            </a>

            {/* Reports */}
            <a href="#" className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5 mr-3 text-indigo-500" />
              Rapports
            </a>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {mockUser.firstName[0]}{mockUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {mockUser.firstName} {mockUser.lastName}
                </p>
                <p className="text-xs text-gray-500">Gestionnaire Ferme (Démo)</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5"
                onClick={() => window.location.href = '/'}
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Rabbit className="text-primary-600 w-5 h-5" />
                    </div>
                    <div className="text-white">
                      <h1 className="text-lg font-bold">LAPGEST-PRO</h1>
                      <p className="text-xs opacity-90">v2.0 - Démo</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="text-white"
                  >
                    ×
                  </Button>
                </div>
              </SidebarHeader>
              {/* Same content as desktop sidebar */}
            </Sidebar>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Breadcrumbs */}
            <nav className="hidden lg:flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Accueil</span>
              <span className="text-gray-300">/</span>
              <span className="text-primary-600 font-medium">Tableau de Bord</span>
              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">MODE DÉMO</span>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Weather Widget */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <Sun className="text-yellow-500 w-4 h-4" />
                <span className="text-sm font-medium text-blue-900">22°C</span>
              </div>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <DemoDashboard />
      </div>
    </div>
  );
}