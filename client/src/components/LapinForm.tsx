import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertLapinSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

type LapinFormData = z.infer<typeof insertLapinSchema>;

interface LapinFormProps {
  lapin?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LapinForm({ lapin, onSuccess, onCancel }: LapinFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: enclos = [] } = useQuery({
    queryKey: ["/api/enclos"],
  });

  const form = useForm<LapinFormData>({
    resolver: zodResolver(insertLapinSchema),
    defaultValues: {
      identifiant: lapin?.identifiant || "",
      race: lapin?.race || "",
      sexe: lapin?.sexe || "femelle",
      dateNaissance: lapin?.dateNaissance || "",
      couleur: lapin?.couleur || "",
      status: lapin?.status || "engraissement",
      healthStatus: lapin?.healthStatus || "sain",
      enclosId: lapin?.enclosId || "",
      pereId: lapin?.pereId || "",
      mereId: lapin?.mereId || "",
      notes: lapin?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LapinFormData) => {
      const response = await fetch("/api/lapins", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
      toast({
        title: "Succès",
        description: "Lapin créé avec succès",
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
    mutationFn: async (data: LapinFormData) => {
      const response = await fetch(`/api/lapins/${lapin.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/lapins"] });
      toast({
        title: "Succès",
        description: "Lapin modifié avec succès",
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

  const onSubmit = (data: LapinFormData) => {
    if (lapin) {
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
              name="identifiant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifiant *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="L2024-001" disabled={isPending} />
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
                  <FormLabel>Race *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Fauve de Bourgogne" disabled={isPending} />
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
                  <FormLabel>Sexe *</FormLabel>
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
              name="couleur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Fauve, Blanc, Gris" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dates et poids */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dates et poids</h3>
            
            <FormField
              control={form.control}
              name="dateNaissance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance *</FormLabel>
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

            <FormField
              control={form.control}
              name="healthStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>État de santé *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'état" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sain">Sain</SelectItem>
                      <SelectItem value="malade">Malade</SelectItem>
                      <SelectItem value="en_quarantaine">En quarantaine</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="reproducteur">Reproducteur</SelectItem>
                      <SelectItem value="engraissement">Engraissement</SelectItem>
                      <SelectItem value="stock_a_vendre">Stock à vendre</SelectItem>
                      <SelectItem value="vendu">Vendu</SelectItem>
                      <SelectItem value="decede">Décédé</SelectItem>
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
                        <SelectValue placeholder="Sélectionner un enclos" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucun enclos</SelectItem>
                      {enclos.map((e: any) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nom} ({e.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Généalogie */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Généalogie</h3>
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