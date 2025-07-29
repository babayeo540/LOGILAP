import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface CompteFormProps {
  compte?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CompteForm({ compte, onSuccess, onCancel }: CompteFormProps) {
  const [formData, setFormData] = useState({
    nom: compte?.nom || "",
    type: compte?.type || "banque",
    numero: compte?.numero || "",
    banque: compte?.banque || "",
    soldeInitial: compte?.soldeInitial || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating/updating compte:", formData);
    onSuccess();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom du compte</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Ex: Compte principal"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type de compte</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="banque">Compte bancaire</option>
              <option value="especes">Espèces</option>
              <option value="epargne">Compte épargne</option>
            </select>
          </div>

          <div>
            <Label htmlFor="numero">Numéro de compte</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData({...formData, numero: e.target.value})}
              placeholder="Ex: FR76 1234 5678 9012 3456 78"
            />
          </div>

          <div>
            <Label htmlFor="banque">Banque</Label>
            <Input
              id="banque"
              value={formData.banque}
              onChange={(e) => setFormData({...formData, banque: e.target.value})}
              placeholder="Ex: Crédit Agricole"
            />
          </div>

          <div>
            <Label htmlFor="soldeInitial">Solde initial (€)</Label>
            <Input
              id="soldeInitial"
              type="number"
              step="0.01"
              value={formData.soldeInitial}
              onChange={(e) => setFormData({...formData, soldeInitial: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {compte ? "Modifier" : "Créer"} le compte
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}