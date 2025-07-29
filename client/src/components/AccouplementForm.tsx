import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertAccouplementSchema } from "@shared/schema";
import { z } from "zod";

type AccouplementFormData = z.infer<typeof insertAccouplementSchema>;

interface AccouplementFormProps {
  accouplement?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccouplementForm({ accouplement, onSuccess, onCancel }: AccouplementFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lapins = [] } = useQuery({
    queryKey: ["/api/lapins"],
  });

  // Calculer la date de mise bas prévue (31 jours après l'accouplement)
  const calculateExpectedBirthDate = (matingDate: string) => {
    const date = new Date(matingDate);
    date.setDate(date.getDate() + 31);
    return date.toISOString().split('T')[0];
  };

  const form = useForm<AccouplementFormData>({
    resolver: zodResolver(insertAccouplementSchema),
    defaultValues: {
      femelleId: accouplement?.femelleId || "",
      maleId: accouplement?.maleId || "",
      dateAccouplement: accouplement?.dateAccouplement 
        ? new Date(accouplement.dateAccouplement).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      dateMiseBasPrevue: accouplement?.dateMiseBasPrevue 
        ? new Date(accouplement.dateMiseBasPrevue).toISOString().split('T')[0]
        : calculateExpectedBirthDate(new Date().toISOString()),
      succes: accouplement?.succes || undefined,
      notes: accouplement?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AccouplementFormData) => {
      const response = await fetch("/api/accouplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateAccouplement: new Date(data.dateAccouplement).toISOString(),
          dateMiseBasPrevue: data.dateMiseBasPrevue ? new Date(data.dateMiseBasPrevue).toISOString() : null,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accouplements"] });
      toast({
        title: "Succès",
        description: "Accouplement enregistré avec succès",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AccouplementFormData) => {
      const response = await fetch(`/api/accouplements/${accouplement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateAccouplement: new Date(data.dateAccouplement).toISOString(),
          dateMiseBasPrevue: data.dateMiseBasPrevue ? new Date(data.dateMiseBasPrevue).toISOString() : null,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la modification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accouplements"] });
      toast({
        title: "Succès",
        description: "Accouplement modifié avec succès",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccouplementFormData) => {
    if (accouplement) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Filtrer les lapins par sexe
  const femelles = lapins.filter((l: any) => l.sexe === "femelle" && l.status === "reproducteur");
  const males = lapins.filter((l: any) => l.sexe === "male" && l.status === "reproducteur");

  // Observer le changement de date d'accouplement pour calculer automatiquement la date prévue
  const matingDate = form.watch("dateAccouplement");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection des lapins */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Partenaires</h3>
            
            <FormField
              control={form.control}
              name="femelleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Femelle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une femelle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {femelles.map((femelle: any) => (
                        <SelectItem key={femelle.id} value={femelle.id}>
                          {femelle.identifiant} - {femelle.race}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mâle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un mâle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {males.map((male: any) => (
                        <SelectItem key={male.id} value={male.id}>
                          {male.identifiant} - {male.race}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dates et résultat */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dates et résultat</h3>
            
            <FormField
              control={form.control}
              name="dateAccouplement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'accouplement *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date" 
                      disabled={isPending}
                      onChange={(e) => {
                        field.onChange(e);
                        // Calculer automatiquement la date de mise bas prévue
                        if (e.target.value) {
                          const expectedDate = calculateExpectedBirthDate(e.target.value);
                          form.setValue("dateMiseBasPrevue", expectedDate);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateMiseBasPrevue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de mise-bas prévue</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date" 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Gestation normale: 31 jours (calculé automatiquement)
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="succes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résultat de l'accouplement</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "null" ? null : value === "true")} 
                    defaultValue={field.value === null ? "null" : field.value === true ? "true" : "false"}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="En attente du résultat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">En attente</SelectItem>
                      <SelectItem value="true">Réussi (gestation confirmée)</SelectItem>
                      <SelectItem value="false">Échec (pas de gestation)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            {isPending ? "Sauvegarde..." : accouplement ? "Modifier" : "Enregistrer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}