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

type MiseBasFormData = z.infer<typeof insertMiseBasSchema>;

interface MiseBasFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MiseBasForm({ onSuccess, onCancel }: MiseBasFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accouplements = [] } = useQuery({
    queryKey: ["/api/accouplements"],
  });

  const { data: lapins = [] } = useQuery({
    queryKey: ["/api/lapins"],
  });

  const form = useForm<MiseBasFormData>({
    resolver: zodResolver(insertMiseBasSchema),
    defaultValues: {
      accouplementId: "",
      dateMiseBas: new Date().toISOString().split('T')[0],
      nombreLapereaux: 1,
      nombreMortsNes: 0,
      nombreSurvivants24h: undefined,
      nombreSurvivants48h: undefined,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MiseBasFormData) => {
      const response = await fetch("/api/mises-bas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateMiseBas: new Date(data.dateMiseBas).toISOString(),
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'enregistrement");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mises-bas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accouplements"] });
      toast({
        title: "Succès",
        description: "Mise-bas enregistrée avec succès",
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

  const onSubmit = (data: MiseBasFormData) => {
    createMutation.mutate(data);
  };

  const isPending = createMutation.isPending;

  const getLapinName = (lapinId: string) => {
    const lapin = lapins.find((l: any) => l.id === lapinId);
    return lapin ? lapin.identifiant : lapinId;
  };

  // Filtrer les accouplements qui peuvent donner lieu à une mise-bas
  const availableAccouplements = accouplements.filter((acc: any) => {
    // Ne pas inclure les accouplements qui ont déjà une mise-bas ou qui ont échoué
    return acc.succes !== false;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection de l'accouplement */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Accouplement</h3>
            
            <FormField
              control={form.control}
              name="accouplementId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accouplement concerné *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un accouplement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAccouplements.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {getLapinName(acc.femelleId)} × {getLapinName(acc.maleId)} 
                          {acc.dateMiseBasPrevue && (
                            <span className="text-gray-500 ml-2">
                              (prévu: {new Date(acc.dateMiseBasPrevue).toLocaleDateString('fr-FR')})
                            </span>
                          )}
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
              name="dateMiseBas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de mise-bas *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date" 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nombres de lapereaux */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Résultats de la mise-bas</h3>
            
            <FormField
              control={form.control}
              name="nombreLapereaux"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre total de lapereaux *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      placeholder="Nombre total né"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombreMortsNes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de morts-nés</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Suivi de survie */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Suivi de survie (optionnel)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nombreSurvivants24h"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survivants après 24h</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      placeholder="Nombre de survivants"
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombreSurvivants48h"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survivants après 48h</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      placeholder="Nombre de survivants"
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      disabled={isPending}
                    />
                  </FormControl>
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