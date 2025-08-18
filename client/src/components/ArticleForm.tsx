import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Définition de l'interface et du schéma de validation
interface Article {
  id: string;
  nom: string;
  categorie: "alimentation" | "medicament" | "equipement" | "litiere";
  description: string;
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  unite: string;
  prixUnitaire: number;
  fournisseur?: string;
  datePeremption?: string;
  emplacementStock?: string;
}

const articleSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  categorie: z.enum([
    "alimentation",
    "medicament",
    "equipement",
    "litiere",
  ]),
  description: z.string().min(1, "Description requise"),
  stockActuel: z.coerce.number().min(0, "Le stock actuel doit être positif"),
  stockMinimum: z.coerce.number().min(0, "Le stock minimum doit être positif"),
  stockMaximum: z.coerce.number().min(1, "Le stock maximum doit être positif"),
  unite: z.string().min(1, "Unité requise"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire doit être positif"),
  fournisseur: z.string().optional(),
  datePeremption: z.string().optional(),
  emplacementStock: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ArticleForm({
  article,
  onSuccess,
  onCancel,
}: ArticleFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      nom: article?.nom || "",
      categorie: article?.categorie || "alimentation",
      description: article?.description || "",
      stockActuel: article?.stockActuel ?? 0,
      stockMinimum: article?.stockMinimum ?? 0,
      stockMaximum: article?.stockMaximum ?? 1,
      unite: article?.unite || "",
      prixUnitaire: article?.prixUnitaire ?? 0,
      fournisseur: article?.fournisseur || "",
      datePeremption: article?.datePeremption || "",
      emplacementStock: article?.emplacementStock || "",
    },
  });

  const articleMutation = useMutation({
    mutationFn: (data: ArticleFormData) => {
      if (article?.id) {
        return apiRequest(`/api/stocks/articles/${article.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        return apiRequest("/api/stocks/articles", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/stocks/articles"],
      });
      onSuccess();
      toast({
        title: "Succès",
        description: `Article ${
          article ? "modifié" : "enregistré"
        } avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de l'opération : ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    articleMutation.mutate(data);
  };

  const isPending = articleMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom et Catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'article</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
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
                <FormLabel>Catégorie</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alimentation">Alimentation</SelectItem>
                    <SelectItem value="medicament">Médicament</SelectItem>
                    <SelectItem value="equipement">Équipement</SelectItem>
                    <SelectItem value="litiere">Litière</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stocks et Unité */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="stockActuel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock actuel</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
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
                <FormLabel>Stock min.</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stockMaximum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock max.</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
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
                <FormLabel>Unité</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: kg, L, pièce" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Prix, Fournisseur et Emplacement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="prixUnitaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix unitaire</FormLabel>
                <FormControl>
                  <Input type="number" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fournisseur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
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
                <FormLabel>Emplacement</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date de péremption */}
        <FormField
          control={form.control}
          name="datePeremption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de péremption</FormLabel>
              <FormControl>
                <Input {...field} type="date" disabled={isPending} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500">
                Optionnel - Utile pour aliments et médicaments
              </p>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending
              ? "Sauvegarde..."
              : article
              ? "Modifier"
              : "Enregistrer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}