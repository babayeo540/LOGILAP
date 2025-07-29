import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionFormProps {
  transaction?: any;
  comptes: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ transaction, comptes, onSuccess, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: transaction?.type || "depot",
    montant: transaction?.montant || 0,
    compteId: transaction?.compteId || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split('T')[0],
    reference: transaction?.reference || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating/updating transaction:", formData);
    onSuccess();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type de transaction</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="depot">Dépôt</option>
              <option value="retrait">Retrait</option>
              <option value="virement">Virement</option>
            </select>
          </div>

          <div>
            <Label htmlFor="montant">Montant (€)</Label>
            <Input
              id="montant"
              type="number"
              step="0.01"
              value={formData.montant}
              onChange={(e) => setFormData({...formData, montant: parseFloat(e.target.value) || 0})}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="compteId">Compte</Label>
            <select
              id="compteId"
              value={formData.compteId}
              onChange={(e) => setFormData({...formData, compteId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner un compte</option>
              {comptes.map((compte) => (
                <option key={compte.id} value={compte.id}>
                  {compte.nom} - {compte.banque}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ex: Vente lapins juillet"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
              placeholder="Ex: CHQ-001"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {transaction ? "Modifier" : "Enregistrer"} la transaction
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