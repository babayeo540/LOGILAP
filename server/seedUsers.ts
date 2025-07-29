import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function createDemoUsers() {
  try {
    // Vérifier si les utilisateurs existent déjà
    const adminExists = await storage.getUserByUsername("admin");
    const employeExists = await storage.getUserByUsername("employe");

    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 12);
      await storage.createUser({
        username: "admin",
        password: hashedAdminPassword,
        email: "admin@lapgest.com",
        firstName: "Jean",
        lastName: "Dubois",
        role: "manager",
        profileImageUrl: ""
      });
      console.log("✓ Utilisateur admin créé (admin/admin123)");
    }

    if (!employeExists) {
      const hashedEmpPassword = await bcrypt.hash("emp123", 12);
      await storage.createUser({
        username: "employe",
        password: hashedEmpPassword,
        email: "employe@lapgest.com",
        firstName: "Marie",
        lastName: "Martin",
        role: "employee",
        profileImageUrl: ""
      });
      console.log("✓ Utilisateur employé créé (employe/emp123)");
    }

    console.log("✓ Utilisateurs de démonstration vérifiés");
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs de démonstration:", error);
  }
}