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
  Stethoscope, 
  Plus, 
  Search, 
  Calendar, 
  AlertTriangle,
  Shield,
  Pill,
  Thermometer,
  Heart,
  Eye,
  Edit,
  Trash2,
  Clock
} from "lucide-react";
import SoinForm from "../components/SoinForm";
import VaccinForm from "../components/VaccinForm";

export default function Sante() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showSoinForm, setShowSoinForm] = useState(false);
  const [showVaccinForm, setShowVaccinForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lapins = [] } = useQuery({
    queryKey: ["/api/lapins"],
  });

  // Mock data for health records - would come from API in real implementation
  const mockHealthRecords = [
    {
      id: "1",
      type: "soin",
      lapinId: "lapin-1",
      titre: "Traitement diarrhée",
      description: "Administration d'anti-diarrhéique",
      date: "2024-07-25",
      gravite: "modérée",
      traitement: "Smecta pendant 3 jours",
      veterinaire: "Dr. Martin",
      cout: 15.50,
      status: "terminé"
    },
    {
      id: "2",
      type: "vaccin",
      lapinId: "lapin-2", 
      titre: "Vaccination RHD",
      description: "Rappel annuel RHD + Myxomatose",
      date: "2024-07-20",
      vaccin: "Nobivac Myxo-RHD",
      prochainRappel: "2025-07-20",
      veterinaire: "Dr. Dubois",
      cout: 25.00,
      status: "effectué"
    },
    {
      id: "3",
      type: "examen",
      lapinId: "lapin-3",
      titre: "Check-up reproducteur",
      description: "Examen général avant saillie",
      date: "2024-07-18",
      poids: 3.2,
      temperature: 38.5,
      veterinaire: "Dr. Martin",
      cout: 35.00,
      status: "terminé"
    }
  ];

  const getLapinName = (lapinId: string) => {
    const lapin = lapins.find((l: any) => l.id === lapinId);
    return lapin ? lapin.identifiant : lapinId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "soin":
        return <Badge className="bg-red-100 text-red-800"><Pill className="w-3 h-3 mr-1" />Soin</Badge>;
      case "vaccin":
        return <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />Vaccin</Badge>;
      case "examen":
        return <Badge className="bg-blue-100 text-blue-800"><Stethoscope className="w-3 h-3 mr-1" />Examen</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getGraviteBadge = (gravite: string) => {
    switch (gravite) {
      case "légère":
        return <Badge className="bg-green-100 text-green-800">Légère</Badge>;
      case "modérée":
        return <Badge className="bg-yellow-100 text-yellow-800">Modérée</Badge>;
      case "grave":
        return <Badge className="bg-red-100 text-red-800">Grave</Badge>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredRecords = mockHealthRecords.filter((record: any) => {
    const lapinNom = getLapinName(record.lapinId);
    const matchesSearch = record.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lapinNom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculs des statistiques
  const totalCouts = mockHealthRecords.reduce((sum, r) => sum + (r.cout || 0), 0);
  const soinsEnCours = mockHealthRecords.filter(r => r.status === "en_cours").length;
  const vaccinsAFaire = mockHealthRecords.filter(r => 
    r.type === "vaccin" && r.prochainRappel && 
    new Date(r.prochainRappel) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi Sanitaire</h1>
          <p className="text-gray-600">Gérez la santé et les soins de votre cheptel</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSoinForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Pill className="w-4 h-4 mr-2" />
            Nouveau Soin
          </Button>
          <Button 
            onClick={() => setShowVaccinForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Nouveau Vaccin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Stethoscope className="text-blue-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interventions</p>
                <p className="text-2xl font-bold text-gray-900">{mockHealthRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="text-red-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Soins en cours</p>
                <p className="text-2xl font-bold text-gray-900">{soinsEnCours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rappels vaccins</p>
                <p className="text-2xl font-bold text-gray-900">{vaccinsAFaire}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Pill className="text-green-600 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coûts totaux</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCouts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="historique" className="space-y-6">
        <TabsList>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="historique" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par titre ou lapin..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">Tous les types</option>
                    <option value="soin">Soins</option>
                    <option value="vaccin">Vaccins</option>
                    <option value="examen">Examens</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enregistrement trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm || typeFilter !== "all" 
                      ? "Essayez de modifier vos critères de recherche"
                      : "Commencez par enregistrer votre première intervention"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRecords.map((record: any) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          record.type === "soin" ? 'bg-red-100' :
                          record.type === "vaccin" ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {record.type === "soin" ? <Pill className="text-red-600 w-6 h-6" /> :
                           record.type === "vaccin" ? <Shield className="text-green-600 w-6 h-6" /> :
                           <Stethoscope className="text-blue-600 w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {record.titre}
                            </h3>
                            {getTypeBadge(record.type)}
                            {record.gravite && getGraviteBadge(record.gravite)}
                          </div>
                          <p className="text-gray-600 mb-2">{record.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Lapin</p>
                              <p className="font-medium">{getLapinName(record.lapinId)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Date</p>
                              <p className="font-medium">{formatDate(record.date)}</p>
                            </div>
                            {record.veterinaire && (
                              <div>
                                <p className="text-gray-500">Vétérinaire</p>
                                <p className="font-medium">{record.veterinaire}</p>
                              </div>
                            )}
                            {record.cout && (
                              <div>
                                <p className="text-gray-500">Coût</p>
                                <p className="font-medium">{formatCurrency(record.cout)}</p>
                              </div>
                            )}
                          </div>
                          {record.prochainRappel && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Prochain rappel: {formatDate(record.prochainRappel)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRecord(record);
                            if (record.type === "soin") {
                              setShowSoinForm(true);
                            } else {
                              setShowVaccinForm(true);
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
                              toast({
                                title: "Enregistrement supprimé",
                                description: "L'enregistrement a été supprimé avec succès",
                              });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rappels de vaccination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHealthRecords
                  .filter(r => r.type === "vaccin" && r.prochainRappel)
                  .sort((a, b) => new Date(a.prochainRappel).getTime() - new Date(b.prochainRappel).getTime())
                  .map((vaccin) => {
                    const daysUntil = Math.ceil((new Date(vaccin.prochainRappel).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={vaccin.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{getLapinName(vaccin.lapinId)}</p>
                          <p className="text-sm text-gray-600">{vaccin.titre}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            daysUntil <= 7 ? 'text-red-600' :
                            daysUntil <= 30 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {daysUntil <= 0 ? 'En retard' : `dans ${daysUntil} jours`}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(vaccin.prochainRappel)}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rapports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coûts par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analyse des coûts à venir</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Santé du cheptel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Statistiques de santé à venir</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Soin Form Dialog */}
      <Dialog open={showSoinForm} onOpenChange={setShowSoinForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord?.type === "soin" ? "Modifier le soin" : "Nouveau soin"}
            </DialogTitle>
            <DialogDescription>
              Enregistrez une intervention médicale
            </DialogDescription>
          </DialogHeader>
          <SoinForm
            soin={editingRecord?.type === "soin" ? editingRecord : null}
            onSuccess={() => {
              setShowSoinForm(false);
              setEditingRecord(null);
              toast({
                title: "Succès",
                description: "Soin enregistré avec succès",
              });
            }}
            onCancel={() => {
              setShowSoinForm(false);
              setEditingRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Vaccin Form Dialog */}
      <Dialog open={showVaccinForm} onOpenChange={setShowVaccinForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord?.type === "vaccin" ? "Modifier le vaccin" : "Nouveau vaccin"}
            </DialogTitle>
            <DialogDescription>
              Enregistrez une vaccination
            </DialogDescription>
          </DialogHeader>
          <VaccinForm
            vaccin={editingRecord?.type === "vaccin" ? editingRecord : null}
            onSuccess={() => {
              setShowVaccinForm(false);
              setEditingRecord(null);
              toast({
                title: "Succès",
                description: "Vaccination enregistrée avec succès",
              });
            }}
            onCancel={() => {
              setShowVaccinForm(false);
              setEditingRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}