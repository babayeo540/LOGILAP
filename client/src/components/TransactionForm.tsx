import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

// Définition du schéma Zod
const transactionSchema = z.object({
  type: z.enum(["depot", "retrait", "virement"]),
  montant: z.number().nonnegative("Le montant ne peut pas être négatif").min(0.01, "Le montant doit être supérieur à 0"),
  compteId: z.string().min(1, "Sélectionner un compte"),
  description: z.string().min(1, "Description requise"),
  date: z.string().min(1, "Date requise"),
  reference: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

// Fonction asynchrone pour la requête API de récupération des comptes
const fetchComptes = async () => {
  const response = await fetch("/api/comptes");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des comptes");
  }
  return response.json();
};

// Fonction asynchrone pour la requête API de sauvegarde
const saveTransaction = async (data: TransactionFormData) => {
  const method = data.id ? 'PUT' : 'POST';
  const url = data.id ? `/api/transactions/${data.id}` : "/api/transactions";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la sauvegarde de la transaction");
  }
  return response.json();
};

export default function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  // Gestion de la requête de récupération des comptes
  const { data: comptes, isLoading: isLoadingComptes, isError: isErrorComptes } = useQuery({
    queryKey: ["/api/comptes"],
    queryFn: fetchComptes,
  });

  // Gestion de la mutation pour la sauvegarde
  const mutation = useMutation({
    mutationFn: saveTransaction,
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur de sauvegarde:", error.message);
      // Afficher un message d'erreur à l'utilisateur (par exemple, via un toast)
    },
  });

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || "depot",
      // Correction : Assurer que le montant est un nombre pour la validation
      montant: transaction?.montant || 0.01,
      compteId: transaction?.compteId || "",
      description: transaction?.description || "",
      date: transaction?.date || new Date().toISOString().split('T')[0],
      reference: transaction?.reference || "",
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    mutation.mutate(data);
  };

  if (isLoadingComptes) {
    return <div className="text-center p-8">Chargement des comptes...</div>;
  }
  
  if (isErrorComptes) {
    return <div className="text-center p-8 text-red-500">Une erreur est survenue lors du chargement des comptes.</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de transaction</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="depot">Dépôt</SelectItem>
                      <SelectItem value="retrait">Retrait</SelectItem>
                      <SelectItem value="virement">Virement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="montant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compte</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un compte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {comptes.map((compte: any) => (
                        <SelectItem key={compte.id} value={compte.id}>
                          {compte.nom} - {compte.banque}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Vente lapins juillet" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: CHQ-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                {mutation.isPending ? "Sauvegarde..." : (transaction ? "Modifier la transaction" : "Enregistrer la transaction")}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}