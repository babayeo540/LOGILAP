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
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const employeSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  role: z.enum(["administrateur", "gestionnaire", "soigneur"]),
  dateEmbauche: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Date d'embauche invalide",
  }),
  telephone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  adresse: z.string().min(1, "Adresse requise"),
  salaire: z.number().min(0, "Salaire doit être positif"),
  statut: z.enum(["actif", "inactif", "conge"]),
  qualifications: z.array(z.string()).optional(),
});

type EmployeFormData = z.infer<typeof employeSchema>;

interface EmployeFormProps {
  employe?: EmployeFormData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeForm({
  employe,
  onSuccess,
  onCancel,
}: EmployeFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      id: employe?.id || undefined,
      nom: employe?.nom || "",
      prenom: employe?.prenom || "",
      role: employe?.role || "soigneur",
      dateEmbauche: employe?.dateEmbauche || new Date().toISOString().split("T")[0],
      telephone: employe?.telephone || "",
      email: employe?.email || "",
      adresse: employe?.adresse || "",
      salaire: employe?.salaire || 0,
      statut: employe?.statut || "actif",
      qualifications: employe?.qualifications || [],
    },
  });

  const employeMutation = useMutation({
    mutationFn: (data: EmployeFormData) => {
      const isEditing = !!data.id;
      const url = isEditing ? `/api/employes/${data.id}` : "/api/employes";
      const method = isEditing ? "PUT" : "POST";
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      onSuccess();
      toast({
        title: "Succès",
        description: `Employé ${
          employe ? "modifié" : "ajouté"
        } avec succès.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'enregistrement de l'employé: ${
          error.message || "Une erreur inconnue est survenue."
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeFormData) => {
    employeMutation.mutate(data);
  };

  const isPending = employeMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nom de famille" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom(s)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Prénom(s)" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rôle & Date d'embauche */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="administrateur">Administrateur</SelectItem>
                    <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                    <SelectItem value="soigneur">Soigneur</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateEmbauche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'embauche</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Téléphone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Numéro de téléphone" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="Adresse email" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresse */}
        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Adresse complète de l'employé" rows={2} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Salaire & Statut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salaire (XOF)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
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
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="conge">En congé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Qualifications (exemple de gestion de tags) */}
        <FormField
          control={form.control}
          name="qualifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualifications</FormLabel>
              <div className="flex flex-wrap gap-2">
                {field.value?.map((qual, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {qual}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        field.onChange(field.value?.filter((_, i) => i !== index))
                      }
                      className="h-auto w-auto p-1"
                      disabled={isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <FormControl>
                <Input
                  placeholder="Ajouter une qualification (ex: Soins, Reproduction)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                      e.preventDefault();
                      const newQual = e.currentTarget.value.trim();
                      if (!field.value?.includes(newQual)) {
                        field.onChange([...(field.value || []), newQual]);
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500">
                Tapez une qualification et appuyez sur Entrée
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending
              ? "Enregistrement..."
              : employe
              ? "Modifier l'employé"
              : "Enregistrer l'employé"}
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