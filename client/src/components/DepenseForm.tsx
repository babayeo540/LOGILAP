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
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Schéma de validation pour une dépense, adapté pour la production
const depenseSchema = z.object({
  id: z.string().optional(),
  date: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Date invalide",
  }),
  montant: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  categorie: z.string().min(1, "Catégorie requise"),
  description: z.string().min(1, "Description requise"),
  fournisseurBeneficiaire: z
    .string()
    .min(1, "Fournisseur/Bénéficiaire requis"),
  facture: z.string().optional().or(z.literal("")),
  moyenPaiement: z.enum([
    "virement",
    "cheque",
    "especes",
    "carte",
    "prelevement",
  ]),
  notes: z.string().optional().or(z.literal("")),
});

type DepenseFormData = z.infer<typeof depenseSchema>;

// Définition des types pour les props du composant
interface DepenseFormProps {
  depense?: DepenseFormData | null;
  categories: { id: string; nom: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepenseForm({
  depense,
  categories,
  onSuccess,
  onCancel,
}: DepenseFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<DepenseFormData>({
    resolver: zodResolver(depenseSchema),
    defaultValues: {
      id: depense?.id || undefined,
      date: depense?.date
        ? format(new Date(depense.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      montant: depense?.montant || 0,
      categorie: depense?.categorie || "",
      description: depense?.description || "",
      fournisseurBeneficiaire: depense?.fournisseurBeneficiaire || "",
      facture: depense?.facture || "",
      moyenPaiement: depense?.moyenPaiement || "virement",
      notes: depense?.notes || "",
    },
  });

  const depenseMutation = useMutation({
    mutationFn: (data: DepenseFormData) => {
      const isEditing = !!data.id;
      const url = isEditing ? `/api/depenses/${data.id}` : "/api/depenses";
      const method = isEditing ? "PUT" : "POST";
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/depenses"] });
      onSuccess();
      toast({
        title: "Succès",
        description: `Dépense ${
          depense ? "modifiée" : "ajoutée"
        } avec succès.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'enregistrement de la dépense: ${
          error.message || "Une erreur inconnue est survenue."
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DepenseFormData) => {
    depenseMutation.mutate(data);
  };

  const isPending = depenseMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date, Montant et Catégorie */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isPending} />
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
                <FormLabel>Montant (XOF)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isPending}
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
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nom}>
                        {cat.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fournisseur/Bénéficiaire & Facture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fournisseurBeneficiaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur / Bénéficiaire</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nom du fournisseur ou bénéficiaire"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de facture</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Numéro de la facture (optionnel)"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description & Moyen de paiement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Description détaillée de la dépense"
                    rows={2}
                    disabled={isPending}
                  />
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
                <FormLabel>Moyen de paiement</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un moyen de paiement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="virement">Virement bancaire</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="carte">Carte bancaire</SelectItem>
                    <SelectItem value="prelevement">Prélèvement</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Informations supplémentaires"
                  rows={2}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending
              ? "Enregistrement..."
              : depense
              ? "Modifier la dépense"
              : "Enregistrer la dépense"}
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