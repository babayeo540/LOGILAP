import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const articleSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  categorie: z.enum(["alimentation", "medicament", "equipement", "litiere"]),
  description: z.string().min(1, "Description requise"),
  stockActuel: z.number().min(0, "Stock actuel doit être positif"),
  stockMinimum: z.number().min(0, "Stock minimum doit être positif"),
  stockMaximum: z.number().min(1, "Stock maximum doit être positif"),
  unite: z.string().min(1, "Unité requise"),
  prixUnitaire: z.number().min(0, "Prix unitaire doit être positif"),
  fournisseur: z.string().optional(),
  datePeremption: z.string().optional(),
  emplacementStock: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArticleForm({ article, onSuccess, onCancel }: ArticleFormProps) {
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      nom: article?.nom || "",
      categorie: article?.categorie || "alimentation",
      description: article?.description || "",
      stockActuel: article?.stockActuel || 0,
      stockMinimum: article?.stockMinimum || 0,
      stockMaximum: article?.stockMaximum || 0,
      unite: article?.unite || "",
      prixUnitaire: article?.prixUnitaire || 0,
      fournisseur: article?.fournisseur || "",
      datePeremption: article?.datePeremption || "",
      emplacementStock: article?.emplacementStock || "",
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    console.log('Article data:', data);
    // Validation des stocks
    if (data.stockMaximum <= data.stockMinimum) {
      form.setError("stockMaximum", {
        message: "Le stock maximum doit être supérieur au stock minimum"
      });
      return;
    }
    
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
            
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'article *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Granulés lapins croissance" />
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
                  <FormLabel>Catégorie *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="alimentation">Alimentation</SelectItem>
                      <SelectItem value="medicament">Médicaments</SelectItem>
                      <SelectItem value="equipement">Équipements</SelectItem>
                      <SelectItem value="litiere">Litière</SelectItem>
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Description détaillée de l'article"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unité de mesure *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                      <SelectItem value="g">Grammes (g)</SelectItem>
                      <SelectItem value="litres">Litres (L)</SelectItem>
                      <SelectItem value="ml">Millilitres (ml)</SelectItem>
                      <SelectItem value="pièces">Pièces</SelectItem>
                      <SelectItem value="bottes">Bottes</SelectItem>
                      <SelectItem value="sacs">Sacs</SelectItem>
                      <SelectItem value="flacons">Flacons</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Gestion des stocks</h3>
            
            <FormField
              control={form.control}
              name="stockActuel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock actuel *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stockMinimum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock minimum *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">Seuil d'alerte de réapprovisionnement</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stockMaximum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock maximum *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="1"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">Capacité maximale de stockage</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prixUnitaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix unitaire (€) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fournisseur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom du fournisseur" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emplacementStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emplacement de stockage</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Hangar A - Section 1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="datePeremption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de péremption</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500">
                Optionnel - Utile pour aliments et médicaments
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {article ? "Modifier" : "Enregistrer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}