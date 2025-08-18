import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertLapinSchema, Enclos } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Interfaces pour un typage fort
interface Lapin {
  id?: string;
  identifiant: string;
  sexe: "male" | "femelle";
  race: string;
  dateNaissance: string;
  poids: number;
  statut:
    | "reproduction"
    | "engraissement"
    | "malade"
    | "gestation"
    | "laiton";
  enclosId: string;
  notes?: string;
  pereId?: string;
  mereId?: string;
}

type LapinFormData = z.infer<typeof insertLapinSchema>;

interface LapinFormProps {
  lapin?: Lapin;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LapinForm({ lapin, onSuccess, onCancel }: LapinFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: enclos = [] } = useQuery<Enclos[]>({
    queryKey: ["/api/enclos"],
  });

  const form = useForm<LapinFormData>({
    resolver: zodResolver(insertLapinSchema),
    defaultValues: {
      identifiant: lapin?.identifiant || "",
      race: lapin?.race || "",
      sexe: lapin?.sexe || "",
      dateNaissance: lapin?.dateNaissance || "",
      poids: lapin?.poids || 0,
      statut: lapin?.statut || "engraissement",
      enclosId: lapin?.enclosId || "",
      pereId: lapin?.pereId || "",
      mereId: lapin?.mereId || "",
      notes: lapin?.notes || "",
    },
  });

  // Utilisation d'une seule mutation pour la création et la mise à jour
  const mutation = useMutation({
    mutationFn: async (data: LapinFormData) => {
      if (lapin?.id) {
        return await apiRequest(`/api/lapins/${lapin.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        return await apiRequest('/api/lapins', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
      toast({
        title: "Succès",
        description: `Lapin ${lapin?.id ? "modifié" : "ajouté"} avec succès.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le lapin : ${error.message || "Erreur inconnue"}`,
        variant: "destructive",
      });
    },
  });

  const { isPending } = mutation;

  const onSubmit = (data: LapinFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Identifiant, Race, Sexe, Date de Naissance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="identifiant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifiant</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: L-123" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="race"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Géant des Flandres" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sexe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexe</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le sexe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Mâle</SelectItem>
                    <SelectItem value="femelle">Femelle</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateNaissance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de Naissance</FormLabel>
                <FormControl>
                  <Input {...field} type="date" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Poids, Statut, Enclos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="poids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poids (kg)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
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
            name="statut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reproduction">Reproduction</SelectItem>
                    <SelectItem value="engraissement">Engraissement</SelectItem>
                    <SelectItem value="malade">Malade</SelectItem>
                    <SelectItem value="gestation">Gestation</SelectItem>
                    <SelectItem value="laiton">Laiton</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enclosId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enclos</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'enclos" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {enclos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parent IDs (for new rabbits only) */}
        {!lapin?.id && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pereId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Père</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ID du père" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mereId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mère</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ID de la mère" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

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
                  placeholder="Observations, particularités..."
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
            {isPending ? "Sauvegarde..." : lapin ? "Modifier" : "Créer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}