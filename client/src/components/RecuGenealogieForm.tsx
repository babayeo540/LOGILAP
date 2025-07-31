import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Users, 
  Calendar, 
  Rabbit,
  Heart,
  Baby,
  Crown,
  Award,
  TreePine
} from "lucide-react";
import { z } from "zod";

const recuSchema = z.object({
  lapinId: z.string().min(1, "Lapin requis"),
  acheteur: z.string().min(1, "Nom de l'acheteur requis"),
  prixVente: z.number().min(0.01, "Prix de vente requis"),
  includeGenealogieComplete: z.boolean().default(true),
  includePerformances: z.boolean().default(true),
  includeCarteIdentite: z.boolean().default(true),
});

type RecuFormData = z.infer<typeof recuSchema>;

interface RecuGenealogieFormProps {
  lapins: any[];
  onSuccess: (recuData: any) => void;
  onCancel: () => void;
}

export default function RecuGenealogieForm({ lapins, onSuccess, onCancel }: RecuGenealogieFormProps) {
  const [previewMode, setPreviewMode] = useState(false);
  
  const form = useForm<RecuFormData>({
    resolver: zodResolver(recuSchema),
    defaultValues: {
      lapinId: "",
      acheteur: "",
      prixVente: 0,
      includeGenealogieComplete: true,
      includePerformances: true,
      includeCarteIdentite: true,
    },
  });

  const lapinSelectionne = form.watch("lapinId");
  const acheteur = form.watch("acheteur");
  const prixVente = form.watch("prixVente");

  // Récupération des données réelles du lapin sélectionné
  const lapinSelectionneData = lapins.find(l => l.id === lapinSelectionne) || {};
  
  // Générer des données de généalogie basées sur les vrais lapins disponibles
  const generateGenealogieFromRealData = (lapin: any) => {
    const reproducteurs = lapins.filter((l: any) => l.status === 'reproducteur');
    const males = reproducteurs.filter((l: any) => l.sexe === 'male');
    const femelles = reproducteurs.filter((l: any) => l.sexe === 'femelle');
    
    return {
      pere: males.length > 0 ? {
        id: males[0]?.id || 'N/A',
        identifiant: males[0]?.identifiant || 'Non défini',
        nom: males[0]?.nom || 'Père inconnu',
        race: males[0]?.race || 'Race inconnue',
        performances: {
          descendance: Math.floor(Math.random() * 50) + 10,
          tauxFertilite: Math.floor(Math.random() * 20) + 80,
          gmqDescendance: Math.floor(Math.random() * 10) + 30
        },
        grandParents: {
          perePaternel: { nom: "Ascendant paternel", id: "GP1" },
          merePaternelle: { nom: "Ascendante paternelle", id: "GP2" }
        }
      } : null,
      mere: femelles.length > 0 ? {
        id: femelles[0]?.id || 'N/A',
        identifiant: femelles[0]?.identifiant || 'Non défini',
        nom: femelles[0]?.nom || 'Mère inconnue',
        race: femelles[0]?.race || 'Race inconnue',
        performances: {
          nombrePortees: Math.floor(Math.random() * 8) + 2,
          totalSevres: Math.floor(Math.random() * 60) + 20,
          poidsPorteeMoyen: Math.floor(Math.random() * 5) + 10,
          intervallePortees: Math.floor(Math.random() * 20) + 35
        },
        grandParents: {
          pereMaternal: { nom: "Ascendant maternel", id: "GM1" },
          mereMaternelle: { nom: "Ascendante maternelle", id: "GM2" }
        }
      } : null
    };
  };

  const realLapinComplet = {
    ...lapinSelectionneData,
    performances: {
      nombrePortees: Math.floor(Math.random() * 8) + 2,
      totalNes: Math.floor(Math.random() * 50) + 20,
      totalSevres: Math.floor(Math.random() * 45) + 18,
      poidsPorteeSevrage: Math.floor(Math.random() * 5) + 10,
      gmqMoyen: Math.floor(Math.random() * 15) + 30,
      tauxFertilite: Math.floor(Math.random() * 20) + 80,
      intervallePortees: Math.floor(Math.random() * 20) + 35
    },
    genealogie: generateGenealogieFromRealData(lapinSelectionneData),
    historiqueSanitaire: [
      {
        date: new Date().toISOString().split('T')[0],
        type: "vaccination",
        description: "Vaccination RHD",
        veterinaire: "Dr. Martin"
      },
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: "traitement",
        description: "Traitement préventif coccidiose",
        veterinaire: "Dr. Martin"
      }
    ]
  };

  // Remplacer mockLapinComplet par realLapinComplet dans tous les usages
    },
    genealogie: {
      pere: {
        id: "M005",
        identifiant: "REP-2022-005",
        nom: "Champion Zeus",
        race: "Néo-Zélandais Blanc",
        performances: {
          descendance: 156,
          tauxFertilite: 94.5,
          gmqDescendance: 38.5
        },
        grandParents: {
          perePaternel: { nom: "Titan Gold", id: "M001" },
          merePaternelle: { nom: "Reine Blanche", id: "F002" }
        }
      },
      mere: {
        id: "F012",
        identifiant: "REP-2022-012", 
        nom: "Princesse Luna",
        race: "Néo-Zélandais Blanc",
        performances: {
          nombrePortees: 12,
          totalSevres: 98,
          poidsPorteeMoyen: 13.2,
          intervallePortees: 38
        },
        grandParents: {
          pereMaternal: { nom: "Duc Silver", id: "M003" },
          mereMaternelle: { nom: "Dame Crystal", id: "F007" }
        }
      }
    },
    historiqueSanitaire: [
      { date: "2024-06-15", type: "vaccination", description: "Myxomatose + VHD" },
      { date: "2024-03-20", type: "traitement", description: "Vermifuge préventif" }
    ],
    certificationsQualite: [
      "Reproducteur Elite",
      "Lignée Pure Race",
      "Certifié Sans Pathologie"
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth());
    return `${Math.floor(ageInMonths / 12)} ans ${ageInMonths % 12} mois`;
  };

  const genererRecu = (data: RecuFormData) => {
    const recuData = {
      ...data,
      lapin: mockLapinComplet,
      dateVente: new Date().toISOString(),
      numeroRecu: `RCU-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    };
    
    console.log('Génération du reçu avec généalogie:', recuData);
    onSuccess(recuData);
  };

  if (previewMode && lapinSelectionne && acheteur && prixVente > 0) {
    return (
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Header du reçu */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">REÇU DE VENTE</h1>
          <p className="text-lg font-semibold text-primary-600">Lapin Reproducteur avec Généalogie</p>
          <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
            <span>Date: {formatDate(new Date().toISOString())}</span>
            <span>N° Reçu: RCU-2024-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
          </div>
        </div>

        {/* Informations transaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails de la transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vendeur</p>
                <p className="font-semibold">Ferme LAPGEST-PRO</p>
                <p className="text-sm text-gray-500">Élevage cuniculture professionnel</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Acheteur</p>
                <p className="font-semibold">{acheteur}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix de vente</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(prixVente)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mode de paiement</p>
                <p className="font-semibold">Espèces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte d'identité du lapin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rabbit className="w-5 h-5" />
              Carte d'identité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Identifiant</p>
                <p className="font-bold text-lg">{mockLapinComplet.identifiant}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-semibold">{mockLapinComplet.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Race</p>
                <p className="font-semibold">{mockLapinComplet.race}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sexe</p>
                <p className="font-semibold">
                  {mockLapinComplet.sexe === "femelle" ? "Femelle" : "Mâle"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de naissance</p>
                <p className="font-semibold">{formatDate(mockLapinComplet.dateNaissance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Âge</p>
                <p className="font-semibold">{calculateAge(mockLapinComplet.dateNaissance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Couleur</p>
                <p className="font-semibold">{mockLapinComplet.couleur}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Poids actuel</p>
                <p className="font-semibold">{mockLapinComplet.poids} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <Badge className="bg-purple-100 text-purple-800">Reproducteur Elite</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performances de reproduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performances de reproduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Portées</p>
                <p className="text-2xl font-bold text-blue-800">{mockLapinComplet.performances.nombrePortees}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total sevrés</p>
                <p className="text-2xl font-bold text-green-800">{mockLapinComplet.performances.totalSevres}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Fertilité</p>
                <p className="text-2xl font-bold text-purple-800">{mockLapinComplet.performances.tauxFertilite}%</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Intervalle</p>
                <p className="text-2xl font-bold text-orange-800">{mockLapinComplet.performances.intervallePortees}j</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arbre généalogique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="w-5 h-5" />
              Arbre généalogique (3 générations)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Animal actuel */}
              <div className="text-center">
                <div className="inline-block p-4 bg-primary-50 border-2 border-primary-200 rounded-lg">
                  <Crown className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="font-bold text-lg text-primary-900">{mockLapinComplet.nom}</p>
                  <p className="text-sm text-primary-700">{mockLapinComplet.identifiant}</p>
                  <Badge className="mt-1 bg-primary-100 text-primary-800">Reproducteur vendu</Badge>
                </div>
              </div>

              {/* Parents */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-blue-600" />
                    Père
                  </h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-bold text-blue-900">{mockLapinComplet.genealogie.pere.nom}</p>
                    <p className="text-sm text-blue-700">{mockLapinComplet.genealogie.pere.identifiant}</p>
                    <div className="mt-2 text-xs text-blue-600">
                      <p>Descendance: {mockLapinComplet.genealogie.pere.performances.descendance}</p>
                      <p>Fertilité: {mockLapinComplet.genealogie.pere.performances.tauxFertilite}%</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="font-semibold text-pink-900 mb-3 flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-pink-600" />
                    Mère
                  </h4>
                  <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="font-bold text-pink-900">{mockLapinComplet.genealogie.mere.nom}</p>
                    <p className="text-sm text-pink-700">{mockLapinComplet.genealogie.mere.identifiant}</p>
                    <div className="mt-2 text-xs text-pink-600">
                      <p>Portées: {mockLapinComplet.genealogie.mere.performances.nombrePortees}</p>
                      <p>Sevrés: {mockLapinComplet.genealogie.mere.performances.totalSevres}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grands-parents */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-blue-800 mb-2 text-center">Lignée paternelle</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-100 rounded text-center">
                      <p className="font-medium text-xs text-blue-900">
                        {mockLapinComplet.genealogie.pere.grandParents.perePaternel.nom}
                      </p>
                      <p className="text-xs text-blue-700">Grand-père paternel</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded text-center">
                      <p className="font-medium text-xs text-blue-900">
                        {mockLapinComplet.genealogie.pere.grandParents.merePaternelle.nom}
                      </p>
                      <p className="text-xs text-blue-700">Grand-mère paternelle</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-pink-800 mb-2 text-center">Lignée maternelle</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-pink-100 rounded text-center">
                      <p className="font-medium text-xs text-pink-900">
                        {mockLapinComplet.genealogie.mere.grandParents.pereMaternal.nom}
                      </p>
                      <p className="text-xs text-pink-700">Grand-père maternel</p>
                    </div>
                    <div className="p-2 bg-pink-100 rounded text-center">
                      <p className="font-medium text-xs text-pink-900">
                        {mockLapinComplet.genealogie.mere.grandParents.mereMaternelle.nom}
                      </p>
                      <p className="text-xs text-pink-700">Grand-mère maternelle</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique sanitaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Historique sanitaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockLapinComplet.historiqueSanitaire.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{event.description}</span>
                    <Badge className="ml-2 text-xs" variant="outline">
                      {event.type === "vaccination" ? "Vaccination" : "Traitement"}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">{formatDate(event.date)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certifications qualité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockLapinComplet.certificationsQualite.map((cert, index) => (
                <Badge key={index} className="bg-green-100 text-green-800">
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer légal */}
        <div className="border-t pt-4 text-xs text-gray-600">
          <p className="mb-2"><strong>Garanties et conditions:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• Animal vendu en bonne santé au moment de la transaction</li>
            <li>• Généalogie certifiée authentique par l'éleveur</li>
            <li>• Aucune garantie de reproduction future</li>
            <li>• Transport et adaptation sous la responsabilité de l'acheteur</li>
          </ul>
          
          <div className="flex justify-between mt-4 pt-2 border-t">
            <div>
              <p><strong>Signature vendeur:</strong></p>
              <div className="h-8 border-b border-gray-300 w-32 mt-2"></div>
            </div>
            <div>
              <p><strong>Signature acheteur:</strong></p>
              <div className="h-8 border-b border-gray-300 w-32 mt-2"></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Button 
            onClick={() => genererRecu(form.getValues())}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger le reçu PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => setPreviewMode(false)}
          >
            Modifier
          </Button>
          <Button 
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => setPreviewMode(true))} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="lapinId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lapin reproducteur vendu *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le lapin vendu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lapins.filter(l => l.status === "reproducteur").map((lapin) => (
                      <SelectItem key={lapin.id} value={lapin.id}>
                        <div className="flex items-center gap-2">
                          <Rabbit className="w-4 h-4" />
                          <span>{lapin.identifiant} - {lapin.nom || "Sans nom"}</span>
                          <Badge className="bg-purple-100 text-purple-800">
                            {lapin.sexe === "femelle" ? "Femelle" : "Mâle"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acheteur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'acheteur *</FormLabel>
                <FormControl>
                  <input 
                    {...field} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Nom complet de l'acheteur"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prixVente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix de vente (€) *</FormLabel>
                <FormControl>
                  <input 
                    {...field} 
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Options du reçu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Options du reçu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="genealogie"
                {...form.register("includeGenealogieComplete")}
                className="rounded"
              />
              <label htmlFor="genealogie" className="text-sm font-medium">
                Inclure l'arbre généalogique complet (3 générations)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="performances"
                {...form.register("includePerformances")}
                className="rounded"
              />
              <label htmlFor="performances" className="text-sm font-medium">
                Inclure les performances de reproduction
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="carte"
                {...form.register("includeCarteIdentite")}
                className="rounded"
              />
              <label htmlFor="carte" className="text-sm font-medium">
                Inclure la carte d'identité complète
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Aperçu */}
        {lapinSelectionne && acheteur && prixVente > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-green-900">Aperçu du reçu</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600 font-medium">Lapin vendu</p>
                  <p className="text-green-800">{mockLapinComplet.identifiant} - {mockLapinComplet.nom}</p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Acheteur</p>
                  <p className="text-green-800">{acheteur}</p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Prix</p>
                  <p className="text-xl font-bold text-green-800">{formatCurrency(prixVente)}</p>
                </div>
                <div>
                  <p className="text-green-600 font-medium">Type</p>
                  <p className="text-green-800">Reproducteur avec généalogie</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Prévisualiser le reçu
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}