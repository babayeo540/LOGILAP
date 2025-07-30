import {
  users,
  lapins,
  enclos,
  accouplements,
  misesBas,
  portees,
  pesees,
  fournisseurs,
  medicaments,
  traitements,
  aliments,
  consommationAliments,
  materiel,
  employes,
  taches,
  epargneSalariale,
  clients,
  ventes,
  detailsVentes,
  achatsLapins,
  categoriesDepenses,
  depenses,
  comptes,
  transactions,
  type User,
  type UpsertUser,
  type Lapin,
  type InsertLapin,
  type Enclos,
  type InsertEnclos,
  type Accouplement,
  type InsertAccouplement,
  type MiseBas,
  type InsertMiseBas,
  type Vente,
  type InsertVente,
  type Depense,
  type InsertDepense,
  type Employe,
  type InsertEmploye,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, count, sum, avg } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Lapins
  getLapins(): Promise<Lapin[]>;
  getLapin(id: string): Promise<Lapin | undefined>;
  createLapin(lapin: InsertLapin): Promise<Lapin>;
  updateLapin(id: string, lapin: Partial<InsertLapin>): Promise<Lapin>;
  deleteLapin(id: string): Promise<void>;
  getLapinsByStatus(status: string): Promise<Lapin[]>;
  getLapinsByEnclos(enclosId: string): Promise<Lapin[]>;

  // Enclos
  getEnclos(): Promise<Enclos[]>;
  getEnclosById(id: string): Promise<Enclos | undefined>;
  createEnclos(enclos: InsertEnclos): Promise<Enclos>;
  updateEnclos(id: string, enclos: Partial<InsertEnclos>): Promise<Enclos>;
  deleteEnclos(id: string): Promise<void>;

  // Accouplements
  getAccouplements(): Promise<Accouplement[]>;
  createAccouplement(accouplement: InsertAccouplement): Promise<Accouplement>;
  getAccouplementsByDate(startDate: Date, endDate: Date): Promise<Accouplement[]>;

  // Mises bas
  getMisesBas(): Promise<MiseBas[]>;
  createMiseBas(miseBas: InsertMiseBas): Promise<MiseBas>;
  getMisesBasByDate(startDate: Date, endDate: Date): Promise<MiseBas[]>;

  // Ventes
  getVentes(): Promise<Vente[]>;
  createVente(vente: InsertVente): Promise<Vente>;
  deleteVente(id: string): Promise<void>;
  getVentesByDate(startDate: Date, endDate: Date): Promise<Vente[]>;

  // Dépenses
  getDepenses(): Promise<Depense[]>;
  createDepense(depense: InsertDepense): Promise<Depense>;
  deleteDepense(id: string): Promise<void>;
  getDepensesByCategorie(categorieId: string): Promise<Depense[]>;
  getDepensesByDate(startDate: Date, endDate: Date): Promise<Depense[]>;

  // Employés
  getEmployes(): Promise<Employe[]>;
  createEmploye(employe: InsertEmploye): Promise<Employe>;
  updateEmploye(id: string, employe: Partial<InsertEmploye>): Promise<Employe>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByCompte(compteId: string): Promise<Transaction[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalLapins: number;
    activeBreeders: number;
    expectedBirths: number;
    readyToSell: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    netProfit: number;
    availableCash: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Lapins
  async getLapins(): Promise<Lapin[]> {
    return await db.select().from(lapins).orderBy(desc(lapins.createdAt));
  }

  async getLapin(id: string): Promise<Lapin | undefined> {
    const [lapin] = await db.select().from(lapins).where(eq(lapins.id, id));
    return lapin;
  }

  async createLapin(lapin: InsertLapin): Promise<Lapin> {
    const [newLapin] = await db.insert(lapins).values(lapin).returning();
    return newLapin;
  }

  async updateLapin(id: string, lapin: Partial<InsertLapin>): Promise<Lapin> {
    const [updatedLapin] = await db
      .update(lapins)
      .set({ ...lapin, updatedAt: new Date() })
      .where(eq(lapins.id, id))
      .returning();
    return updatedLapin;
  }

  async deleteLapin(id: string): Promise<void> {
    await db.delete(lapins).where(eq(lapins.id, id));
  }

  async getLapinsByStatus(status: string): Promise<Lapin[]> {
    return await db.select().from(lapins).where(eq(lapins.status, status as any));
  }

  async getLapinsByEnclos(enclosId: string): Promise<Lapin[]> {
    return await db.select().from(lapins).where(eq(lapins.enclosId, enclosId));
  }

  // Enclos
  async getEnclos(): Promise<Enclos[]> {
    return await db.select().from(enclos).orderBy(enclos.nom);
  }

  async getEnclosById(id: string): Promise<Enclos | undefined> {
    const [enclosItem] = await db.select().from(enclos).where(eq(enclos.id, id));
    return enclosItem;
  }

  async createEnclos(enclosData: InsertEnclos): Promise<Enclos> {
    const [newEnclos] = await db.insert(enclos).values(enclosData).returning();
    return newEnclos;
  }

  async updateEnclos(id: string, enclosData: Partial<InsertEnclos>): Promise<Enclos> {
    const [updatedEnclos] = await db
      .update(enclos)
      .set({ ...enclosData, updatedAt: new Date() })
      .where(eq(enclos.id, id))
      .returning();
    return updatedEnclos;
  }

  async deleteEnclos(id: string): Promise<void> {
    await db.delete(enclos).where(eq(enclos.id, id));
  }

  // Accouplements
  async getAccouplements(): Promise<Accouplement[]> {
    return await db.select().from(accouplements).orderBy(desc(accouplements.dateAccouplement));
  }

  async createAccouplement(accouplement: InsertAccouplement): Promise<Accouplement> {
    const [newAccouplement] = await db.insert(accouplements).values(accouplement).returning();
    return newAccouplement;
  }

  async getAccouplementsByDate(startDate: Date, endDate: Date): Promise<Accouplement[]> {
    return await db
      .select()
      .from(accouplements)
      .where(and(
        gte(accouplements.dateAccouplement, startDate),
        lte(accouplements.dateAccouplement, endDate)
      ));
  }

  // Mises bas
  async getMisesBas(): Promise<MiseBas[]> {
    return await db.select().from(misesBas).orderBy(desc(misesBas.dateMiseBas));
  }

  async createMiseBas(miseBas: InsertMiseBas): Promise<MiseBas> {
    const [newMiseBas] = await db.insert(misesBas).values(miseBas).returning();
    return newMiseBas;
  }

  async getMisesBasByDate(startDate: Date, endDate: Date): Promise<MiseBas[]> {
    return await db
      .select()
      .from(misesBas)
      .where(and(
        gte(misesBas.dateMiseBas, startDate),
        lte(misesBas.dateMiseBas, endDate)
      ));
  }

  // Ventes
  async getVentes(): Promise<Vente[]> {
    return await db.select().from(ventes).orderBy(desc(ventes.dateVente));
  }

  async createVente(vente: InsertVente): Promise<Vente> {
    const [newVente] = await db.insert(ventes).values(vente).returning();
    return newVente;
  }

  async deleteVente(id: string): Promise<void> {
    await db.delete(ventes).where(eq(ventes.id, id));
  }

  async getVentesByDate(startDate: Date, endDate: Date): Promise<Vente[]> {
    return await db
      .select()
      .from(ventes)
      .where(and(
        gte(ventes.dateVente, startDate),
        lte(ventes.dateVente, endDate)
      ));
  }

  // Dépenses
  async getDepenses(): Promise<Depense[]> {
    return await db.select().from(depenses).orderBy(desc(depenses.dateDepense));
  }

  async createDepense(depense: InsertDepense): Promise<Depense> {
    const [newDepense] = await db.insert(depenses).values(depense).returning();
    return newDepense;
  }

  async deleteDepense(id: string): Promise<void> {
    await db.delete(depenses).where(eq(depenses.id, id));
  }

  async getDepensesByCategorie(categorieId: string): Promise<Depense[]> {
    return await db.select().from(depenses).where(eq(depenses.categorieId, categorieId));
  }

  async getDepensesByDate(startDate: Date, endDate: Date): Promise<Depense[]> {
    return await db
      .select()
      .from(depenses)
      .where(and(
        gte(depenses.dateDepense, startDate),
        lte(depenses.dateDepense, endDate)
      ));
  }

  // Employés
  async getEmployes(): Promise<Employe[]> {
    return await db.select().from(employes).where(eq(employes.actif, true));
  }

  async createEmploye(employe: InsertEmploye): Promise<Employe> {
    const [newEmploye] = await db.insert(employes).values(employe).returning();
    return newEmploye;
  }

  async updateEmploye(id: string, employe: Partial<InsertEmploye>): Promise<Employe> {
    const [updatedEmploye] = await db
      .update(employes)
      .set({ ...employe, updatedAt: new Date() })
      .where(eq(employes.id, id))
      .returning();
    return updatedEmploye;
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.dateTransaction));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionsByCompte(compteId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.compteId, compteId));
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalLapins: number;
    activeBreeders: number;
    expectedBirths: number;
    readyToSell: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    netProfit: number;
    availableCash: number;
  }> {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Total lapins
    const [totalLapinsResult] = await db
      .select({ count: count() })
      .from(lapins)
      .where(eq(lapins.status, 'reproducteur'));

    // Active breeders
    const [activeBreedersResult] = await db
      .select({ count: count() })
      .from(lapins)
      .where(eq(lapins.status, 'reproducteur'));

    // Expected births (approximation - would need proper calculation)
    const expectedBirths = 23; // Mock data - would calculate from accouplements

    // Ready to sell
    const [readyToSellResult] = await db
      .select({ count: count() })
      .from(lapins)
      .where(eq(lapins.status, 'stock_a_vendre'));

    // Monthly revenue
    const [monthlyRevenueResult] = await db
      .select({ total: sum(ventes.montantTotal) })
      .from(ventes)
      .where(and(
        gte(ventes.dateVente, startOfMonth),
        lte(ventes.dateVente, endOfMonth)
      ));

    // Monthly expenses
    const [monthlyExpensesResult] = await db
      .select({ total: sum(depenses.montant) })
      .from(depenses)
      .where(and(
        gte(depenses.dateDepense, startOfMonth),
        lte(depenses.dateDepense, endOfMonth)
      ));

    // Available cash (sum of all account balances)
    const [availableCashResult] = await db
      .select({ total: sum(comptes.soldeActuel) })
      .from(comptes)
      .where(eq(comptes.actif, true));

    const monthlyRevenue = Number(monthlyRevenueResult?.total || 0);
    const monthlyExpenses = Number(monthlyExpensesResult?.total || 0);

    return {
      totalLapins: totalLapinsResult?.count || 0,
      activeBreeders: activeBreedersResult?.count || 0,
      expectedBirths,
      readyToSell: readyToSellResult?.count || 0,
      monthlyRevenue,
      monthlyExpenses,
      netProfit: monthlyRevenue - monthlyExpenses,
      availableCash: Number(availableCashResult?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();
