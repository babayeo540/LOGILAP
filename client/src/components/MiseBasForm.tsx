import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertMiseBasSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Définition des types pour un code plus robuste
interface Lapin {
  id: string;
  identifiant: string;
}

interface Accouplement {
  id: string;
  dateAccouplement: string;
  mere: Lapin;
  pere: Lapin;
}

type MiseBasFormData = z.infer<typeof insertMiseBasSchema>;

interface MiseBasFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MiseBasForm({ onSuccess, onCancel }: MiseBasFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Utilisation de useQuery pour récupérer la liste des accouplements
  const { data: accouplements = [], isLoading: isLoadingAccouplements } = useQuery<Accouplement[]>({
    queryKey: ["/api/accouplements"],
  });

  // Utilisation de useQuery pour récupérer la liste des lapins (pour le poids moyen)
  const { data: lapins = [], isLoading: isLoadingLapins } = useQuery<Lapin[]>({
    queryKey: ["/api/lapins"],
  });

  const form = useForm<MiseBasFormData>({
    resolver: zodResolver(insertMiseBasSchema),
    defaultValues: {
      accouplementId: "",
      dateMiseBas: new Date().toISOString().split("T")[0],
      nombreNaisMort: 0,
      nombreNaisVivant: 0,
      notes: "",
      poidsMoyen: 0,
    },
  });

  const { isPending, mutate: createMiseBasMutation } = useMutation({
    mutationFn: async (data: MiseBasFormData) => {
      return await apiRequest("/api/mises-bas", {
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      // Invalider les requêtes pour mettre à jour les listes
      queryClient.invalidateQueries({ queryKey: ["/api/mises-bas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reproduction"] });
      onSuccess();
      toast({
        title: "Succès",
        description: "Mise-bas enregistrée avec succès.",
      });
    },
    onError: () => {
      // Afficher une erreur en cas d'échec de la mutation
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement de la mise-bas. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MiseBasFormData) => {
    createMiseBasMutation(data);
  };

  if (isLoadingAccouplements || isLoadingLapins) {
    return <div>Chargement des données...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Accouplement ID */}
        <FormField
          control={form.control}
          name="accouplementId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accouplement</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un accouplement" />
                  </SelectTrigger>
                  <SelectContent>
                    {accouplements.map((accouplement) => (
                      <SelectItem key={accouplement.id} value={accouplement.id}>
                        {`Accouplement du ${accouplement.dateAccouplement} : ${accouplement.mere.identifiant} & ${accouplement.pere.identifiant}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date de mise-bas */}
        <FormField
          control={form.control}
          name="dateMiseBas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de mise-bas</FormLabel>
              <FormControl>
                <Input {...field} type="date" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de naissances vivantes */}
          <FormField
            control={form.control}
            name="nombreNaisVivant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nés vivants</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Nombre de naissances vivantes"
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre de naissances mortes */}
          <FormField
            control={form.control}
            name="nombreNaisMort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nés morts</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Nombre de naissances mortes"
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isPending}
                  />
                </FormControl>
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observations sur la mise-bas, état de la mère..."
                  rows={3}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? "Enregistrement..." : "Enregistrer la mise-bas"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}