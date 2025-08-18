import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Plus, Minus, PiggyBank } from "lucide-react";

// Schéma de validation
const epargneSchema = z.object({
  type: z.enum(["versement", "restitution"]),
  montant: z.number().min(0.01, "Montant doit être positif"),
  motif: z.string().min(1, "Motif requis"),
  notes: z.string().optional(),
});

type EpargneFormData = z.infer<typeof epargneSchema>;

interface EpargneFormProps {
  employe: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EpargneForm({ employe, onSuccess, onCancel }: EpargneFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<EpargneFormData>({
    resolver: zodResolver(epargneSchema),
    defaultValues: {
      type: "versement",
      montant: 0,
      motif: "",
      notes: "",
    },
  });

  // Gérer la soumission du formulaire
  const mutation = useMutation({
    mutationFn: async (data: EpargneFormData) => {
      const endpoint = data.type === "versement" ? `/api/employes/${employe.id}/epargne/verser` : `/api/employes/${employe.id}/epargne/restituer`;
      return await apiRequest(endpoint, {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/employes/${employe.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/employes'] });
      toast({
        title: "Succès",
        description: `Opération d'épargne enregistrée avec succès`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer l'opération: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { isPending } = mutation;
  const type = form.watch("type");
  const montant = form.watch("montant");

  const onSubmit = (data: EpargneFormData) => {
    mutation.mutate(data);
  };

  const isRestitutionError = type === "restitution" && employe && montant > employe.soldeEpargne;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Employé et solde actuel */}
          {employe && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Employé :</span>
                <span className="font-semibold">{employe.prenom} {employe.nom}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">Solde actuel :</span>
                <Badge variant="secondary" className="text-base font-semibold">
                  {employe.soldeEpargne} CFA
                </Badge>
              </div>
            </div>
          )}

          {/* Type d'opération */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'opération</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="versement">
                        <Plus className="w-4 h-4 inline mr-2 text-green-500" />
                        Versement
                      </SelectItem>
                      <SelectItem value="restitution">
                        <Minus className="w-4 h-4 inline mr-2 text-red-500" />
                        Restitution
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Montant */}
          <FormField
            control={form.control}
            name="montant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (CFA)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Motif */}
          <FormField
            control={form.control}
            name="motif"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motif</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Versement mensuel, Achat de matériel..." disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Détails supplémentaires..." rows={2} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Alerte si restitution supérieure au solde */}
          {isRestitutionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ Le montant demandé est supérieur au solde disponible
              </p>
            </div>
          )}
        </div>

        {/* Conseils - Section à conserver si elle est utile */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            <PiggyBank className="w-4 h-4 inline mr-1" />
            Rappel épargne salariale
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Les versements sont déductibles d'impôts</li>
            <li>• Restitution possible à tout moment</li>
            <li>• Historique consultable à tout moment</li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending || isRestitutionError} className="flex-1">
            {isPending ? "Sauvegarde..." : type === "versement" ? "Effectuer le versement" : "Effectuer la restitution"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}