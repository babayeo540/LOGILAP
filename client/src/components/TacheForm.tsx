import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useEffect } from "react";

// Schéma de validation Zod
const tacheSchema = z.object({
  titre: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  dateLimite: z.string().min(1, "Date limite requise"),
  priorite: z.enum(["basse", "normale", "haute"]),
  assigneA: z.array(z.string()).min(1, "Au moins un employé doit être assigné"),
  notes: z.string().optional(),
});

type TacheFormData = z.infer<typeof tacheSchema>;

interface TacheFormProps {
  tache?: any; // Pour l'édition d'une tâche existante
  employePreselectionne?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

// Fonctions d'appel API
const fetchEmployes = async () => {
  const response = await fetch("/api/employes");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des employés");
  }
  return response.json();
};

const saveTache = async (data: TacheFormData) => {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `/api/taches/${data.id}` : "/api/taches";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la sauvegarde de la tâche");
  }
  return response.json();
};

// Fonctions utilitaires
const tachesPredefinies = [
  "Nettoyage enclos maternité",
  "Nettoyage enclos engraissement",
  "Distribution aliments",
  "Contrôle santé lapins",
  "Vaccination",
  "Pesée lapins",
  "Maintenance équipements",
  "Inventaire stocks",
  "Préparation cages",
  "Désinfection locaux",
  "Contrôle température",
  "Suivi reproduction"
];

const getRoleLabel = (role: string) => {
  switch (role) {
    case "administrateur": return "Admin";
    case "gestionnaire": return "Gestionnaire";
    case "soigneur": return "Soigneur";
    default: return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "administrateur": return "bg-purple-100 text-purple-800";
    case "gestionnaire": return "bg-blue-100 text-blue-800";
    case "soigneur": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function TacheForm({ tache, employePreselectionne, onSuccess, onCancel }: TacheFormProps) {
  // Récupération des employés via API
  const { data: employes, isLoading: isLoadingEmployes, isError: isErrorEmployes } = useQuery({
    queryKey: ["/api/employes"],
    queryFn: fetchEmployes,
  });

  const form = useForm<TacheFormData>({
    resolver: zodResolver(tacheSchema),
    defaultValues: {
      titre: tache?.titre || "",
      description: tache?.description || "",
      dateLimite: tache?.dateLimite || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priorite: tache?.priorite || "normale",
      assigneA: tache?.assigneA || (employePreselectionne ? [employePreselectionne.id] : []),
      notes: tache?.notes || "",
    },
  });

  // Utilisation de useMutation pour la création/mise à jour
  const mutation = useMutation({
    mutationFn: saveTache,
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur de sauvegarde:", error.message);
      // Gérer l'affichage de l'erreur, par exemple avec un toast
    },
  });

  const onSubmit = (data: TacheFormData) => {
    mutation.mutate(data);
  };
  
  // Correction pour le champ titre: si "autre" est sélectionné, on le réinitialise lors du changement
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "titre" && value.titre !== "autre" && form.getValues("titre") === "autre") {
        form.setValue("titre", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  if (isLoadingEmployes) {
    return <div className="text-center p-8">Chargement des employés...</div>;
  }

  if (isErrorEmployes) {
    return <div className="text-center p-8 text-red-500">Une erreur est survenue lors du chargement des employés.</div>;
  }
  
  const selectedAssignees = form.watch("assigneA");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations de la tâche</h3>
            
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la tâche *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une tâche prédéfinie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tachesPredefinies.map((tache) => (
                        <SelectItem key={tache} value={tache}>
                          {tache}
                        </SelectItem>
                      ))}
                      <SelectItem value="autre">Autre (à préciser)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("titre") === "autre" && (
              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre personnalisé *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Saisir le titre de la tâche" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description détaillée *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Décrivez précisément ce qui doit être fait..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes complémentaires</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Instructions spéciales, matériel nécessaire..."
                      rows={3}
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
              name="dateLimite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date limite *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Niveau de priorité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="normale">Normale</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneA"
              render={() => (
                <FormItem>
                  <FormLabel>Assigner à *</FormLabel>
                  {employePreselectionne && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Employé présélectionné: {employePreselectionne.prenom} {employePreselectionne.nom}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {employes.map((employe: any) => (
                      <div key={employe.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                        <Checkbox
                          id={`employe-${employe.id}`}
                          checked={selectedAssignees.includes(employe.id)}
                          onCheckedChange={(checked) => {
                            const newAssignees = checked
                              ? [...selectedAssignees, employe.id]
                              : selectedAssignees.filter(id => id !== employe.id);
                            form.setValue("assigneA", newAssignees);
                            form.trigger("assigneA");
                          }}
                        />
                        <label 
                          htmlFor={`employe-${employe.id}`}
                          className="flex-1 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium">
                            {employe.prenom} {employe.nom}
                          </span>
                          <Badge className={getRoleBadgeColor(employe.role)}>
                            {getRoleLabel(employe.role)}
                          </Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {selectedAssignees.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Récapitulatif de la tâche</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Titre:</span> {form.watch("titre")}</p>
              <p><span className="text-gray-600">Date limite:</span> {form.watch("dateLimite") ? new Date(form.watch("dateLimite")).toLocaleDateString('fr-FR') : ""}</p>
              <p><span className="text-gray-600">Priorité:</span> {form.watch("priorite")}</p>
              <p><span className="text-gray-600">Assigné à:</span></p>
              <div className="ml-4 space-y-1">
                {selectedAssignees.map((employeId: string) => {
                  const employe = employes.find((e: any) => e.id === employeId);
                  return employe ? (
                    <div key={employeId} className="flex items-center gap-2">
                      <span>• {employe.prenom} {employe.nom}</span>
                      <Badge className={getRoleBadgeColor(employe.role)}>
                        {getRoleLabel(employe.role)}
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sauvegarde..." : (tache ? "Modifier la tâche" : "Créer la tâche")}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}