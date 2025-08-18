import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

// Définition du schéma Zod
const vaccinSchema = z.object({
  lapinId: z.string().min(1, "Sélectionner un lapin"),
  titre: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  date: z.string().min(1, "Date requise"),
  vaccin: z.string().min(1, "Nom du vaccin requis"),
  prochainRappel: z.string().optional(),
  veterinaire: z.string().optional(),
  cout: z.number().nonnegative("Le coût ne peut pas être négatif").optional(),
  status: z.enum(["prévu", "effectué", "reporté"]),
  notes: z.string().optional(),
});

type VaccinFormData = z.infer<typeof vaccinSchema>;

interface VaccinFormProps {
  vaccin?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

// Fonction asynchrone pour la requête API de récupération des lapins
const fetchLapins = async () => {
  const response = await fetch("/api/lapins");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des lapins");
  }
  return response.json();
};

// Fonction asynchrone pour la requête API de sauvegarde
const saveVaccin = async (data: VaccinFormData) => {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `/api/vaccins/${data.id}` : "/api/vaccins";
  
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la sauvegarde de la vaccination");
  }
  return response.json();
};

export default function VaccinForm({ vaccin, onSuccess, onCancel }: VaccinFormProps) {
  // Gestion de la requête de récupération des lapins
  const { data: lapins, isLoading: isLoadingLapins, isError: isErrorLapins } = useQuery({
    queryKey: ["/api/lapins"],
    queryFn: fetchLapins,
  });

  // Gestion de la mutation pour la sauvegarde
  const mutation = useMutation({
    mutationFn: saveVaccin,
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur de sauvegarde:", error.message);
      // Afficher un message d'erreur à l'utilisateur (par exemple, via un toast)
    },
  });

  const form = useForm<VaccinFormData>({
    resolver: zodResolver(vaccinSchema),
    defaultValues: {
      lapinId: vaccin?.lapinId || "",
      titre: vaccin?.titre || "",
      description: vaccin?.description || "",
      date: vaccin?.date || new Date().toISOString().split('T')[0],
      vaccin: vaccin?.vaccin || "",
      prochainRappel: vaccin?.prochainRappel ? new Date(vaccin.prochainRappel).toISOString().split('T')[0] : "",
      veterinaire: vaccin?.veterinaire || "",
      cout: vaccin?.cout || undefined,
      status: vaccin?.status || "effectué",
      notes: vaccin?.notes || "",
    },
  });

  const onSubmit = (data: VaccinFormData) => {
    mutation.mutate(data);
  };

  if (isLoadingLapins) {
    return <div className="text-center p-8">Chargement des lapins...</div>;
  }
  
  if (isErrorLapins) {
    return <div className="text-center p-8 text-red-500">Une erreur est survenue lors du chargement.</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de la vaccination</h3>
            
            <FormField
              control={form.control}
              name="lapinId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lapin concerné *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lapin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lapins.map((lapin: any) => (
                        <SelectItem key={lapin.id} value={lapin.id}>
                          {lapin.identifiant} - {lapin.race}
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
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la vaccination *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Vaccination RHD" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vaccin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du vaccin *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un vaccin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nobivac Myxo-RHD">Nobivac Myxo-RHD</SelectItem>
                      <SelectItem value="Lapinject RHD">Lapinject RHD</SelectItem>
                      <SelectItem value="Myxomatose">Vaccin Myxomatose</SelectItem>
                      <SelectItem value="RHD1">Vaccin RHD1</SelectItem>
                      <SelectItem value="RHD2">Vaccin RHD2</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Ex: Rappel annuel RHD + Myxomatose"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Planification</h3>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de vaccination *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="date"
                      onChange={(e) => {
                        field.onChange(e);
                        // Calculer automatiquement la date de rappel (1 an après)
                        if (e.target.value) {
                          const rappelDate = new Date(e.target.value);
                          rappelDate.setFullYear(rappelDate.getFullYear() + 1);
                          form.setValue("prochainRappel", rappelDate.toISOString().split('T')[0]);
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
              name="prochainRappel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prochain rappel</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Calculé automatiquement (1 an après vaccination)
                  </p>
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
                        <SelectValue placeholder="Statut de la vaccination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prévu">Prévu</SelectItem>
                      <SelectItem value="effectué">Effectué</SelectItem>
                      <SelectItem value="reporté">Reporté</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="veterinaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vétérinaire</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom du vétérinaire" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coût (€)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
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
              <FormLabel>Notes complémentaires</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Réactions, observations post-vaccination..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={mutation.isPending}>
            {mutation.isPending ? "Sauvegarde..." : (vaccin ? "Modifier" : "Enregistrer")}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}