import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Schéma de validation Zod pour le formulaire de compte
const compteSchema = z.object({
  nom: z.string().min(1, "Veuillez donner un nom au compte"),
  type: z.enum(["banque", "caisse", "epargne"]),
  numero: z.string().optional(),
  banque: z.string().optional(),
  soldeInitial: z.coerce.number().min(0, "Le solde initial doit être positif"),
});

// Définition de l'interface pour un compte, basée sur le schéma Zod
type CompteFormData = z.infer<typeof compteSchema>;

interface CompteFormProps {
  compte?: CompteFormData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CompteForm({
  compte,
  onSuccess,
  onCancel,
}: CompteFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<CompteFormData>({
    resolver: zodResolver(compteSchema),
    defaultValues: {
      nom: compte?.nom || "",
      type: compte?.type || "caisse",
      numero: compte?.numero || "",
      banque: compte?.banque || "",
      soldeInitial: compte?.soldeInitial ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CompteFormData) => {
      if (compte) {
        // Logique de modification
        return apiRequest(`/api/comptes/${compte.nom}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        // Logique de création
        return apiRequest("/api/comptes", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comptes"] });
      onSuccess();
      toast({
        title: "Succès",
        description: `Compte ${compte ? "modifié" : "créé"} avec succès.`,
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

  const onSubmit = (data: CompteFormData) => {
    mutation.mutate(data);
  };

  const isPending = mutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom du compte */}
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du compte</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Compte principal"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type de compte */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de compte</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type de compte" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="caisse">Caisse</SelectItem>
                  <SelectItem value="banque">Compte bancaire</SelectItem>
                  <SelectItem value="epargne">Compte épargne</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Numéro de compte (conditionnel) */}
        {form.watch("type") === "banque" && (
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de compte</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: FR76 1234 5678 9012 3456 78"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Banque (conditionnel) */}
        {form.watch("type") === "banque" && (
          <FormField
            control={form.control}
            name="banque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banque</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Crédit Agricole"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Solde initial */}
        <FormField
          control={form.control}
          name="soldeInitial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solde initial (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
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
              ? "Sauvegarde..."
              : compte
              ? "Modifier"
              : "Créer le compte"}
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