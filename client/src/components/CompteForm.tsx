import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, PiggyBank, Smartphone, Wallet } from "lucide-react";
import { z } from "zod";

const compteSchema = z.object({
  nom: z.string().min(1, "Nom du compte requis"),
  type: z.enum(["banque", "epargne", "mobile_money", "especes"]),
  banque: z.string().optional(),
  operateur: z.string().optional(),
  numero: z.string().optional(),
  soldeInitial: z.number().default(0),
  notes: z.string().optional(),
});

type CompteFormData = z.infer<typeof compteSchema>;

interface CompteFormProps {
  compte?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CompteForm({ compte, onSuccess, onCancel }: CompteFormProps) {
  const form = useForm<CompteFormData>({
    resolver: zodResolver(compteSchema),
    defaultValues: {
      nom: compte?.nom || "",
      type: compte?.type || "banque",
      banque: compte?.banque || "",
      operateur: compte?.operateur || "",
      numero: compte?.numero || "",
      soldeInitial: compte?.solde || 0,
      notes: "",
    },
  });

  const typeSelectionne = form.watch("type");

  const onSubmit = (data: CompteFormData) => {
    console.log('Compte data:', data);
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

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "banque": return <Building2 className="w-5 h-5" />;
      case "epargne": return <PiggyBank className="w-5 h-5" />;
      case "mobile_money": return <Smartphone className="w-5 h-5" />;
      case "especes": return <Wallet className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case "banque": return "bg-blue-100 text-blue-800";
      case "epargne": return "bg-green-100 text-green-800";
      case "mobile_money": return "bg-orange-100 text-orange-800";
      case "especes": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const banquesFrequentes = [
    "Crédit Agricole",
    "Banque Populaire", 
    "BNP Paribas",
    "Société Générale",
    "LCL",
    "CIC",
    "Caisse d'Épargne",
    "Crédit Mutuel",
    "La Banque Postale"
  ];

  const operateursFrequents = [
    "Orange Money",
    "Wave",
    "Free2Move Pay",
    "Lydia",
    "PayPal",
    "Revolut"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du compte *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Compte courant principal" />
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
                <FormLabel>Type de compte *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="banque">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Compte bancaire</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="epargne">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="w-4 h-4" />
                        <span>Compte épargne</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile_money">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>Mobile Money</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="especes">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        <span>Caisse espèces</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Champs spécifiques selon le type */}
          {(typeSelectionne === "banque" || typeSelectionne === "epargne") && (
            <>
              <FormField
                control={form.control}
                name="banque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banque</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la banque" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {banquesFrequentes.map((banque) => (
                          <SelectItem key={banque} value={banque}>
                            {banque}
                          </SelectItem>
                        ))}
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("banque") === "autre" && (
                <FormField
                  control={form.control}
                  name="banque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la banque</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Saisir le nom de la banque" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN ou numéro de compte</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="FR76 1234 5678 9012 3456 78" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {typeSelectionne === "mobile_money" && (
            <>
              <FormField
                control={form.control}
                name="operateur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opérateur</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'opérateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operateursFrequents.map((operateur) => (
                          <SelectItem key={operateur} value={operateur}>
                            {operateur}
                          </SelectItem>
                        ))}
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("operateur") === "autre" && (
                <FormField
                  control={form.control}
                  name="operateur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'opérateur</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Saisir le nom de l'opérateur" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+33 6 12 34 56 78" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="soldeInitial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solde initial (€)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Aperçu du compte */}
        {(form.watch("nom") || typeSelectionne) && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-blue-900">Aperçu du compte</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(typeSelectionne)}`}>
                  {getTypeIcon(typeSelectionne)}
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    {form.watch("nom") || "Nom du compte"}
                  </p>
                  <Badge className={getTypeColor(typeSelectionne)}>
                    {typeSelectionne === "banque" ? "Compte bancaire" :
                     typeSelectionne === "epargne" ? "Compte épargne" :
                     typeSelectionne === "mobile_money" ? "Mobile Money" :
                     typeSelectionne === "especes" ? "Caisse espèces" : ""}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {form.watch("banque") && (
                  <div>
                    <p className="text-blue-600 font-medium">Banque</p>
                    <p className="text-blue-800">{form.watch("banque")}</p>
                  </div>
                )}
                {form.watch("operateur") && (
                  <div>
                    <p className="text-blue-600 font-medium">Opérateur</p>
                    <p className="text-blue-800">{form.watch("operateur")}</p>
                  </div>
                )}
                {form.watch("numero") && (
                  <div>
                    <p className="text-blue-600 font-medium">Numéro</p>
                    <p className="text-blue-800 font-mono text-xs">{form.watch("numero")}</p>
                  </div>
                )}
                <div>
                  <p className="text-blue-600 font-medium">Solde initial</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatCurrency(form.watch("soldeInitial"))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conseils */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">💡 Conseils de gestion</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Utilisez des noms explicites pour vos comptes</li>
            <li>• Mettez à jour régulièrement les soldes avec les relevés</li>
            <li>• Gardez vos informations bancaires sécurisées</li>
            <li>• Séparez les comptes personnels des comptes de la ferme</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {compte ? "Modifier le compte" : "Créer le compte"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}