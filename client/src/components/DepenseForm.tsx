import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

const depenseSchema = z.object({
  date: z.string().min(1, "Date requise"),
  montant: z.number().min(0.01, "Montant doit être positif"),
  categorie: z.string().min(1, "Catégorie requise"),
  description: z.string().min(1, "Description requise"),
  fournisseurBeneficiaire: z.string().min(1, "Fournisseur/Bénéficiaire requis"),
  facture: z.string().optional(),
  moyenPaiement: z.enum(["virement", "cheque", "especes", "carte", "prelevement"]),
  notes: z.string().optional(),
});

type DepenseFormData = z.infer<typeof depenseSchema>;

interface DepenseFormProps {
  depense?: any;
  categories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepenseForm({ depense, categories, onSuccess, onCancel }: DepenseFormProps) {
  const form = useForm<DepenseFormData>({
    resolver: zodResolver(depenseSchema),
    defaultValues: {
      date: depense?.date || new Date().toISOString().split('T')[0],
      montant: depense?.montant || 0,
      categorie: depense?.categorie || "",
      description: depense?.description || "",
      fournisseurBeneficiaire: depense?.fournisseurBeneficiaire || "",
      facture: depense?.facture || "",
      moyenPaiement: depense?.moyenPaiement || "virement",
      notes: depense?.notes || "",
    },
  });

  const categorieSelectionnee = form.watch("categorie");
  const montant = form.watch("montant");

  const onSubmit = (data: DepenseFormData) => {
    console.log('Dépense data:', data);
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCategorieInfo = (categorieId: string) => {
    return categories.find(c => c.id === categorieId);
  };

  const fournisseursFrequents = [
    "EDF - Électricité",
    "Veolia - Eau",
    "Station Total - Carburant",
    "Aliments Durand - Alimentation",
    "Dr. Dubois - Vétérinaire",
    "Maintenance Pro - Maintenance",
    "Banque Populaire - Frais bancaires",
    "Assurance Agricole - Assurance",
    "Transport Express - Livraisons"
  ];

  const moyensPaiement = [
    { value: "virement", label: "Virement bancaire" },
    { value: "cheque", label: "Chèque" },
    { value: "especes", label: "Espèces" },
    { value: "carte", label: "Carte bancaire" },
    { value: "prelevement", label: "Prélèvement automatique" }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de la dépense *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="montant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categorie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie de dépense *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((categorie) => (
                        <SelectItem key={categorie.id} value={categorie.id}>
                          <div className="flex items-center gap-2">
                            <span>{categorie.icon}</span>
                            <span>{categorie.label}</span>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description détaillée *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Décrivez précisément cette dépense..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Détails de paiement</h3>
            
            <FormField
              control={form.control}
              name="fournisseurBeneficiaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fournisseur / Bénéficiaire *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner ou saisir" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fournisseursFrequents.map((fournisseur, index) => (
                        <SelectItem key={index} value={fournisseur}>
                          {fournisseur}
                        </SelectItem>
                      ))}
                      <SelectItem value="autre">Autre (saisie libre)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Si "autre" est sélectionné, permettre la saisie libre */}
            {form.watch("fournisseurBeneficiaire") === "autre" && (
              <FormField
                control={form.control}
                name="fournisseurBeneficiaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du fournisseur/bénéficiaire *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Saisir le nom..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="facture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de facture</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="N° facture, reçu, référence..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moyenPaiement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moyen de paiement *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Comment avez-vous payé ?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {moyensPaiement.map((moyen) => (
                        <SelectItem key={moyen.value} value={moyen.value}>
                          {moyen.label}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes complémentaires</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Informations supplémentaires, contexte..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Aperçu de la dépense */}
        {(categorieSelectionnee || montant > 0) && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-red-900">Aperçu de la dépense</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {montant > 0 && (
                  <div>
                    <p className="text-red-600 font-medium">Montant</p>
                    <p className="text-xl font-bold text-red-800">{formatCurrency(montant)}</p>
                  </div>
                )}
                
                {categorieSelectionnee && (
                  <div>
                    <p className="text-red-600 font-medium">Catégorie</p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const categorieInfo = getCategorieInfo(categorieSelectionnee);
                        return categorieInfo ? (
                          <>
                            <span>{categorieInfo.icon}</span>
                            <Badge className={categorieInfo.color}>
                              {categorieInfo.label}
                            </Badge>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-red-600 font-medium">Date</p>
                  <p className="text-red-800">
                    {form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('fr-FR') : ""}
                  </p>
                </div>

                <div>
                  <p className="text-red-600 font-medium">Paiement</p>
                  <p className="text-red-800">
                    {moyensPaiement.find(m => m.value === form.watch("moyenPaiement"))?.label || ""}
                  </p>
                </div>
              </div>

              {form.watch("description") && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-red-600 font-medium text-xs">Description</p>
                  <p className="text-sm text-red-800">{form.watch("description")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conseils */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Conseils pour une bonne gestion</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Conservez toujours les justificatifs (factures, reçus)</li>
            <li>• Classez vos dépenses dans la bonne catégorie pour les analyses</li>
            <li>• Ajoutez des notes détaillées pour faciliter le suivi</li>
            <li>• Vérifiez régulièrement vos soldes bancaires</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {depense ? "Modifier la dépense" : "Enregistrer la dépense"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}