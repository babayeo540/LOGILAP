import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

// Schémas de validation
const horairePlanningSchema = z.object({
  employeId: z.string().min(1, 'Employé requis'),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  heureDebut: z.string().min(1, 'Heure de début requise'),
  heureFin: z.string().min(1, 'Heure de fin requise'),
  joursSemaine: z.array(z.number()).min(1, 'Sélectionnez au moins un jour'),
  notes: z.string().optional(),
});

const absenceSchema = z.object({
  employeId: z.string().min(1, 'Employé requis'),
  typeAbsence: z.enum(['conge', 'maladie', 'urgence', 'formation'], {
    errorMap: () => ({ message: 'Type d\'absence requis' }),
  }),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  motif: z.string().min(1, 'Motif requis'),
  estApprouve: z.boolean().default(false),
  documentJoint: z.string().optional(),
});

type HorairePlanningFormData = z.infer<typeof horairePlanningSchema>;
type AbsenceFormData = z.infer<typeof absenceSchema>;

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  statut: 'actif' | 'inactif';
}

interface HorairePlanning {
  id: string;
  employeId: string;
  employe: Employee;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  joursSemaine: number[];
  notes?: string;
}

interface Absence {
  id: string;
  employeId: string;
  employe: Employee;
  typeAbsence: 'conge' | 'maladie' | 'urgence' | 'formation';
  dateDebut: string;
  dateFin: string;
  motif: string;
  estApprouve: boolean;
  documentJoint?: string;
  dateCreation: string;
}

const joursSemaine = [
  { label: 'Lundi', value: 1 },
  { label: 'Mardi', value: 2 },
  { label: 'Mercredi', value: 3 },
  { label: 'Jeudi', value: 4 },
  { label: 'Vendredi', value: 5 },
  { label: 'Samedi', value: 6 },
  { label: 'Dimanche', value: 0 },
];

const typesAbsence = [
  { value: 'conge', label: 'Congé', color: 'bg-blue-100 text-blue-800' },
  { value: 'maladie', label: 'Maladie', color: 'bg-red-100 text-red-800' },
  { value: 'urgence', label: 'Urgence', color: 'bg-orange-100 text-orange-800' },
  { value: 'formation', label: 'Formation', color: 'bg-green-100 text-green-800' },
];

