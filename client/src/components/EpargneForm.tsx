import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { Plus, Minus, PiggyBank } from "lucide-react";

const epargneSchema = z.object({
  type: z.enum(["versement", "restitution"]),
  montant: z.number().min(0.01, "Montant doit être positif"),
  motif: z.string().min(1, "Motif requis"),
  notes: z.string().optional(),
});

type EpargneFormData = z.infer<typeof epargneSchema>;

interface EpargneFormProps {
  employe?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EpargneForm({ employe, onSuccess, onCancel }: EpargneFormProps) {
  const form = useForm<EpargneFormData>({
    resolver: zodResolver(epargneSchema),
    defaultValues: {
      type: "versement",
      montant: 0,
      motif: "",
      notes: "",
    },
  });

  const type = form.watch("type");
  const montant = form.watch("montant");

  const onSubmit = (data: EpargneFormData) => {
    console.log('Épargne data:', { ...data, employeId: employe?.id });
    
    // Validation pour restitution
    if (data.type === "restitution" && employe) {
      if (data.montant > employe.soldeEpargne) {
        form.setError("montant", {
          message: `Solde insuffisant (disponible: ${employe.soldeEpargne.toFixed(2)} €)`
        });
        return;
      }
    }
    
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  const motifsPredefinisVersement = [
    "Versement mensuel",
    "Prime performance",
    "Heures supplémentaires",
    "Bonus annuel",
    "13ème mois",
    "Intéressement",
    "Versement exceptionnel",
    "Rectification"
  ];

  const motifsPredefinisRestitution = [
    "Demande employé",
    "Urgence familiale",
    "Achat véhicule",
    "Travaux logement",
    "Frais médicaux",
    "Éducation enfants",
    "Départ entreprise",
    "Retraite"
  ];

  const motifsDisponibles = type === "versement" ? motifsPredefinisVersement : motifsPredefinisRestitution;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations employé */}
        {employe && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{employe.prenom} {employe.nom}</h4>
                  <p className="text-sm text-gray-600">{employe.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(employe.soldeEpargne)}
                  </p>
                  <p className="text-sm text-gray-600">Solde actuel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Type de transaction */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant={type === "versement" ? "default" : "outline"}
            onClick={() => form.setValue("type", "versement")}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Versement
          </Button>
          <Button
            type="button"
            variant={type === "restitution" ? "default" : "outline"}
            onClick={() => form.setValue("type", "restitution")}
            className="flex-1"
          >
            <Minus className="w-4 h-4 mr-2" />
            Restitution
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Détails de la transaction</h3>
            
            <FormField
              control={form.control}
              name="montant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un motif" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motifsDisponibles.map((motif) => (
                        <SelectItem key={motif} value={motif}>
                          {motif}
                        </SelectItem>
                      ))}
                      <SelectItem value="autre">Autre (préciser dans les notes)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Détails supplémentaires sur cette transaction..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Aperçu</h3>
            
            {/* Informations de la transaction */}
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Type de transaction:</span>
                  <Badge className={type === "versement" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {type === "versement" ? "Versement" : "Restitution"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Montant:</span>
                  <span className="font-bold text-lg">
                    {type === "restitution" ? "-" : "+"}{formatCurrency(montant || 0)}
                  </span>
                </div>
              </div>

              {/* Simulation du nouveau solde */}
              {employe && montant > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Solde actuel:</span>
                      <span>{formatCurrency(employe.soldeEpargne)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{type === "versement" ? "Versement:" : "Restitution:"}</span>
                      <span className={type === "versement" ? "text-green-600" : "text-red-600"}>
                        {type === "restitution" ? "-" : "+"}{formatCurrency(montant)}
                      </span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between font-bold">
                      <span>Nouveau solde:</span>
                      <span className="text-purple-600">
                        {formatCurrency(
                          type === "versement" 
                            ? employe.soldeEpargne + montant
                            : employe.soldeEpargne - montant
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerte si restitution supérieure au solde */}
              {type === "restitution" && employe && montant > employe.soldeEpargne && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ⚠️ Le montant demandé est supérieur au solde disponible
                  </p>
                </div>
              )}
            </div>

            {/* Conseils */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                <PiggyBank className="w-4 h-4 inline mr-1" />
                Rappel épargne salariale
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Les versements sont déductibles d'impôts</li>
                <li>• Restitution possible à tout moment</li>
                <li>• Historique consultable à tout moment</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {type === "versement" ? "Effectuer le versement" : "Effectuer la restitution"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}