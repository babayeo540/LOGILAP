import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { X } from "lucide-react";
import { useState } from "react";

const employeSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  role: z.enum(["administrateur", "gestionnaire", "soigneur"]),
  dateEmbauche: z.string().min(1, "Date d'embauche requise"),
  telephone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  adresse: z.string().min(1, "Adresse requise"),
  salaire: z.number().min(0, "Salaire doit être positif"),
  statut: z.enum(["actif", "inactif", "conge"]),
  qualifications: z.array(z.string()).optional(),
});

type EmployeFormData = z.infer<typeof employeSchema>;

interface EmployeFormProps {
  employe?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeForm({ employe, onSuccess, onCancel }: EmployeFormProps) {
  const [nouvelleQualification, setNouvelleQualification] = useState("");
  const [qualifications, setQualifications] = useState<string[]>(
    employe?.qualifications || []
  );

  const form = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      nom: employe?.nom || "",
      prenom: employe?.prenom || "",
      role: employe?.role || "soigneur",
      dateEmbauche: employe?.dateEmbauche || new Date().toISOString().split('T')[0],
      telephone: employe?.telephone || "",
      email: employe?.email || "",
      adresse: employe?.adresse || "",
      salaire: employe?.salaire || 0,
      statut: employe?.statut || "actif",
      qualifications: employe?.qualifications || [],
    },
  });

  const onSubmit = (data: EmployeFormData) => {
    console.log('Employé data:', { ...data, qualifications });
    // Simulation de la sauvegarde
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  const ajouterQualification = () => {
    if (nouvelleQualification.trim() && !qualifications.includes(nouvelleQualification.trim())) {
      const nouvellesQualifications = [...qualifications, nouvelleQualification.trim()];
      setQualifications(nouvellesQualifications);
      form.setValue("qualifications", nouvellesQualifications);
      setNouvelleQualification("");
    }
  };

  const supprimerQualification = (qualification: string) => {
    const nouvellesQualifications = qualifications.filter(q => q !== qualification);
    setQualifications(nouvellesQualifications);
    form.setValue("qualifications", nouvellesQualifications);
  };

  const qualificationsPredefinies = [
    "Soins vétérinaires",
    "Gestion reproduction",
    "Alimentation",
    "Nettoyage",
    "Comptabilité",
    "Management",
    "Vaccination",
    "Sevrage",
    "Engraissement",
    "Vente",
    "Maintenance équipements",
    "Gestion stocks"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom de famille" />
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
                  <FormLabel>Prénom *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Prénom" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="06 12 34 56 78" />
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="email@exemple.fr" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Adresse complète"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations professionnelles</h3>
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
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
                  <FormLabel>Date d'embauche *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salaire mensuel (€) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
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
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut de l'employé" />
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
        </div>

        {/* Qualifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Qualifications et compétences</h3>
          
          {/* Qualifications existantes */}
          {qualifications.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Qualifications actuelles:</p>
              <div className="flex flex-wrap gap-2">
                {qualifications.map((qualification, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {qualification}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-600" 
                      onClick={() => supprimerQualification(qualification)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ajouter une qualification */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ajouter une qualification:</p>
            <div className="flex gap-2">
              <Select onValueChange={(value) => setNouvelleQualification(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner une qualification prédéfinie" />
                </SelectTrigger>
                <SelectContent>
                  {qualificationsPredefinies
                    .filter(q => !qualifications.includes(q))
                    .map((qualification) => (
                      <SelectItem key={qualification} value={qualification}>
                        {qualification}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={ajouterQualification}
                disabled={!nouvelleQualification}
              >
                Ajouter
              </Button>
            </div>
          </div>

          {/* Qualification personnalisée */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Ou saisir une qualification personnalisée:</p>
            <div className="flex gap-2">
              <Input
                value={nouvelleQualification}
                onChange={(e) => setNouvelleQualification(e.target.value)}
                placeholder="Nouvelle qualification..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    ajouterQualification();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={ajouterQualification}
                disabled={!nouvelleQualification.trim()}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {employe ? "Modifier" : "Enregistrer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}