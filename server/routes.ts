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

  const httpServer = createServer(app);
  return httpServer;
}
