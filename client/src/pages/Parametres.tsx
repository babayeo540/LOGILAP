import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User,
  Shield,
  Database,
  Palette,
  Key,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Save,
} from "lucide-react";
import ModuleNavigation from "@/components/ModuleNavigation";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  farmName: string;
}

export default function Parametres() {
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    farmName: "",
  });
  const [password, setPassword] = useState({ old: "", new: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userData, isLoading: isUserLoading } = useQuery<UserProfile>({
    queryKey: ["/api/parametres/profil"],
    queryFn: async () => apiRequest("/api/parametres/profil"),
  });

  useEffect(() => {
    if (userData) {
      setProfileData(userData);
    }
  }, [userData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      apiRequest("/api/parametres/profil", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parametres/profil"] });
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour du profil : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { old: string; new: string }) =>
      apiRequest("/api/parametres/password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setPassword({ old: "", new: "" });
      toast({
        title: "Succès",
        description: "Mot de passe mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour du mot de passe : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async (type: "csv" | "json") => {
      const response = await apiRequest(`/api/parametres/export?type=${type}`, {
        method: "GET",
      });
      // Logic to handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `donnees_lapgest_pro.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Données exportées avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'exportation : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const importDataMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiRequest("/api/parametres/import", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/"] }); // Invalider toutes les données pour un rafraîchissement complet
      toast({
        title: "Succès",
        description: "Données importées avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de l'importation : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/parametres/reset", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.clear(); // Vider le cache de React Query
      toast({
        title: "Succès",
        description: "Toutes les données ont été réinitialisées",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Échec de la réinitialisation : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataMutation.mutate(file);
    }
  };

  const handleResetClick = () => {
    toast({
      title: "Confirmation requise",
      description: "Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.",
      variant: "destructive",
      action: (
        <Button
          onClick={() => {
            resetDataMutation.mutate();
            toast({
              title: "Réinitialisation en cours...",
              description: "Veuillez patienter...",
            });
          }}
          variant="secondary"
        >
          Confirmer
        </Button>
      ),
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ModuleNavigation
          title="Paramètres"
          description="Personnalisez et gérez votre compte et votre application"
          icon={<Settings className="w-6 h-6 text-primary-600" />}
        />

        <Tabs defaultValue="profil" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="profil">
              <User className="w-4 h-4 mr-2" /> Profil
            </TabsTrigger>
            <TabsTrigger value="securite">
              <Shield className="w-4 h-4 mr-2" /> Sécurité
            </TabsTrigger>
            <TabsTrigger value="interface">
              <Palette className="w-4 h-4 mr-2" /> Interface
            </TabsTrigger>
            <TabsTrigger value="donnees">
              <Database className="w-4 h-4 mr-2" /> Données
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profil" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations de profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isUserLoading ? (
                  <p>Chargement des données...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName || ""}
                          onChange={(e) =>
                            setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          disabled={updateProfileMutation.isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom de famille</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName || ""}
                          onChange={(e) =>
                            setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          disabled={updateProfileMutation.isPending}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="farmName">Nom de la ferme</Label>
                      <Input
                        id="farmName"
                        value={profileData.farmName || ""}
                        onChange={(e) =>
                          setProfileData({ ...profileData, farmName: e.target.value })
                        }
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email || ""}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone || ""}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                    <Button
                      onClick={() => updateProfileMutation.mutate(profileData)}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder les modifications
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="securite" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Modifier le mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="old-password">Ancien mot de passe</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={password.old}
                    onChange={(e) =>
                      setPassword({ ...password, old: e.target.value })
                    }
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password.new}
                    onChange={(e) =>
                      setPassword({ ...password, new: e.target.value })
                    }
                    disabled={changePasswordMutation.isPending}
                  />
                </div>
                <Button
                  onClick={() => changePasswordMutation.mutate(password)}
                  disabled={changePasswordMutation.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Modifier le mot de passe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Options d'interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Mode sombre</Label>
                  <Switch id="dark-mode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Notifications</Label>
                  <Switch id="notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autosave">Sauvegarde automatique</Label>
                  <Switch id="autosave" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donnees" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exporter des données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Sauvegardez vos données dans un fichier local.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => exportDataMutation.mutate("csv")}
                      disabled={exportDataMutation.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter au format CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Importer/Réinitialiser
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Restaurez vos données à partir d'une sauvegarde ou réinitialisez tout.
                  </p>
                  <div className="space-y-2">
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={importDataMutation.isPending}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("file-input")?.click()}
                      disabled={importDataMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier d'import
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleResetClick}
                      disabled={resetDataMutation.isPending}
                    >
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