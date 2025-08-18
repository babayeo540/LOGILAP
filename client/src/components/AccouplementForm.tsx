import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import {
  Accouplement,
  Lapin,
} from "@/types/data";
import { format } from "date-fns";

// Schéma de validation Zod
const accouplementSchema = z.object({
  maleId: z.string().min(1, "Veuillez sélectionner un mâle"),
  femelleId: z.string().min(1, "Veuillez sélectionner une femelle"),
  date: z.string().min(1, "Veuillez entrer une date d'accouplement"),
  resultat: z.string().optional(),
  notes: z.string().optional(),
});

type AccouplementFormData = z.infer<typeof accouplementSchema>;

interface AccouplementFormProps {
  accouplement?: Accouplement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccouplementForm({
  accouplement,
  onSuccess,
  onCancel,
}: AccouplementFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<AccouplementFormData>({
    resolver: zodResolver(accouplementSchema),
    defaultValues: {
      maleId: accouplement?.maleId || "",
      femelleId: accouplement?.femelleId || "",
      date: accouplement?.date ? format(new Date(accouplement.date), "yyyy-MM-dd") : "",
      resultat: accouplement?.resultat || "en_attente",
      notes: accouplement?.notes || "",
    },
  });

  const { data: lapins = [], isLoading: isLapinsLoading } = useQuery<Lapin[]>({
    queryKey: ["/api/lapins"],
    queryFn: async () => apiRequest("/api/lapins"),
  });

  const accouplementMutation = useMutation({
    mutationFn: (data: AccouplementFormData) => {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
      };
      if (accouplement?.id) {
        return apiRequest(`/api/reproduction/accouplements/${accouplement.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        return apiRequest("/api/reproduction/accouplements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/reproduction/accouplements"],
      });
      onSuccess();
      toast({
        title: "Succès",
        description: `Accouplement ${accouplement ? "modifié" : "enregistré"} avec succès.`,
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

  const onSubmit = (data: AccouplementFormData) => {
    accouplementMutation.mutate(data);
  };

  const males = lapins.filter((lapin) => lapin.sexe === "male" && lapin.statut === "reproduction");
  const femelles = lapins.filter((lapin) => lapin.sexe === "femelle" && lapin.statut === "reproduction");
  const isPending = accouplementMutation.isPending || isLapinsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Lapin Mâle */}
        <FormField
          control={form.control}
          name="maleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lapin Mâle</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un mâle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {males.map((lapin) => (
                    <SelectItem key={lapin.id} value={lapin.id}>
                      {lapin.identifiant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lapin Femelle */}
        <FormField
          control={form.control}
          name="femelleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lapin Femelle</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une femelle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {femelles.map((lapin) => (
                    <SelectItem key={lapin.id} value={lapin.id}>
                      {lapin.identifiant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date d'accouplement */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'accouplement</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Résultat */}
          <FormField
            control={form.control}
            name="resultat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Résultat</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un résultat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="reussi">
                      Réussi (gestation confirmée)
                    </SelectItem>
                    <SelectItem value="echec">Échec (pas de gestation)</SelectItem>
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Observations, conditions particulières..."
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
            {isPending
              ? "Sauvegarde..."
              : accouplement
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