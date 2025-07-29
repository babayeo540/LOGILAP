import { useState } from "react";
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
  FileText,
  Download,
  Filter,
  Rabbit,
  Heart,
  Baby,
  Scale,
  Stethoscope,
  DollarSign,
  Package,
  Users,
  Building2,
  Target,
  Activity,
  AlertTriangle
} from "lucide-react";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Rapports() {
  const [periodeFilter, setPeriodeFilter] = useState("mois");
  const [rapportType, setRapportType] = useState("production");

  // Mock data pour les statistiques
  const mockStats = {
    production: {
      totalLapins: 157,
      reproducteurs: 24,
      engraissement: 98,
      stockVendre: 35,
      naissancesMonth: 45,
      decessMonth: 3,
      tauxNatalite: 92.5,
      tauxSurvie: 94.2,
      poidsVenteMoyen: 2.8,
      gmqMoyen: 35.5
    },
    financier: {
      chiffreAffaires: 12850.00,
      beneficeNet: 4560.00,
      ventesLapins: 11200.00,
      ventesFumier: 1650.00,
      totalDepenses: 8290.00,
      margeOperationnelle: 35.5,
      coutProduction: 5.80,
      prixVenteMoyen: 8.50
    },
    sanitaire: {
      traitements: 12,
      vaccinations: 48,
      consultations: 6,
      mortalite: 1.9,
      principalesMaladies: [
        { nom: "Coccidiose", cas: 8 },
        { nom: "Pneumonie", cas: 3 },
        { nom: "Diarrhée", cas: 5 }
      ],
      coutsSanitaires: 850.00
    },
    reproducteur: {
      femelles: 18,
      males: 6,
      saillieFecondite: 87.5,
      prolificite: 8.2,
      intervallePortees: 45,
      performeurs: [
        { id: "F001", nom: "Bella", portees: 6, lapereaux: 52 },
        { id: "F008", nom: "Luna", portees: 5, lapereaux: 43 },
        { id: "M003", nom: "Rex", accouplements: 24, fecondite: 91.7 }
      ]
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const exportRapport = (type: string) => {
    // Simulation d'export
    const filename = `rapport_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log(`Exporting ${filename}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleNavigation 
        currentModule="rapports"
        moduleTitle="Rapports & Statistiques"
        moduleDescription="Analyses détaillées de votre ferme cuniculture"
      />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Période d'analyse</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportRapport(rapportType)}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <select
              value={periodeFilter}
              onChange={(e) => setPeriodeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="semaine">Cette semaine</option>
              <option value="mois">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </select>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Rabbit className="text-white w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-100">Total Lapins</p>
                  <p className="text-2xl font-bold text-white">{mockStats.production.totalLapins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-100">CA du mois</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.financier.chiffreAffaires)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-100">Bénéfice Net</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.financier.beneficeNet)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target className="text-white w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-100">Marge Op.</p>
                  <p className="text-2xl font-bold text-white">{mockStats.financier.margeOperationnelle}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="production" className="space-y-6" onValueChange={setRapportType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="financier">Financier</TabsTrigger>
            <TabsTrigger value="sanitaire">Sanitaire</TabsTrigger>
            <TabsTrigger value="reproducteur">Reproducteurs</TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Répartition du cheptel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Répartition du cheptel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <span className="text-sm">Reproducteurs</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{mockStats.production.reproducteurs}</p>
                        <p className="text-xs text-gray-500">
                          {((mockStats.production.reproducteurs / mockStats.production.totalLapins) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Engraissement</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{mockStats.production.engraissement}</p>
                        <p className="text-xs text-gray-500">
                          {((mockStats.production.engraissement / mockStats.production.totalLapins) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Stock à vendre</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{mockStats.production.stockVendre}</p>
                        <p className="text-xs text-gray-500">
                          {((mockStats.production.stockVendre / mockStats.production.totalLapins) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Indicateurs de performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performances du mois
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Naissances</span>
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{mockStats.production.naissancesMonth}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux natalité</span>
                      <Badge className="bg-green-100 text-green-800">
                        {mockStats.production.tauxNatalite}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux survie</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {mockStats.production.tauxSurvie}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">GMQ moyen</span>
                      <span className="font-semibold">{mockStats.production.gmqMoyen}g/j</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Poids vente</span>
                      <span className="font-semibold">{mockStats.production.poidsVenteMoyen}kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertes production */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Alertes & Suivi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Attention</span>
                      </div>
                      <p className="text-xs text-orange-700">3 mises bas prévues cette semaine</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Scale className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Pesée</span>
                      </div>
                      <p className="text-xs text-blue-700">12 lapins prêts pour pesée contrôle</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Objectif</span>
                      </div>
                      <p className="text-xs text-green-700">Objectif mensuel: 95% atteint</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financier" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Analyse des revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ventes lapins</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(mockStats.financier.ventesLapins)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ventes fumier</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(mockStats.financier.ventesFumier)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Chiffre d'affaires</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(mockStats.financier.chiffreAffaires)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prix vente moyen</span>
                      <span className="font-semibold">
                        {formatCurrency(mockStats.financier.prixVenteMoyen)}/kg
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rentabilité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Analyse de rentabilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total dépenses</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(mockStats.financier.totalDepenses)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Coût production</span>
                      <span className="font-semibold">
                        {formatCurrency(mockStats.financier.coutProduction)}/kg
                      </span>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Bénéfice net</span>
                        <span className="font-bold text-lg text-blue-600">
                          {formatCurrency(mockStats.financier.beneficeNet)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Marge opérationnelle</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {mockStats.financier.margeOperationnelle}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sanitaire" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistiques sanitaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-red-500" />
                    Suivi sanitaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Traitements donnés</span>
                      <span className="font-semibold">{mockStats.sanitaire.traitements}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vaccinations</span>
                      <span className="font-semibold">{mockStats.sanitaire.vaccinations}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Consultations vétérinaires</span>
                      <span className="font-semibold">{mockStats.sanitaire.consultations}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux mortalité</span>
                      <Badge className="bg-red-100 text-red-800">
                        {mockStats.sanitaire.mortalite}%
                      </Badge>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Coûts sanitaires</span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(mockStats.sanitaire.coutsSanitaires)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Principales maladies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Principales pathologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStats.sanitaire.principalesMaladies.map((maladie, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{maladie.nom}</span>
                        <Badge variant="outline">
                          {maladie.cas} cas
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Recommandations</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Surveillance accrue période humide</li>
                      <li>• Vaccinations préventives à jour</li>
                      <li>• Nettoyage renforcé des enclos</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reproducteur" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vue d'ensemble reproducteurs */}  
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Vue d'ensemble
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Femelles reproductrices</span>
                      <span className="font-semibold">{mockStats.reproducteur.femelles}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mâles reproducteurs</span>
                      <span className="font-semibold">{mockStats.reproducteur.males}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux fécondité</span>
                      <Badge className="bg-pink-100 text-pink-800">
                        {mockStats.reproducteur.saillieFecondite}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prolificité moyenne</span>
                      <span className="font-semibold">{mockStats.reproducteur.prolificite} lapereaux</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Intervalle portées</span>
                      <span className="font-semibold">{mockStats.reproducteur.intervallePortees} jours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Reproducteurs performants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStats.reproducteur.performeurs.map((animal, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{animal.nom}</span>
                            <Badge variant="outline" className="text-xs">#{animal.id}</Badge>
                          </div>
                          {animal.portees && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {animal.portees} portées
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {animal.lapereaux && (
                            <span>{animal.lapereaux} lapereaux produits</span>
                          )}
                          {animal.fecondite && (
                            <span>{animal.fecondite}% de fécondité</span>
                          )}
                        </div>
                      </div>
                    ))}
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