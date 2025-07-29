import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Building2, PiggyBank, Smartphone, Wallet } from "lucide-react";
import { z } from "zod";

const transactionSchema = z.object({
  date: z.string().min(1, "Date requise"),
  type: z.enum(["depot", "retrait", "virement"]),
  montant: z.number().min(0.01, "Montant doit être positif"),
  compteId: z.string().optional(),
  compteSourceId: z.string().optional(), 
  compteDestId: z.string().optional(),
  categorie: z.string().min(1, "Catégorie requise"),
  description: z.string().min(1, "Description requise"),
  beneficiaire: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: any;
  comptes: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ transaction, comptes, onSuccess, onCancel }: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: transaction?.date || new Date().toISOString().split('T')[0],
      type: transaction?.type || "depot",
      montant: transaction?.montant || 0,
      compteId: transaction?.compteId || "",
      compteSourceId: transaction?.compteSourceId || "",
      compteDestId: transaction?.compteDestId || "",
      categorie: transaction?.categorie || "",
      description: transaction?.description || "",
      beneficiaire: transaction?.beneficiaire || "",
      reference: transaction?.reference || "",
      notes: transaction?.notes || "",
    },
  });

  const typeSelectionne = form.watch("type");
  const montant = form.watch("montant");

  const onSubmit = (data: TransactionFormData) => {
    console.log('Transaction data:', data);
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCompteIcon = (type: string) => {
    switch(type) {
      case "banque": return <Building2 className="w-4 h-4" />;
      case "epargne": return <PiggyBank className="w-4 h-4" />;
      case "mobile_money": return <Smartphone className="w-4 h-4" />;
      case "especes": return <Wallet className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const categories = [
    { id: "vente_lapins", label: "Vente de lapins", type: "credit" },
    { id: "vente_fumier", label: "Vente de fumier", type: "credit" },
    { id: "subvention", label: "Subventions", type: "credit" },
    { id: "remboursement", label: "Remboursements", type: "credit" },
    { id: "salaire", label: "Salaires", type: "debit" },
    { id: "alimentation", label: "Alimentation animale", type: "debit" },
    { id: "veterinaire", label: "Frais vétérinaires", type: "debit" },
    { id: "electricite", label: "Électricité", type: "debit" },
    { id: "eau", label: "Eau", type: "debit" },
    { id: "carburant", label: "Carburant", type: "debit" },
    { id: "maintenance", label: "Maintenance", type: "debit" },
    { id: "assurance", label: "Assurance", type: "debit" },
    { id: "epargne", label: "Épargne", type: "both" },
    { id: "investissement", label: "Investissements", type: "debit" },
    { id: "divers", label: "Divers", type: "both" }
  ];

  const categoriesDisponibles = categories.filter(cat => {
    if (typeSelectionne === "depot") return cat.type === "credit" || cat.type === "both";
    if (typeSelectionne === "retrait") return cat.type === "debit" || cat.type === "both";
    return cat.type === "both";
  });

  const generateReference = () => {
    const prefix = typeSelectionne === "depot" ? "DEP" : 
                  typeSelectionne === "retrait" ? "RET" : "VIR";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${date}-${random}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Type et montant</h3>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de l'opération *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
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
                  <FormLabel>Type d'opération *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="depot">
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          <span>Dépôt (entrée d'argent)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="retrait">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                          <span>Retrait (sortie d'argent)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="virement">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          <span>Virement (entre comptes)</span>
                        </div>
                      </SelectItem>
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
              name="categorie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesDisponibles.map((categorie) => (
                        <SelectItem key={categorie.id} value={categorie.id}>
                          {categorie.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Comptes concernés</h3>

            {typeSelectionne === "virement" ? (
              <>
                <FormField
                  control={form.control}
                  name="compteSourceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compte source *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="D'où vient l'argent ?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {comptes.map((compte) => (
                            <SelectItem key={compte.id} value={compte.id}>
                              <div className="flex items-center gap-2">
                                {getCompteIcon(compte.type)}
                                <span>{compte.nom}</span>
                                <span className="text-xs text-gray-500">
                                  ({formatCurrency(compte.solde)})
                                </span>
                              </div>
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
                  name="compteDestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compte destination *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Où va l'argent ?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {comptes.filter(c => c.id !== form.watch("compteSourceId")).map((compte) => (
                            <SelectItem key={compte.id} value={compte.id}>
                              <div className="flex items-center gap-2">
                                {getCompteIcon(compte.type)}
                                <span>{compte.nom}</span>
                                <span className="text-xs text-gray-500">
                                  ({formatCurrency(compte.solde)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={form.control}
                name="compteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compte concerné *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {comptes.map((compte) => (
                          <SelectItem key={compte.id} value={compte.id}>
                            <div className="flex items-center gap-2">
                              {getCompteIcon(compte.type)}
                              <span>{compte.nom}</span>
                              <span className="text-xs text-gray-500">
                                ({formatCurrency(compte.solde)})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="beneficiaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {typeSelectionne === "depot" ? "Payeur" : 
                     typeSelectionne === "retrait" ? "Bénéficiaire" : "Notes"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder={
                        typeSelectionne === "depot" ? "Qui vous a payé ?" :
                        typeSelectionne === "retrait" ? "À qui avez-vous payé ?" : 
                        "Motif du virement"
                      }
                    />
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="Ex: FAC-2024-001" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => field.onChange(generateReference())}
                    >
                      Auto
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description détaillée *</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Décrivez précisément cette transaction..."
                  rows={3}
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
                  placeholder="Informations supplémentaires, contexte..."
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Aperçu de la transaction */}
        {(typeSelectionne && montant > 0) && (
          <Card className={`border-2 ${
            typeSelectionne === "depot" ? "bg-green-50 border-green-200" :
            typeSelectionne === "retrait" ? "bg-red-50 border-red-200" : 
            "bg-blue-50 border-blue-200"
          }`}>
            <CardContent className="p-4">
              <h4 className={`font-semibold mb-3 ${
                typeSelectionne === "depot" ? "text-green-900" :
                typeSelectionne === "retrait" ? "text-red-900" : 
                "text-blue-900"
              }`}>
                Aperçu de la transaction
              </h4>
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  typeSelectionne === "depot" ? "bg-green-100" :
                  typeSelectionne === "retrait" ? "bg-red-100" : "bg-blue-100"
                }`}>
                  {typeSelectionne === "depot" ? (
                    <ArrowDownLeft className="text-green-600 w-6 h-6" />
                  ) : typeSelectionne === "retrait" ? (
                    <ArrowUpRight className="text-red-600 w-6 h-6" />
                  ) : (
                    <ArrowUpRight className="text-blue-600 w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${
                    typeSelectionne === "depot" ? "text-green-800" :
                    typeSelectionne === "retrait" ? "text-red-800" : 
                    "text-blue-800"
                  }`}>
                    {typeSelectionne === "retrait" ? "-" : "+"}{formatCurrency(montant)}
                  </p>
                  <Badge className={
                    typeSelectionne === "depot" ? "bg-green-100 text-green-800" :
                    typeSelectionne === "retrait" ? "bg-red-100 text-red-800" : 
                    "bg-blue-100 text-blue-800"
                  }>
                    {typeSelectionne === "depot" ? "Dépôt" :
                     typeSelectionne === "retrait" ? "Retrait" : "Virement"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className={`font-medium ${
                    typeSelectionne === "depot" ? "text-green-600" :
                    typeSelectionne === "retrait" ? "text-red-600" : 
                    "text-blue-600"
                  }`}>Date</p>
                  <p className={
                    typeSelectionne === "depot" ? "text-green-800" :
                    typeSelectionne === "retrait" ? "text-red-800" : 
                    "text-blue-800"
                  }>
                    {form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('fr-FR') : ""}
                  </p>
                </div>

                {form.watch("categorie") && (
                  <div>
                    <p className={`font-medium ${
                      typeSelectionne === "depot" ? "text-green-600" :
                      typeSelectionne === "retrait" ? "text-red-600" : 
                      "text-blue-600"
                    }`}>Catégorie</p>
                    <p className={
                      typeSelectionne === "depot" ? "text-green-800" :
                      typeSelectionne === "retrait" ? "text-red-800" : 
                      "text-blue-800"
                    }>
                      {categories.find(c => c.id === form.watch("categorie"))?.label}
                    </p>
                  </div>
                )}

                {form.watch("reference") && (
                  <div>
                    <p className={`font-medium ${
                      typeSelectionne === "depot" ? "text-green-600" :
                      typeSelectionne === "retrait" ? "text-red-600" : 
                      "text-blue-600"
                    }`}>Référence</p>
                    <p className={`font-mono text-xs ${
                      typeSelectionne === "depot" ? "text-green-800" :
                      typeSelectionne === "retrait" ? "text-red-800" : 
                      "text-blue-800"
                    }`}>
                      {form.watch("reference")}
                    </p>
                  </div>
                )}
              </div>

              {form.watch("description") && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className={`font-medium text-xs ${
                    typeSelectionne === "depot" ? "text-green-600" :
                    typeSelectionne === "retrait" ? "text-red-600" : 
                    "text-blue-600"
                  }`}>Description</p>
                  <p className={`text-sm ${
                    typeSelectionne === "depot" ? "text-green-800" :
                    typeSelectionne === "retrait" ? "text-red-800" : 
                    "text-blue-800"
                  }`}>
                    {form.watch("description")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conseils */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Conseils pour une bonne tenue de comptes</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Enregistrez toutes les transactions le jour même</li>
            <li>• Gardez toujours les justificatifs (reçus, factures)</li>
            <li>• Utilisez des références claires pour retrouver facilement</li>
            <li>• Vérifiez régulièrement avec vos relevés bancaires</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {transaction ? "Modifier la transaction" : "Enregistrer la transaction"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}