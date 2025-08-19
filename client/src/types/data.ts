// Types partagés pour l'application LAPGEST-PRO

export interface Lapin {
  id: string;
  identifiant: string;
  race: string;
  sexe: 'male' | 'femelle';
  couleur: string;
  dateNaissance: string;
  poids?: number;
  statut: 'reproducteur' | 'engraissement' | 'stock_a_vendre' | 'vendu' | 'decede';
  healthStatus?: 'sain' | 'malade' | 'quarantaine';
  notes?: string;
  pereId?: string;
  mereId?: string;
  enclosId?: string;
  pere?: Lapin;
  mere?: Lapin;
}

export interface Enclos {
  id: string;
  nom: string;
  type: 'maternite' | 'engraissement' | 'quarantaine' | 'reproducteur';
  capacite: number;
  statut: 'occupe' | 'vide' | 'nettoyage' | 'maintenance';
  description?: string;
}

export interface Accouplement {
  id: string;
  maleId: string;
  femelleId: string;
  dateAccouplement: string;
  dateMiseBasPrevue: string;
  statut: 'en_attente' | 'confirme' | 'echec';
  notes?: string;
  male?: Lapin;
  femelle?: Lapin;
}

export interface MiseBas {
  id: string;
  accouplementId: string;
  dateMiseBas: string;
  nombreLapereaux: number;
  nombreMortsNes?: number;
  nombreSurvivants24h?: number;
  nombreSurvivants48h?: number;
  notes?: string;
  accouplement?: Accouplement;
}

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  dateEmbauche: string;
  statut: 'actif' | 'inactif';
  telephone?: string;
  email?: string;
  qualifications?: string;
}

export interface Article {
  id: string;
  nom: string;
  categorie: 'aliment' | 'materiel' | 'medicament';
  quantite: number;
  unite: 'kg' | 'piece' | 'litre' | 'gramme';
  prixUnitaire: number;
  seuilMinimum: number;
  datePeremption?: string;
  fournisseur?: string;
}

export interface Compte {
  id: string;
  nom: string;
  type: 'banque' | 'mobile_money' | 'especes';
  solde: number;
  devise: 'XOF' | 'EUR' | 'USD';
  actif: boolean;
}

export interface Transaction {
  id: string;
  type: 'depot' | 'retrait' | 'virement';
  montant: number;
  date: string;
  description: string;
  compteId: string;
  reference?: string;
  compte?: Compte;
}

export interface Depense {
  id: string;
  categorie: string;
  description: string;
  montant: number;
  date: string;
  payeePar?: string;
  notes?: string;
}

export interface Vente {
  id: string;
  numeroVente?: string;
  description: string;
  montant: number;
  date: string;
  status: 'en_attente' | 'paye' | 'annule';
  client?: string;
  notes?: string;
}

export interface Soin {
  id: string;
  titre: string;
  description: string;
  lapinId: string;
  date: string;
  gravite: 'legere' | 'moderee' | 'grave';
  status: 'en_cours' | 'termine' | 'suspendu';
  traitement?: string;
  veterinaire?: string;
  cout?: number;
  notes?: string;
  lapin?: Lapin;
}

export interface Vaccin {
  id: string;
  titre: string;
  description: string;
  lapinId: string;
  date: string;
  vaccin: string;
  status: 'prevu' | 'effectue' | 'reporte';
  veterinaire?: string;
  cout?: number;
  prochainRappel?: string;
  notes?: string;
  lapin?: Lapin;
}

export interface Tache {
  id: string;
  titre: string;
  description: string;
  dateLimite: string;
  priorite: 'basse' | 'normale' | 'haute';
  status: 'a_faire' | 'en_cours' | 'terminee';
  assigneA: string[];
  notes?: string;
  employes?: Employee[];
}

export interface Epargne {
  id: string;
  employeId: string;
  type: 'versement' | 'restitution';
  montant: number;
  date: string;
  motif: string;
  notes?: string;
  employe?: Employee;
}

// Types pour les formulaires
export interface LapinFormData {
  identifiant: string;
  race: string;
  sexe: 'male' | 'femelle';
  couleur: string;
  dateNaissance: string;
  poids?: number;
  status?: 'reproducteur' | 'engraissement' | 'stock_a_vendre' | 'vendu' | 'decede';
  healthStatus?: 'sain' | 'malade' | 'quarantaine';
  notes?: string;
  pereId?: string;
  mereId?: string;
  enclosId?: string;
}

export interface AccouplementFormData {
  maleId: string;
  femelleId: string;
  dateAccouplement: string;
  notes?: string;
}

export interface MiseBasFormData {
  accouplementId: string;
  dateMiseBas: string;
  nombreLapereaux: number;
  nombreMortsNes?: number;
  nombreSurvivants24h?: number;
  nombreSurvivants48h?: number;
  notes?: string;
}

export interface SoinFormData {
  titre: string;
  description: string;
  lapinId: string;
  date: string;
  gravite: 'legere' | 'moderee' | 'grave';
  status: 'en_cours' | 'termine' | 'suspendu';
  traitement?: string;
  veterinaire?: string;
  cout?: number;
  notes?: string;
}

export interface VaccinFormData {
  titre: string;
  description: string;
  lapinId: string;
  date: string;
  vaccin: string;
  status: 'prevu' | 'effectue' | 'reporte';
  veterinaire?: string;
  cout?: number;
  prochainRappel?: string;
  notes?: string;
}

export interface TacheFormData {
  titre: string;
  description: string;
  dateLimite: string;
  priorite: 'basse' | 'normale' | 'haute';
  assigneA: string[];
  notes?: string;
}

export interface TransactionFormData {
  type: 'depot' | 'retrait' | 'virement';
  montant: number;
  date: string;
  description: string;
  compteId: string;
  reference?: string;
}

export interface VenteFormData {
  description: string;
  montant: number;
  date: string;
  status: 'en_attente' | 'paye' | 'annule';
  client?: string;
  notes?: string;
}
