import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rabbit, User, Calendar, Euro, FileText, Download } from "lucide-react";
import GenealogyReceipt from "./GenealogyReceipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Schéma amélioré pour les ventes de lapins
const venteRabbitSchema = z.object({
  // Informations client
  clientNom: z.string().min(1, "Le nom du client est requis"),
  clientPrenom: z.string().optional(),
  clientTelephone: z.string().optional(),
  clientEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  clientAdresse: z.string().optional(),
  
  // Informations de vente
  typeVente: z.enum(["Chair", "Reproducteur"], {
    errorMap: () => ({ message: "Le type de vente est requis" }),
  }),
  prixUnitaire: z.string().transform((val, ctx) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix doit être un nombre positif",
      });
      return z.NEVER;
    }
    return parsed;
  }),
  dateVente: z.string().min(1, "La date de vente est requise"),
  lapinsSelectionnes: z.array(z.string()).min(1, "Sélectionnez au moins un lapin"),
  
  // Options
  genererRecu: z.boolean().default(true),
  notes: z.string().optional(),
});

type VenteRabbitFormData = z.infer<typeof venteRabbitSchema>;

interface Rabbit {
  id: string;
  identifiant: string;
  race: string;
  sexe: 'Male' | 'Female';
  couleur: string;
  dateNaissance: string;
  poids?: number;
  statut: string;
  pere?: Rabbit;
  mere?: Rabbit;
}

interface VenteRabbitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VenteRabbitForm({ onSuccess, onCancel }: VenteRabbitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [generatedSale, setGeneratedSale] = useState<any>(null);

  // Récupération des lapins disponibles à la vente
  const { data: lapinsDisponibles, isLoading } = useQuery<Rabbit[]>({
    queryKey: ["/api/lapins/disponibles-vente"],
    queryFn: async () => {
      const response = await fetch("/api/lapins/disponibles-vente");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des lapins");
      }
      return response.json();
    },
  });

  const form = useForm<VenteRabbitFormData>({
    resolver: zodResolver(venteRabbitSchema),
    defaultValues: {
      clientNom: "",
      clientPrenom: "",
      clientTelephone: "",
      clientEmail: "",
      clientAdresse: "",
      typeVente: "Chair",
      prixUnitaire: "0",
      dateVente: new Date().toISOString().split('T')[0],
      lapinsSelectionnes: [],
      genererRecu: true,
      notes: "",
    },
  });

  const lapinsSelectionnes = form.watch("lapinsSelectionnes");
  const typeVente = form.watch("typeVente");
  const prixUnitaire = parseFloat(form.watch("prixUnitaire") || "0");
  const quantite = lapinsSelectionnes?.length || 0;
  const prixTotal = quantite * prixUnitaire;

  const toggleLapinSelection = (lapinId: string) => {
    const current = form.getValues("lapinsSelectionnes");
    const updated = current.includes(lapinId)
      ? current.filter(id => id !== lapinId)
      : [...current, lapinId];
    form.setValue("lapinsSelectionnes", updated);
  };

  const onSubmit = async (data: VenteRabbitFormData) => {
    setIsSubmitting(true);
    try {
      // Préparer les données de vente
      const lapinsVendus = lapinsDisponibles?.filter(lapin => 
        data.lapinsSelectionnes.includes(lapin.id)
      ) || [];

      const venteData = {
        client: {
          nom: data.clientNom,
          prenom: data.clientPrenom,
          telephone: data.clientTelephone,
          email: data.clientEmail,
          adresse: data.clientAdresse,
        },
        typeVente: data.typeVente,
        prixUnitaire: data.prixUnitaire,
        prixTotal,
        quantite,
        dateVente: data.dateVente,
        lapinsIds: data.lapinsSelectionnes,
        notes: data.notes,
      };

      // TODO: Remplacer par l'appel API réel
      const response = await fetch('/api/ventes/lapins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venteData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la vente');
      }

      const result = await response.json();

      // Si génération de reçu demandée
      if (data.genererRecu) {
        const saleForReceipt = {
          id: result.id || 'temp-id',
          numeroVente: result.numeroVente || `V-${Date.now()}`,
          dateVente: data.dateVente,
          typeVente: data.typeVente,
          prixUnitaire: data.prixUnitaire,
          prixTotal,
          quantite,
          client: venteData.client,
          lapins: lapinsVendus,
        };

        setGeneratedSale(saleForReceipt);
        setShowReceipt(true);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la vente :", error);
      form.setError("root.serverError", {
        type: "400",
        message: "Une erreur est survenue lors de l'enregistrement de la vente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const handleDownloadReceipt = async () => {
    // TODO: Implémenter la génération PDF
    console.log("Téléchargement du reçu PDF");
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Chargement des lapins disponibles...</p>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientNom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nom du client" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientPrenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Prénom du client" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientTelephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+225 XX XX XX XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="client@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientAdresse"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Adresse complète du client" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Détails de la Vente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Détails de la Vente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="typeVente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de Vente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Chair">Pour la Chair</SelectItem>
                          <SelectItem value="Reproducteur">Reproducteur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prixUnitaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix Unitaire (XOF) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="5000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateVente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de Vente *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Résumé financier */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Quantité</p>
                    <p className="text-lg font-semibold">{quantite} lapin(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix Unitaire</p>
                    <p className="text-lg font-semibold">{formatCurrency(prixUnitaire)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(prixTotal)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection des Lapins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rabbit className="w-5 h-5" />
                Sélection des Lapins ({lapinsDisponibles?.length || 0} disponibles)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="lapinsSelectionnes"
                render={() => (
                  <FormItem>
                    <FormMessage />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lapinsDisponibles?.map((lapin) => (
                        <div
                          key={lapin.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            lapinsSelectionnes.includes(lapin.id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleLapinSelection(lapin.id)}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              checked={lapinsSelectionnes.includes(lapin.id)}
                              onChange={() => toggleLapinSelection(lapin.id)}
                            />
                            <Badge variant={lapin.sexe === 'Male' ? 'default' : 'secondary'}>
                              {lapin.sexe === 'Male' ? '♂' : '♀'} {lapin.identifiant}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{lapin.race} - {lapin.couleur}</p>
                            <p>Né le {new Date(lapin.dateNaissance).toLocaleDateString('fr-FR')}</p>
                            {lapin.poids && <p>Poids: {lapin.poids} kg</p>}
                            <p className="capitalize">Statut: {lapin.statut}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Options et Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Options et Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="genererRecu"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Générer un reçu avec certificat généalogique
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          Recommandé pour les ventes de reproducteurs
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Notes sur la vente..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Erreurs globales */}
          {form.formState.errors.root?.serverError && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.root.serverError.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Finaliser la Vente"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>

      {/* Dialog pour le reçu généalogique */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Reçu de Vente avec Certificat Généalogique
            </DialogTitle>
          </DialogHeader>
          {generatedSale && (
            <GenealogyReceipt
              sale={generatedSale}
              onDownload={handleDownloadReceipt}
              onPrint={handlePrintReceipt}
            />
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowReceipt(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setShowReceipt(false);
              onSuccess();
            }}>
              Terminer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
