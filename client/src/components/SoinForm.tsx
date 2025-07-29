import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";

const soinSchema = z.object({
  lapinId: z.string().min(1, "Sélectionner un lapin"),
  titre: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  date: z.string().min(1, "Date requise"),
  gravite: z.enum(["légère", "modérée", "grave"]),
  traitement: z.string().optional(),
  veterinaire: z.string().optional(),
  cout: z.number().min(0).optional(),
  status: z.enum(["en_cours", "terminé", "suspendu"]),
  notes: z.string().optional(),
});

type SoinFormData = z.infer<typeof soinSchema>;

interface SoinFormProps {
  soin?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SoinForm({ soin, onSuccess, onCancel }: SoinFormProps) {
  const { data: lapins = [] } = useQuery({
    queryKey: ["/api/lapins"],
  });

  const form = useForm<SoinFormData>({
    resolver: zodResolver(soinSchema),
    defaultValues: {
      lapinId: soin?.lapinId || "",
      titre: soin?.titre || "",
      description: soin?.description || "",
      date: soin?.date || new Date().toISOString().split('T')[0],
      gravite: soin?.gravite || "légère",
      traitement: soin?.traitement || "",
      veterinaire: soin?.veterinaire || "",
      cout: soin?.cout || undefined,
      status: soin?.status || "en_cours",
      notes: soin?.notes || "",
    },
  });

  const onSubmit = (data: SoinFormData) => {
    console.log('Soin data:', data);
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations du soin</h3>
            
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
                  <FormLabel>Titre du soin *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Traitement diarrhée" />
                  </FormControl>
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
                      placeholder="Décrivez les symptômes et l'intervention"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Détails médicaux</h3>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date du soin *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gravite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gravité *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Évaluer la gravité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="légère">Légère</SelectItem>
                      <SelectItem value="modérée">Modérée</SelectItem>
                      <SelectItem value="grave">Grave</SelectItem>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut du traitement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="terminé">Terminé</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="traitement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traitement administré</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Smecta pendant 3 jours" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes complémentaires</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Observations, suivi à prévoir..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {soin ? "Modifier" : "Enregistrer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}