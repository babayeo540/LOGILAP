import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Banknote, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Edit,
  Trash2,
  PiggyBank,
  Wallet
} from "lucide-react";
import CompteForm from "@/components/CompteForm";
import TransactionForm from "@/components/TransactionForm";
import ModuleNavigation from "@/components/ModuleNavigation";

export default function Tresorerie() {
  const [searchTerm, setSearchTerm] = useState("");
  const [compteFilter, setCompteFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCompteForm, setShowCompteForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingCompte, setEditingCompte] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch comptes from API
  const { data: comptes = [], isLoading: comptesLoading } = useQuery({
    queryKey: ['/api/comptes'],
  });

  // Fetch transactions from API
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Delete compte mutation
  const deleteCompteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/comptes/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comptes'] });
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      });
    },
  });

  // Utilisation des données réelles uniquement
  const comptesArray = Array.isArray(comptes) ? comptes : [];
  const transactionsArray = Array.isArray(transactions) ? transactions : [];

  const getCompteNom = (id: string) => {
    return comptesArray.find((c: any) => c.id === id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
    },
    {
      id: "3",
      nom: "Orange Money",
      type: "mobile_money",
      operateur: "Orange",
      numero: "+33612345678",
      solde: 450.25,
      dateOuverture: "2023-06-10",
      statut: "actif"
    },
    {
      id: "4",
      nom: "Wave",
      type: "mobile_money", 
      operateur: "Wave",
      numero: "+33687654321",
      solde: 150.00,
      dateOuverture: "2024-01-05",
      statut: "actif"
    },
    {
      id: "5",
      nom: "Caisse Espèces",
      type: "especes",
      solde: 850.50,
      dateOuverture: "2023-01-01",
      statut: "actif"
    }
  ];

  // Mock data pour les transactions

  const getCompteById = (id: string) => {
