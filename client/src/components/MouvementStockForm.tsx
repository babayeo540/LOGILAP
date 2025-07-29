import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { Plus, Minus } from "lucide-react";

const mouvementSchema = z.object({
  articleId: z.string().min(1, "Sélectionner un article"),
  type: z.enum(["entree", "sortie"]),
  quantite: z.number().min(0.01, "Quantité doit être positive"),
  motif: z.string().min(1, "Motif requis"),
  cout: z.number().min(0).optional(),
  responsable: z.string().optional(),
  notes: z.string().optional(),
});

type MouvementFormData = z.infer<typeof mouvementSchema>;

interface MouvementStockFormProps {
  articleSelectionne?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MouvementStockForm({ articleSelectionne, onSuccess, onCancel }: MouvementStockFormProps) {
  // Mock data pour les articles - remplacer par vraie API
  const mockArticles = [
    {
      id: "1",
      nom: "Granulés lapins croissance",
      categorie: "alimentation",
      stockActuel: 45,
      unite: "kg",
      prixUnitaire: 1.85
    },
    {
      id: "2",
      nom: "Paille de blé",
      categorie: "litiere",
      stockActuel: 8,
      unite: "bottes",
      prixUnitaire: 3.50
    },
    {
      id: "3",
      nom: "Antibiotique large spectre",
      categorie: "medicament",
      stockActuel: 2,
      unite: "flacons",
      prixUnitaire: 12.80
    }
  ];

  const form = useForm<MouvementFormData>({
    resolver: zodResolver(mouvementSchema),
    defaultValues: {
      articleId: articleSelectionne?.id || "",
      type: "entree",
      quantite: 0,
      motif: "",
      cout: undefined,
      responsable: "",
      notes: "",
    },
  });

  const articleId = form.watch("articleId");
  const type = form.watch("type");
  const quantite = form.watch("quantite");

  const articleSelectionneForm = mockArticles.find(a => a.id === articleId);

  const onSubmit = (data: MouvementFormData) => {
    console.log('Mouvement data:', data);
    
    // Validation pour sortie de stock
    if (data.type === "sortie" && articleSelectionneForm) {
      if (data.quantite > articleSelectionneForm.stockActuel) {
        form.setError("quantite", {
          message: `Stock insuffisant (disponible: ${articleSelectionneForm.stockActuel} ${articleSelectionneForm.unite})`
        });
        return;
      }
    }
    
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  const motifsPredefinisEntree = [
    "Livraison fournisseur",
    "Retour de stock",
    "Correction inventaire",
    "Don/cadeau",
    "Production interne"
  ];

  const motifsPredefinsisSortie = [
    "Consommation quotidienne",
    "Traitement vétérinaire",
    "Perte/casse",
    "Péremption",
    "Vente",
    "Correction inventaire"
  ];

  const motifsDisponibles = type === "entree" ? motifsPredefinisEntree : motifsPredefinsisSortie;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Type de mouvement */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant={type === "entree" ? "default" : "outline"}
            onClick={() => form.setValue("type", "entree")}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Entrée de stock
          </Button>
          <Button
            type="button"
            variant={type === "sortie" ? "default" : "outline"}
            onClick={() => form.setValue("type", "sortie")}
            className="flex-1"
          >
            <Minus className="w-4 h-4 mr-2" />
            Sortie de stock
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Article et quantité</h3>
            
            <FormField
              control={form.control}
              name="articleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article concerné *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un article" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockArticles.map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          {article.nom} ({article.stockActuel} {article.unite})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {articleSelectionneForm && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock actuel:</span>
                      <span className="font-medium">
                        {articleSelectionneForm.stockActuel} {articleSelectionneForm.unite}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Prix unitaire:</span>
                      <span className="font-medium">
                        {articleSelectionneForm.prixUnitaire.toFixed(2)} €
                      </span>
                    </div>
                    <Badge className="w-fit">
                      {articleSelectionneForm.categorie}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="quantite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantité * {articleSelectionneForm && `(${articleSelectionneForm.unite})`}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0.01"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calcul automatique du coût pour les entrées */}
            {type === "entree" && articleSelectionneForm && quantite > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Coût estimé: {(quantite * articleSelectionneForm.prixUnitaire).toFixed(2)} €
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Détails du mouvement</h3>
            
            <FormField
              control={form.control}
              name="motif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un motif" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motifsDisponibles.map((motif) => (
                        <SelectItem key={motif} value={motif}>
                          {motif}
                        </SelectItem>
                      ))}
                      <SelectItem value="autre">Autre (préciser dans les notes)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === "entree" ? "Coût d'achat (€)" : "Valeur de la sortie (€)"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    {type === "entree" ? "Prix payé pour cette quantité" : "Valeur comptable de la sortie"}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="responsable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom de la personne responsable" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes complémentaires</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Détails supplémentaires sur ce mouvement..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Récapitulatif */}
        {articleSelectionneForm && quantite > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Récapitulatif du mouvement</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Article:</span> {articleSelectionneForm.nom}
                </p>
                <p>
                  <span className="text-gray-600">Type:</span> 
                  <Badge className={`ml-2 ${type === "entree" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {type === "entree" ? "Entrée" : "Sortie"}
                  </Badge>
                </p>
                <p>
                  <span className="text-gray-600">Quantité:</span> 
                  <span className="font-medium ml-2">
                    {type === "sortie" ? "-" : "+"}{quantite} {articleSelectionneForm.unite}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Nouveau stock:</span> 
                  <span className="font-medium ml-2">
                    {type === "entree" 
                      ? articleSelectionneForm.stockActuel + quantite
                      : articleSelectionneForm.stockActuel - quantite
                    } {articleSelectionneForm.unite}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Enregistrer le mouvement
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}