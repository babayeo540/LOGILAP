import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("employee"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const rabbitStatusEnum = pgEnum('rabbit_status', [
  'reproducteur', 'engraissement', 'stock_a_vendre', 'vendu', 'decede'
]);

export const rabbitSexEnum = pgEnum('rabbit_sex', ['male', 'femelle']);

export const enclosTypeEnum = pgEnum('enclos_type', [
  'maternite', 'engraissement', 'quarantaine', 'reproducteur_male', 'reproducteur_femelle'
]);

export const enclosStatusEnum = pgEnum('enclos_status', [
  'occupe', 'vide', 'a_nettoyer', 'en_maintenance'
]);

export const healthStatusEnum = pgEnum('health_status', [
  'sain', 'malade', 'en_quarantaine'
]);

export const treatmentStatusEnum = pgEnum('treatment_status', [
  'en_cours', 'termine', 'interrompu'
]);

export const taskStatusEnum = pgEnum('task_status', [
  'a_faire', 'en_cours', 'terminee'
]);

export const accountTypeEnum = pgEnum('account_type', [
  'bancaire', 'mobile_money'
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'depot', 'retrait', 'virement_interne'
]);

// Enclos/Cages
export const enclos = pgTable("enclos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  type: enclosTypeEnum("type").notNull(),
  capaciteMax: integer("capacite_max").notNull(),
  status: enclosStatusEnum("status").default('vide'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lapins
export const lapins = pgTable("lapins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifiant: varchar("identifiant").notNull().unique(),
  dateNaissance: date("date_naissance"),
  race: varchar("race"),
  sexe: rabbitSexEnum("sexe").notNull(),
  couleur: varchar("couleur"),
  status: rabbitStatusEnum("status").default('engraissement'),
  healthStatus: healthStatusEnum("health_status").default('sain'),
  pereId: varchar("pere_id"),
  mereId: varchar("mere_id"),
  enclosId: varchar("enclos_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accouplements
export const accouplements = pgTable("accouplements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  femelleId: varchar("femelle_id").notNull(),
  maleId: varchar("male_id").notNull(),
  dateAccouplement: timestamp("date_accouplement").notNull(),
  dateMiseBasPrevue: timestamp("date_mise_bas_prevue"),
  succes: boolean("succes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mises bas
export const misesBas = pgTable("mises_bas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accouplementId: varchar("accouplement_id").notNull(),
  dateMiseBas: timestamp("date_mise_bas").notNull(),
  nombreLapereaux: integer("nombre_lapereaux").notNull(),
  nombreMortsNes: integer("nombre_morts_nes").default(0),
  nombreSurvivants24h: integer("nombre_survivants_24h"),
  nombreSurvivants48h: integer("nombre_survivants_48h"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portées
export const portees = pgTable("portees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  miseBasId: varchar("mise_bas_id").notNull(),
  identifiantPortee: varchar("identifiant_portee").notNull().unique(),
  dateSevragePrevue: date("date_sevrage_prevue"),
  dateSevrage: date("date_sevrage"),
  nombreSevre: integer("nombre_sevre"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pesées
export const pesees = pgTable("pesees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lapinId: varchar("lapin_id"),
  porteeId: varchar("portee_id"),
  datePesee: timestamp("date_pesee").notNull(),
  poids: decimal("poids", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fournisseurs
export const fournisseurs = pgTable("fournisseurs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  telephone: varchar("telephone"),
  email: varchar("email"),
  adresse: text("adresse"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Médicaments
export const medicaments = pgTable("medicaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  dosage: varchar("dosage"),
  unite: varchar("unite"),
  quantiteStock: decimal("quantite_stock", { precision: 10, scale: 2 }).default('0'),
  prixAchat: decimal("prix_achat", { precision: 10, scale: 2 }),
  datePeremption: date("date_peremption"),
  seuilAlerte: decimal("seuil_alerte", { precision: 10, scale: 2 }).default('10'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Traitements
export const traitements = pgTable("traitements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lapinId: varchar("lapin_id").notNull(),
  medicamentId: varchar("medicament_id").notNull(),
  employeId: varchar("employe_id"),
  dateDebut: timestamp("date_debut").notNull(),
  dateFin: timestamp("date_fin"),
  dateRappel: timestamp("date_rappel"),
  diagnostic: text("diagnostic"),
  symptomes: text("symptomes"),
  voieAdministration: varchar("voie_administration"),
  periodeRetrait: integer("periode_retrait"), // en jours
  status: treatmentStatusEnum("status").default('en_cours'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Aliments
export const aliments = pgTable("aliments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  type: varchar("type"),
  quantiteStock: decimal("quantite_stock", { precision: 10, scale: 2 }).default('0'),
  unite: varchar("unite").default('kg'),
  prixParKg: decimal("prix_par_kg", { precision: 10, scale: 2 }),
  dateReception: date("date_reception"),
  datePeremption: date("date_peremption"),
  fournisseurId: varchar("fournisseur_id"),
  seuilAlerte: decimal("seuil_alerte", { precision: 10, scale: 2 }).default('50'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consommation aliments
export const consommationAliments = pgTable("consommation_aliments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alimentId: varchar("aliment_id").notNull(),
  quantiteConsommee: decimal("quantite_consommee", { precision: 10, scale: 2 }).notNull(),
  dateConsommation: date("date_consommation").notNull(),
  nombreLapins: integer("nombre_lapins"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matériel
export const materiel = pgTable("materiel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  type: varchar("type"),
  quantiteStock: integer("quantite_stock").default(0),
  etat: varchar("etat").default('bon'),
  seuilAlerte: integer("seuil_alerte").default(5),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employés
export const employes = pgTable("employes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  prenom: varchar("prenom").notNull(),
  telephone: varchar("telephone"),
  email: varchar("email"),
  adresse: text("adresse"),
  role: varchar("role"),
  dateEmbauche: date("date_embauche"),
  qualifications: text("qualifications"),
  soldeEpargne: decimal("solde_epargne", { precision: 10, scale: 2 }).default('0'),
  actif: boolean("actif").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tâches
export const taches = pgTable("taches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titre: varchar("titre").notNull(),
  description: text("description"),
  employeId: varchar("employe_id"),
  dateLimite: timestamp("date_limite"),
  status: taskStatusEnum("status").default('a_faire'),
  dateCompletee: timestamp("date_completee"),
  priorite: varchar("priorite").default('normale'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Épargne salariale
export const epargneSalariale = pgTable("epargne_salariale", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeId: varchar("employe_id").notNull(),
  type: varchar("type").notNull(), // 'versement' ou 'restitution'
  montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
  dateTransaction: timestamp("date_transaction").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  telephone: varchar("telephone"),
  email: varchar("email"),
  adresse: text("adresse"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ventes
export const ventes = pgTable("ventes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id"),
  dateVente: timestamp("date_vente").notNull(),
  typeVente: varchar("type_vente").notNull(), // 'chair' ou 'reproducteur'
  poidsTotal: decimal("poids_total", { precision: 10, scale: 2 }),
  prixParKg: decimal("prix_par_kg", { precision: 10, scale: 2 }),
  prixUnitaire: decimal("prix_unitaire", { precision: 10, scale: 2 }),
  montantTotal: decimal("montant_total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Détails ventes (lapins vendus)
export const detailsVentes = pgTable("details_ventes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venteId: varchar("vente_id").notNull(),
  lapinId: varchar("lapin_id").notNull(),
  poids: decimal("poids", { precision: 5, scale: 2 }),
  prix: decimal("prix", { precision: 10, scale: 2 }).notNull(),
});

// Achats lapins
export const achatsLapins = pgTable("achats_lapins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fournisseurId: varchar("fournisseur_id"),
  dateAchat: timestamp("date_achat").notNull(),
  nombreLapins: integer("nombre_lapins").notNull(),
  prixTotal: decimal("prix_total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Catégories de dépenses
export const categoriesDepenses = pgTable("categories_depenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull().unique(),
  description: text("description"),
  couleur: varchar("couleur").default('#6b7280'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dépenses
export const depenses = pgTable("depenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categorieId: varchar("categorie_id").notNull(),
  montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
  dateDepense: timestamp("date_depense").notNull(),
  description: text("description").notNull(),
  fournisseurId: varchar("fournisseur_id"),
  facture: varchar("facture"), // référence facture
  createdAt: timestamp("created_at").defaultNow(),
});

// Comptes bancaires/mobile money
export const comptes = pgTable("comptes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: varchar("nom").notNull(),
  type: accountTypeEnum("type").notNull(),
  numeroCompte: varchar("numero_compte"),
  soldeInitial: decimal("solde_initial", { precision: 15, scale: 2 }).default('0'),
  soldeActuel: decimal("solde_actuel", { precision: 15, scale: 2 }).default('0'),
  actif: boolean("actif").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions bancaires
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  compteId: varchar("compte_id").notNull(),
  compteDestinationId: varchar("compte_destination_id"), // pour virements internes
  type: transactionTypeEnum("type").notNull(),
  montant: decimal("montant", { precision: 15, scale: 2 }).notNull(),
  dateTransaction: timestamp("date_transaction").notNull(),
  description: text("description").notNull(),
  categorie: varchar("categorie"),
  reference: varchar("reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const lapinsRelations = relations(lapins, ({ one, many }) => ({
  pere: one(lapins, {
    fields: [lapins.pereId],
    references: [lapins.id],
    relationName: "parent_pere"
  }),
  mere: one(lapins, {
    fields: [lapins.mereId],
    references: [lapins.id],
    relationName: "parent_mere"
  }),
  enclos: one(enclos, {
    fields: [lapins.enclosId],
    references: [enclos.id],
  }),
  enfants: many(lapins, { relationName: "parent_pere" }),
  enfantsMere: many(lapins, { relationName: "parent_mere" }),
  pesees: many(pesees),
  traitements: many(traitements),
  detailsVentes: many(detailsVentes),
}));

export const enclosRelations = relations(enclos, ({ many }) => ({
  lapins: many(lapins),
}));

export const accouplementsRelations = relations(accouplements, ({ one, many }) => ({
  femelle: one(lapins, {
    fields: [accouplements.femelleId],
    references: [lapins.id],
  }),
  male: one(lapins, {
    fields: [accouplements.maleId],
    references: [lapins.id],
  }),
  misesBas: many(misesBas),
}));

export const misesBasRelations = relations(misesBas, ({ one, many }) => ({
  accouplement: one(accouplements, {
    fields: [misesBas.accouplementId],
    references: [accouplements.id],
  }),
  portees: many(portees),
}));

export const porteesRelations = relations(portees, ({ one, many }) => ({
  miseBas: one(misesBas, {
    fields: [portees.miseBasId],
    references: [misesBas.id],
  }),
  pesees: many(pesees),
}));

export const traitementsRelations = relations(traitements, ({ one }) => ({
  lapin: one(lapins, {
    fields: [traitements.lapinId],
    references: [lapins.id],
  }),
  medicament: one(medicaments, {
    fields: [traitements.medicamentId],
    references: [medicaments.id],
  }),
  employe: one(employes, {
    fields: [traitements.employeId],
    references: [employes.id],
  }),
}));

export const ventesRelations = relations(ventes, ({ one, many }) => ({
  client: one(clients, {
    fields: [ventes.clientId],
    references: [clients.id],
  }),
  details: many(detailsVentes),
}));

export const detailsVentesRelations = relations(detailsVentes, ({ one }) => ({
  vente: one(ventes, {
    fields: [detailsVentes.venteId],
    references: [ventes.id],
  }),
  lapin: one(lapins, {
    fields: [detailsVentes.lapinId],
    references: [lapins.id],
  }),
}));

export const depensesRelations = relations(depenses, ({ one }) => ({
  categorie: one(categoriesDepenses, {
    fields: [depenses.categorieId],
    references: [categoriesDepenses.id],
  }),
  fournisseur: one(fournisseurs, {
    fields: [depenses.fournisseurId],
    references: [fournisseurs.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  compte: one(comptes, {
    fields: [transactions.compteId],
    references: [comptes.id],
  }),
  compteDestination: one(comptes, {
    fields: [transactions.compteDestinationId],
    references: [comptes.id],
  }),
}));

// Insert schemas
export const insertLapinSchema = createInsertSchema(lapins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnclosSchema = createInsertSchema(enclos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccouplementSchema = createInsertSchema(accouplements).omit({
  id: true,
  createdAt: true,
});

export const insertMiseBasSchema = createInsertSchema(misesBas).omit({
  id: true,
  createdAt: true,
});

export const insertVenteSchema = createInsertSchema(ventes).omit({
  id: true,
  createdAt: true,
});

export const insertDepenseSchema = createInsertSchema(depenses).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeSchema = createInsertSchema(employes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLapin = z.infer<typeof insertLapinSchema>;
export type Lapin = typeof lapins.$inferSelect;
export type InsertEnclos = z.infer<typeof insertEnclosSchema>;
export type Enclos = typeof enclos.$inferSelect;
export type InsertAccouplement = z.infer<typeof insertAccouplementSchema>;
export type Accouplement = typeof accouplements.$inferSelect;
export type InsertMiseBas = z.infer<typeof insertMiseBasSchema>;
export type MiseBas = typeof misesBas.$inferSelect;
export type InsertVente = z.infer<typeof insertVenteSchema>;
export type Vente = typeof ventes.$inferSelect;
export type InsertDepense = z.infer<typeof insertDepenseSchema>;
export type Depense = typeof depenses.$inferSelect;
export type InsertEmploye = z.infer<typeof insertEmployeSchema>;
export type Employe = typeof employes.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