export default function PersonnelSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showHoraireDialog, setShowHoraireDialog] = useState(false);
  const [showAbsenceDialog, setShowAbsenceDialog] = useState(false);
  const [editingHoraire, setEditingHoraire] = useState<HorairePlanning | null>(null);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);

  const queryClient = useQueryClient();

  // Récupération des données
  const { data: employes } = useQuery<Employee[]>({
    queryKey: ['/api/employes'],
    queryFn: async () => {
      const response = await fetch('/api/employes');
      if (!response.ok) throw new Error('Erreur lors de la récupération des employés');
      return response.json();
    },
  });

  const { data: horaires } = useQuery<HorairePlanning[]>({
    queryKey: ['/api/personnel/horaires'],
    queryFn: async () => {
      const response = await fetch('/api/personnel/horaires');
      if (!response.ok) throw new Error('Erreur lors de la récupération des horaires');
      return response.json();
    },
  });

  const { data: absences } = useQuery<Absence[]>({
    queryKey: ['/api/personnel/absences'],
    queryFn: async () => {
      const response = await fetch('/api/personnel/absences');
      if (!response.ok) throw new Error('Erreur lors de la récupération des absences');
      return response.json();
    },
  });

  // Mutations
  const createHoraireMutation = useMutation({
    mutationFn: async (data: HorairePlanningFormData) => {
      const response = await fetch('/api/personnel/horaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la création de l\'horaire');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personnel/horaires'] });
      setShowHoraireDialog(false);
      setEditingHoraire(null);
    },
  });

  const createAbsenceMutation = useMutation({
    mutationFn: async (data: AbsenceFormData) => {
      const response = await fetch('/api/personnel/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la création de l\'absence');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personnel/absences'] });
      setShowAbsenceDialog(false);
      setEditingAbsence(null);
    },
  });

  const deleteHoraireMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/personnel/horaires/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personnel/horaires'] });
    },
  });

  const approveAbsenceMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const response = await fetch(`/api/personnel/absences/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estApprouve: approved }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'approbation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personnel/absences'] });
    },
  });

  // Formulaires
  const horaireForm = useForm<HorairePlanningFormData>({
    resolver: zodResolver(horairePlanningSchema),
    defaultValues: {
      employeId: '',
      dateDebut: format(new Date(), 'yyyy-MM-dd'),
      dateFin: format(new Date(), 'yyyy-MM-dd'),
      heureDebut: '08:00',
      heureFin: '17:00',
      joursSemaine: [1, 2, 3, 4, 5], // Lun-Ven par défaut
      notes: '',
    },
  });

  const absenceForm = useForm<AbsenceFormData>({
    resolver: zodResolver(absenceSchema),
    defaultValues: {
      employeId: '',
      typeAbsence: 'conge',
      dateDebut: format(new Date(), 'yyyy-MM-dd'),
      dateFin: format(new Date(), 'yyyy-MM-dd'),
      motif: '',
      estApprouve: false,
      documentJoint: '',
    },
  });

  // Gestion de la semaine courante
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Obtenir les absences pour une date donnée
  const getAbsencesForDate = (date: Date) => {
    return absences?.filter(absence => {
      const start = new Date(absence.dateDebut);
      const end = new Date(absence.dateFin);
      return date >= start && date <= end;
    }) || [];
  };

  // Obtenir les horaires pour un employé et un jour
  const getHorairesForEmployeeAndDay = (employeId: string, dayOfWeek: number) => {
    return horaires?.filter(horaire => 
      horaire.employeId === employeId && 
      horaire.joursSemaine.includes(dayOfWeek)
    ) || [];
  };

  const onSubmitHoraire = (data: HorairePlanningFormData) => {
    createHoraireMutation.mutate(data);
  };

  const onSubmitAbsence = (data: AbsenceFormData) => {
    createAbsenceMutation.mutate(data);
  };

  const handleJourSemaineToggle = (jour: number) => {
    const current = horaireForm.getValues('joursSemaine');
    const updated = current.includes(jour)
      ? current.filter(j => j !== jour)
      : [...current, jour];
    horaireForm.setValue('joursSemaine', updated);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Horaires & Absences</h2>
          <p className="text-gray-600">
            Planification et suivi du personnel
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showHoraireDialog} onOpenChange={setShowHoraireDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Horaire
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Planifier un Horaire</DialogTitle>
              </DialogHeader>
              <Form {...horaireForm}>
                <form onSubmit={horaireForm.handleSubmit(onSubmitHoraire)} className="space-y-4">
                  <FormField
                    control={horaireForm.control}
                    name="employeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employé *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un employé" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employes?.map((employe) => (
                              <SelectItem key={employe.id} value={employe.id}>
                                {employe.prenom} {employe.nom} - {employe.poste}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={horaireForm.control}
                      name="dateDebut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de début *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={horaireForm.control}
                      name="dateFin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de fin *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={horaireForm.control}
                      name="heureDebut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heure de début *</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={horaireForm.control}
                      name="heureFin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heure de fin *</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={horaireForm.control}
                    name="joursSemaine"
                    render={() => (
                      <FormItem>
                        <FormLabel>Jours de la semaine *</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {joursSemaine.map((jour) => (
                            <Button
                              key={jour.value}
                              type="button"
                              variant={
                                horaireForm.watch('joursSemaine').includes(jour.value)
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => handleJourSemaineToggle(jour.value)}
                            >
                              {jour.label}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={horaireForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notes sur l'horaire..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createHoraireMutation.isPending}>
                      {createHoraireMutation.isPending ? 'Création...' : 'Créer'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowHoraireDialog(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAbsenceDialog} onOpenChange={setShowAbsenceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserX className="w-4 h-4 mr-2" />
                Nouvelle Absence
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer une Absence</DialogTitle>
              </DialogHeader>
              <Form {...absenceForm}>
                <form onSubmit={absenceForm.handleSubmit(onSubmitAbsence)} className="space-y-4">
                  <FormField
                    control={absenceForm.control}
                    name="employeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employé *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un employé" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employes?.map((employe) => (
                              <SelectItem key={employe.id} value={employe.id}>
                                {employe.prenom} {employe.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={absenceForm.control}
                    name="typeAbsence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'absence *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {typesAbsence.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={absenceForm.control}
                      name="dateDebut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de début *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={absenceForm.control}
                      name="dateFin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de fin *</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={absenceForm.control}
                    name="motif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motif *</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Motif de l'absence..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={createAbsenceMutation.isPending}>
                      {createAbsenceMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAbsenceDialog(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vue calendaire de la semaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Planning de la semaine du {format(weekStart, 'dd MMMM', { locale: fr })} au {format(weekEnd, 'dd MMMM yyyy', { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1 mb-4">
            <div className="p-2 font-semibold">Employé</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-2 text-center font-semibold">
                <div>{format(day, 'EEE', { locale: fr })}</div>
                <div className="text-sm text-gray-500">{format(day, 'dd')}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {employes?.map((employe) => (
              <div key={employe.id} className="grid grid-cols-8 gap-1 border-b border-gray-100">
                <div className="p-2 flex items-center">
                  <div>
                    <p className="font-medium text-sm">{employe.prenom} {employe.nom}</p>
                    <p className="text-xs text-gray-500">{employe.poste}</p>
                  </div>
                </div>

                {weekDays.map((day) => {
                  const dayOfWeek = day.getDay();
                  const horairesJour = getHorairesForEmployeeAndDay(employe.id, dayOfWeek);
                  const absencesJour = getAbsencesForDate(day);
                  const employeAbsent = absencesJour.some(abs => abs.employeId === employe.id);

                  return (
                    <div key={day.toISOString()} className="p-1 min-h-[60px]">
                      {employeAbsent ? (
                        <div className="bg-red-100 text-red-800 p-1 rounded text-xs">
                          <UserX className="w-3 h-3 inline mr-1" />
                          Absent
                        </div>
                      ) : (
                        horairesJour.map((horaire) => (
                          <div key={horaire.id} className="bg-green-100 text-green-800 p-1 rounded text-xs mb-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {horaire.heureDebut}-{horaire.heureFin}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des absences en attente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Absences en attente d'approbation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {absences?.filter(absence => !absence.estApprouve).map((absence) => (
              <div key={absence.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {absence.employe.prenom} {absence.employe.nom}
                    </span>
                    <Badge className={typesAbsence.find(t => t.value === absence.typeAbsence)?.color}>
                      {typesAbsence.find(t => t.value === absence.typeAbsence)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Du {format(new Date(absence.dateDebut), 'dd/MM/yyyy')} au {format(new Date(absence.dateFin), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-sm text-gray-700">{absence.motif}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => approveAbsenceMutation.mutate({ id: absence.id, approved: true })}
                  >
                    <UserCheck className="w-4 h-4" />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4" />
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
            {!absences?.some(absence => !absence.estApprouve) && (
              <p className="text-gray-500 text-center py-4">
                Aucune absence en attente d'approbation
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
