import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Key,
  Monitor,
  Moon,
  Sun
} from "lucide-react";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Parametres() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("fr");
  const [currency, setCurrency] = useState("XOF");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    farmName: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    },
  });

  // Get system stats
  const { data: systemStats } = useQuery({
    queryKey: ['/api/system/stats'],
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      return await apiRequest('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
        headers: { 'Content-Type': 'application/json' }  
      });
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe",
        variant: "destructive",
      });
    },
  });

  // System actions mutations
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/system/clear-cache', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Cache vidé",
        description: "Le cache a été vidé avec succès",
      });
    },
  });

  const optimizeDbMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/system/optimize-db', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Base de données optimisée",
        description: "L'optimisation de la base de données est terminée",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async (format: string) => {
      return await apiRequest('/api/system/export', {
        method: 'POST',
        body: JSON.stringify({ format }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lapgest-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées avec succès",
      });
    },
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSystemHealthBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Bon</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Attention</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleNavigation 
        currentModule="parametres" 
        moduleTitle="Paramètres & Configuration"
        moduleDescription="Gérez vos préférences, profil utilisateur et paramètres système"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="text-gray-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p className="text-gray-600">Configuration et personnalisation de votre environnement</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profil">Profil</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="securite">Sécurité</TabsTrigger>
            <TabsTrigger value="systeme">Système</TabsTrigger>
            <TabsTrigger value="sauvegarde">Sauvegarde</TabsTrigger>
          </TabsList>

          {/* Profil utilisateur */}
          <TabsContent value="profil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={(user as any)?.firstName || profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={(user as any)?.lastName || profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={(user as any)?.email || profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+225 XX XX XX XX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="farmName">Nom de l'élevage</Label>
                    <Input
                      id="farmName"
                      value={profileData.farmName}
                      onChange={(e) => setProfileData({...profileData, farmName: e.target.value})}
                      placeholder="Nom de votre élevage"
                    />
                  </div>
                </div>
                <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Apparence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span>Mode sombre</span>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Devise préférée</Label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="XOF">Franc CFA (XOF)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar US (USD)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Notifications push</span>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sauvegarde automatique</span>
                    <Switch
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="securite" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Entrez un nouveau mot de passe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {changePasswordMutation.isPending ? "Changement..." : "Changer le mot de passe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Système */}
          <TabsContent value="systeme" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="text-blue-600 w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Base de données</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(systemStats as any)?.dbSize || '0'} MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Monitor className="text-green-600 w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">État système</p>
                      {getSystemHealthBadge((systemStats as any)?.health || 'good')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="text-purple-600 w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Version</p>
                      <p className="text-2xl font-bold text-purple-600">2.0.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Actions système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => clearCacheMutation.mutate()}
                    disabled={clearCacheMutation.isPending}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {clearCacheMutation.isPending ? "Vidage..." : "Vider le cache"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => optimizeDbMutation.mutate()}
                    disabled={optimizeDbMutation.isPending}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {optimizeDbMutation.isPending ? "Optimisation..." : "Optimiser la BD"}
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger les logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sauvegarde */}
          <TabsContent value="sauvegarde" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exporter les données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Téléchargez une copie complète de vos données d'élevage.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => exportDataMutation.mutate('json')}
                      disabled={exportDataMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {exportDataMutation.isPending ? "Export en cours..." : "Exporter toutes les données (JSON)"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportDataMutation.mutate('csv')}
                      disabled={exportDataMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter pour Excel (CSV)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Importer des données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Restaurez vos données à partir d'une sauvegarde.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Réinitialiser toutes les données
                    </Button>
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