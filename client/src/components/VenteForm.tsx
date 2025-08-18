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
import { z } from "zod";
import { useState } from "react";

// Le schéma Zod est amélioré pour une validation plus robuste.
const venteSchema = z.object({
  description: z.string().min(1, "La description est requise."),
  // Le champ montant gère désormais l'input string et le transforme en nombre.
  montant: z.string().transform((val, ctx) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le montant doit être un nombre positif.",
      });
      return z.NEVER;
    }
    return parsed;
  }),
  date: z.string().min(1, "La date est requise."),
  // Ajout d'un message d'erreur personnalisé pour l'enum.
  status: z.enum(["payé", "en_attente", "annulé"], {
    errorMap: () => ({ message: "Le statut est invalide." }),
  }),
  // Les champs optionnels peuvent être indéfinis ou des chaînes vides.
  client: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type VenteFormData = z.infer<typeof venteSchema>;

interface VenteFormProps {
  vente?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VenteForm({ vente, onSuccess, onCancel }: VenteFormProps) {
  // Ajout de l'état de soumission pour désactiver les boutons.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VenteFormData>({
    resolver: zodResolver(venteSchema),
    defaultValues: {
      description: vente?.description || "",
      // Le montant est maintenant une chaîne par défaut pour correspondre au schéma.
      montant: vente?.montant ? String(vente.montant) : "0", 
      date: vente?.date || new Date().toISOString().split('T')[0],
      status: vente?.status || "en_attente",
      client: vente?.client || "",
      notes: vente?.notes || "",
    },
  });

  const onSubmit = async (data: VenteFormData) => {
    setIsSubmitting(true);
    try {
      // Remplacez cette simulation par votre appel d'API de production réel
      // Exemple :
      // const response = await fetch('/api/ventes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Erreur de l'API');
      // }

      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      // Gérer l'erreur en affichant un message à l'utilisateur
      form.setError("root.serverError", {
        type: "400",
        message: "Une erreur est survenue lors de l'enregistrement."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de la vente</h3>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Vente de 3 lapins" />
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
                      step="0.01"
                      min="0"
                      placeholder="15.00"
                      // Le `onChange` est retiré car la transformation est gérée par Zod
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom du client" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Détails</h3>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de vente *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="payé">Payé</SelectItem>
                      <SelectItem value="annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
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
        
        {/* Affichage des erreurs globales de l'API */}
        {form.formState.errors.root?.serverError && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.root.serverError.message}
          </p>
        )}

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "En cours..." : vente ? "Modifier" : "Enregistrer"}
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
  );
}