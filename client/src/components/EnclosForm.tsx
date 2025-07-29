import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertEnclosSchema } from "@shared/schema";
import { z } from "zod";

type EnclosFormData = z.infer<typeof insertEnclosSchema>;

interface EnclosFormProps {
  enclos?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EnclosForm({ enclos, onSuccess, onCancel }: EnclosFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<EnclosFormData>({
    resolver: zodResolver(insertEnclosSchema),
    defaultValues: {
      nom: enclos?.nom || "",
      type: enclos?.type || "engraissement",
      capaciteMax: enclos?.capaciteMax || 1,
      status: enclos?.status || "vide",
      notes: enclos?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EnclosFormData) => {
      const response = await fetch("/api/enclos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enclos"] });
      toast({
        title: "Succès",
        description: "Enclos créé avec succès",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EnclosFormData) => {
      const response = await fetch(`/api/enclos/${enclos.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la modification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enclos"] });
      toast({
        title: "Succès",
        description: "Enclos modifié avec succès",
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

  const onSubmit = (data: EnclosFormData) => {
    if (enclos) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
            
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'enclos *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Enclos A1" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'enclos *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="maternite">Maternité</SelectItem>
                      <SelectItem value="engraissement">Engraissement</SelectItem>
                      <SelectItem value="quarantaine">Quarantaine</SelectItem>
                      <SelectItem value="reproducteur_male">Reproducteur mâle</SelectItem>
                      <SelectItem value="reproducteur_femelle">Reproducteur femelle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capaciteMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacité maximale *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="1"
                      placeholder="Nombre de lapins"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* État et statut */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">État et statut</h3>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vide">Vide</SelectItem>
                      <SelectItem value="occupe">Occupé</SelectItem>
                      <SelectItem value="a_nettoyer">À nettoyer</SelectItem>
                      <SelectItem value="en_maintenance">En maintenance</SelectItem>
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
                  placeholder="Observations, équipements spéciaux..."
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
            {isPending ? "Sauvegarde..." : enclos ? "Modifier" : "Créer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}