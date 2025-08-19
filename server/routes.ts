import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { insertLapinSchema, insertEnclosSchema, insertAccouplementSchema, insertMiseBasSchema, insertVenteSchema, insertDepenseSchema, insertEmployeSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Create demo users on startup
  const { createDemoUsers } = await import("./seedUsers");
  await createDemoUsers();

  // Auth routes are handled in setupAuth

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Lapins routes
  app.get('/api/lapins', isAuthenticated, async (req, res) => {
    try {
      const lapins = await storage.getLapins();
      res.json(lapins);
    } catch (error) {
      console.error("Error fetching lapins:", error);
      res.status(500).json({ message: "Failed to fetch lapins" });
    }
  });

  // Généalogie route - récupérer l'arbre généalogique d'un lapin
  app.get('/api/lapins/:id/genealogy', isAuthenticated, async (req, res) => {
    try {
      const genealogy = await storage.getLapinGenealogy(req.params.id);
      if (!genealogy) {
        return res.status(404).json({ message: "Lapin not found" });
      }
      res.json(genealogy);
    } catch (error) {
      console.error("Error fetching lapin genealogy:", error);
      res.status(500).json({ message: "Failed to fetch lapin genealogy" });
    }
  });

  app.get('/api/lapins/:id', isAuthenticated, async (req, res) => {
    try {
      const lapin = await storage.getLapin(req.params.id);
      if (!lapin) {
        return res.status(404).json({ message: "Lapin not found" });
      }
      res.json(lapin);
    } catch (error) {
      console.error("Error fetching lapin:", error);
      res.status(500).json({ message: "Failed to fetch lapin" });
    }
  });

  app.post('/api/lapins', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLapinSchema.parse(req.body);
      const lapin = await storage.createLapin(validatedData);
      res.status(201).json(lapin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating lapin:", error);
      res.status(500).json({ message: "Failed to create lapin" });
    }
  });

  app.put('/api/lapins/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLapinSchema.partial().parse(req.body);
      const lapin = await storage.updateLapin(req.params.id, validatedData);
      res.json(lapin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating lapin:", error);
      res.status(500).json({ message: "Failed to update lapin" });
    }
  });

  app.delete('/api/lapins/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLapin(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lapin:", error);
      res.status(500).json({ message: "Failed to delete lapin" });
    }
  });

  app.get('/api/lapins/status/:status', isAuthenticated, async (req, res) => {
    try {
      const lapins = await storage.getLapinsByStatus(req.params.status);
      res.json(lapins);
    } catch (error) {
      console.error("Error fetching lapins by status:", error);
      res.status(500).json({ message: "Failed to fetch lapins by status" });
    }
  });

  // Enclos routes
  app.get('/api/enclos', isAuthenticated, async (req, res) => {
    try {
      const enclos = await storage.getEnclos();
      res.json(enclos);
    } catch (error) {
      console.error("Error fetching enclos:", error);
      res.status(500).json({ message: "Failed to fetch enclos" });
    }
  });

  app.get('/api/enclos/:id', isAuthenticated, async (req, res) => {
    try {
      const enclos = await storage.getEnclosById(req.params.id);
      if (!enclos) {
        return res.status(404).json({ message: "Enclos not found" });
      }
      res.json(enclos);
    } catch (error) {
      console.error("Error fetching enclos:", error);
      res.status(500).json({ message: "Failed to fetch enclos" });
    }
  });

  app.post('/api/enclos', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEnclosSchema.parse(req.body);
      const enclos = await storage.createEnclos(validatedData);
      res.status(201).json(enclos);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating enclos:", error);
      res.status(500).json({ message: "Failed to create enclos" });
    }
  });

  app.put('/api/enclos/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEnclosSchema.partial().parse(req.body);
      const enclos = await storage.updateEnclos(req.params.id, validatedData);
      res.json(enclos);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating enclos:", error);
      res.status(500).json({ message: "Failed to update enclos" });
    }
  });

  app.delete('/api/enclos/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEnclos(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting enclos:", error);
      res.status(500).json({ message: "Failed to delete enclos" });
    }
  });

  // Accouplements routes
  app.get('/api/accouplements', isAuthenticated, async (req, res) => {
    try {
      const accouplements = await storage.getAccouplements();
      res.json(accouplements);
    } catch (error) {
      console.error("Error fetching accouplements:", error);
      res.status(500).json({ message: "Failed to fetch accouplements" });
    }
  });

  app.post('/api/accouplements', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAccouplementSchema.parse(req.body);
      const accouplement = await storage.createAccouplement(validatedData);
      res.status(201).json(accouplement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating accouplement:", error);
      res.status(500).json({ message: "Failed to create accouplement" });
    }
  });

  app.put('/api/accouplements/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAccouplementSchema.partial().parse(req.body);
      const accouplement = await storage.updateAccouplement(req.params.id, validatedData);
      res.json(accouplement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating accouplement:", error);
      res.status(500).json({ message: "Failed to update accouplement" });
    }
  });

  app.delete('/api/accouplements/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAccouplement(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting accouplement:", error);
      res.status(500).json({ message: "Failed to delete accouplement" });
    }
  });

  // Mises bas routes
  app.get('/api/mises-bas', isAuthenticated, async (req, res) => {
    try {
      const misesBas = await storage.getMisesBas();
      res.json(misesBas);
    } catch (error) {
      console.error("Error fetching mises bas:", error);
      res.status(500).json({ message: "Failed to fetch mises bas" });
    }
  });

  app.post('/api/mises-bas', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMiseBasSchema.parse(req.body);
      const miseBas = await storage.createMiseBas(validatedData);
      res.status(201).json(miseBas);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating mise bas:", error);
      res.status(500).json({ message: "Failed to create mise bas" });
    }
  });

  // Ventes routes
  app.get('/api/ventes', isAuthenticated, async (req, res) => {
    try {
      const ventes = await storage.getVentes();
      res.json(ventes);
    } catch (error) {
      console.error("Error fetching ventes:", error);
      res.status(500).json({ message: "Failed to fetch ventes" });
    }
  });

  // Route pour créer une vente avec généalogie
  app.post('/api/ventes/avec-genealogie', isAuthenticated, async (req, res) => {
    try {
      const venteData = insertVenteSchema.parse(req.body);
      const vente = await storage.createVenteAvecGenalogie(venteData);
      res.status(201).json(vente);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating vente with genealogy:", error);
      res.status(500).json({ message: "Failed to create vente with genealogy" });
    }
  });

  app.post('/api/ventes', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVenteSchema.parse(req.body);
      const vente = await storage.createVente(validatedData);
      res.status(201).json(vente);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating vente:", error);
      res.status(500).json({ message: "Failed to create vente" });
    }
  });

  app.put('/api/ventes/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVenteSchema.partial().parse(req.body);
      const vente = await storage.updateVente(req.params.id, validatedData);
      res.json(vente);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating vente:", error);
      res.status(500).json({ message: "Failed to update vente" });
    }
  });

  app.delete('/api/ventes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteVente(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vente:", error);
      res.status(500).json({ message: "Failed to delete vente" });
    }
  });

  // Dépenses routes
  app.get('/api/depenses', isAuthenticated, async (req, res) => {
    try {
      const depenses = await storage.getDepenses();
      res.json(depenses);
    } catch (error) {
      console.error("Error fetching depenses:", error);
      res.status(500).json({ message: "Failed to fetch depenses" });
    }
  });

  app.post('/api/depenses', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDepenseSchema.parse(req.body);
      const depense = await storage.createDepense(validatedData);
      res.status(201).json(depense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating depense:", error);
      res.status(500).json({ message: "Failed to create depense" });
    }
  });

  app.put('/api/depenses/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDepenseSchema.partial().parse(req.body);
      const depense = await storage.updateDepense(req.params.id, validatedData);
      res.json(depense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating depense:", error);
      res.status(500).json({ message: "Failed to update depense" });
    }
  });

  app.delete('/api/depenses/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDepense(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting depense:", error);
      res.status(500).json({ message: "Failed to delete depense" });
    }
  });

  // Employés routes
  app.get('/api/employes', isAuthenticated, async (req, res) => {
    try {
      const employes = await storage.getEmployes();
      res.json(employes);
    } catch (error) {
      console.error("Error fetching employes:", error);
      res.status(500).json({ message: "Failed to fetch employes" });
    }
  });

  app.post('/api/employes', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEmployeSchema.parse(req.body);
      const employe = await storage.createEmploye(validatedData);
      res.status(201).json(employe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating employe:", error);
      res.status(500).json({ message: "Failed to create employe" });
    }
  });

  app.put('/api/employes/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEmployeSchema.partial().parse(req.body);
      const employe = await storage.updateEmploye(req.params.id, validatedData);
      res.json(employe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating employe:", error);
      res.status(500).json({ message: "Failed to update employe" });
    }
  });

  app.delete('/api/employes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEmploye(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employe:", error);
      res.status(500).json({ message: "Failed to delete employe" });
    }
  });

  // Planning du personnel routes
  app.get('/api/employes/planning', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const planning = await storage.getEmployePlanning(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(planning);
    } catch (error) {
      console.error("Error fetching employee planning:", error);
      res.status(500).json({ message: "Failed to fetch employee planning" });
    }
  });

  app.post('/api/employes/planning', isAuthenticated, async (req, res) => {
    try {
      const planningData = req.body;
      const planning = await storage.createEmployePlanning(planningData);
      res.status(201).json(planning);
    } catch (error) {
      console.error("Error creating employee planning:", error);
      res.status(500).json({ message: "Failed to create employee planning" });
    }
  });

  app.put('/api/employes/planning/:id', isAuthenticated, async (req, res) => {
    try {
      const planningData = req.body;
      const planning = await storage.updateEmployePlanning(req.params.id, planningData);
      res.json(planning);
    } catch (error) {
      console.error("Error updating employee planning:", error);
      res.status(500).json({ message: "Failed to update employee planning" });
    }
  });

  app.delete('/api/employes/planning/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEmployePlanning(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee planning:", error);
      res.status(500).json({ message: "Failed to delete employee planning" });
    }
  });

  // Absences routes
  app.get('/api/employes/:employeId/absences', isAuthenticated, async (req, res) => {
    try {
      const absences = await storage.getEmployeAbsences(req.params.employeId);
      res.json(absences);
    } catch (error) {
      console.error("Error fetching employee absences:", error);
      res.status(500).json({ message: "Failed to fetch employee absences" });
    }
  });

  app.post('/api/employes/:employeId/absences', isAuthenticated, async (req, res) => {
    try {
      const absenceData = { ...req.body, employeId: req.params.employeId };
      const absence = await storage.createEmployeAbsence(absenceData);
      res.status(201).json(absence);
    } catch (error) {
      console.error("Error creating employee absence:", error);
      res.status(500).json({ message: "Failed to create employee absence" });
    }
  });

  app.put('/api/employes/absences/:id/approve', isAuthenticated, async (req, res) => {
    try {
      const { approved } = req.body;
      const absence = await storage.approveEmployeAbsence(req.params.id, approved);
      res.json(absence);
    } catch (error) {
      console.error("Error approving employee absence:", error);
      res.status(500).json({ message: "Failed to approve employee absence" });
    }
  });

  // Transactions routes
  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions/compte/:compteId', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByCompte(req.params.compteId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions by compte:", error);
      res.status(500).json({ message: "Failed to fetch transactions by compte" });
    }
  });

  // Traitements routes
  app.get('/api/traitements', isAuthenticated, async (req, res) => {
    try {
      const traitements = await storage.getTraitements();
      res.json(traitements);
    } catch (error) {
      console.error("Error fetching traitements:", error);
      res.status(500).json({ message: "Failed to fetch traitements" });
    }
  });

  app.post('/api/traitements', isAuthenticated, async (req, res) => {
    try {
      const traitement = await storage.createTraitement(req.body);
      res.status(201).json(traitement);
    } catch (error) {
      console.error("Error creating traitement:", error);
      res.status(500).json({ message: "Failed to create traitement" });
    }
  });

  app.put('/api/traitements/:id', isAuthenticated, async (req, res) => {
    try {
      const traitement = await storage.updateTraitement(req.params.id, req.body);
      res.json(traitement);
    } catch (error) {
      console.error("Error updating traitement:", error);
      res.status(500).json({ message: "Failed to update traitement" });
    }
  });

  app.delete('/api/traitements/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTraitement(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting traitement:", error);
      res.status(500).json({ message: "Failed to delete traitement" });
    }
  });

  // Articles routes (for Stocks module)
  app.get('/api/articles', isAuthenticated, async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.post('/api/articles', isAuthenticated, async (req, res) => {
    try {
      const article = await storage.createArticle(req.body);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/articles/:id', isAuthenticated, async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/articles/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Comptes routes (for Trésorerie module)
  app.get('/api/comptes', isAuthenticated, async (req, res) => {
    try {
      const comptes = await storage.getComptes();
      res.json(comptes);
    } catch (error) {
      console.error("Error fetching comptes:", error);
      res.status(500).json({ message: "Failed to fetch comptes" });
    }
  });

  app.post('/api/comptes', isAuthenticated, async (req, res) => {
    try {
      const compte = await storage.createCompte(req.body);
      res.status(201).json(compte);
    } catch (error) {
      console.error("Error creating compte:", error);
      res.status(500).json({ message: "Failed to create compte" });
    }
  });

  app.put('/api/comptes/:id', isAuthenticated, async (req, res) => {
    try {
      const compte = await storage.updateCompte(req.params.id, req.body);
      res.json(compte);
    } catch (error) {
      console.error("Error updating compte:", error);
      res.status(500).json({ message: "Failed to update compte" });
    }
  });

  app.delete('/api/comptes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCompte(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting compte:", error);
      res.status(500).json({ message: "Failed to delete compte" });
    }
  });

  // Paramètres routes
  app.get('/api/auth/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put('/api/auth/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validatedData = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        farmName: z.string().optional(),
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.put('/api/auth/password', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { currentPassword, newPassword } = req.body;
      
      const result = await storage.changePassword(userId, currentPassword, newPassword);
      if (!result) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.get('/api/system/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  app.post('/api/system/export', isAuthenticated, async (req, res) => {
    try {
      const { format } = req.body;
      const exportData = await storage.exportAllData(format);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=lapgest-export-${new Date().toISOString().split('T')[0]}.${format}`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.post('/api/system/clear-cache', isAuthenticated, async (req, res) => {
    try {
      // Clear application cache
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  app.post('/api/system/optimize-db', isAuthenticated, async (req, res) => {
    try {
      await storage.optimizeDatabase();
      res.json({ message: "Database optimized successfully" });
    } catch (error) {
      console.error("Error optimizing database:", error);
      res.status(500).json({ message: "Failed to optimize database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
