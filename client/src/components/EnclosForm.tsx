import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";

const enclosSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, "Nom requis"),
  type: z.enum(["engraissement", "reproduction", "quarantaine"]),
  capaciteMax: z.number().int().min(1, "Capacité doit être au moins de 1"),
  status: z.enum(["vide", "occupe", "a_nettoyer", "en_maintenance"]),
  notes: z.string().optional(),
});

type EnclosFormData = z.infer<typeof enclosSchema>;

interface EnclosFormProps {
  enclos?: EnclosFormData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EnclosForm({ enclos, onSuccess, onCancel }: EnclosFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<EnclosFormData>({
    resolver: zodResolver(enclosSchema),
    defaultValues: {
      id: enclos?.id || undefined,
      nom: enclos?.nom || "",
      type: enclos?.type || "engraissement",
      capaciteMax: enclos?.capaciteMax || 1,
      status: enclos?.status || "vide",
      notes: enclos?.notes || "",
    },
  });

  const enclosMutation = useMutation({
    mutationFn: (data: EnclosFormData) => {
      const isEditing = !!data.id;
      const url = isEditing ? `/api/enclos/${data.id}` : "/api/enclos";
      const method = isEditing ? "PUT" : "POST";
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enclos"] });
      onSuccess();
      toast({
        title: "Succès",
        description: `Enclos ${enclos ? "modifié" : "ajouté"} avec succès.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'enregistrement de l'enclos: ${
          error.message || "Une erreur inconnue est survenue."
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnclosFormData) => {
    enclosMutation.mutate(data);
  };

  const isPending = enclosMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom & Capacité */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'enclos</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Enclos A1" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capaciteMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacité maximale</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    min={1}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Type & Statut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'enclos</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="engraissement">Engraissement</SelectItem>
                    <SelectItem value="reproduction">Reproduction</SelectItem>
                    <SelectItem value="quarantaine">Quarantaine</SelectItem>
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
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
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
            {isPending
              ? "Sauvegarde..."
              : enclos
              ? "Modifier l'enclos"
              : "Créer l'enclos"}
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