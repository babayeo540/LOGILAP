import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Vente, InsertVente } from '@shared/schema';

// Hook pour récupérer la généalogie d'un lapin
export function useLapinGenealogy(lapinId: string | null) {
  return useQuery({
    queryKey: ['lapin', lapinId, 'genealogy'],
    queryFn: async () => {
      if (!lapinId) return null;
      
      const response = await fetch(`/api/lapins/${lapinId}/genealogy`);
      if (!response.ok) {
        throw new Error('Failed to fetch lapin genealogy');
      }
      return response.json();
    },
    enabled: !!lapinId,
  });
}

// Hook pour créer une vente avec généalogie
export function useCreateVenteWithGenealogy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venteData: InsertVente): Promise<Vente> => {
      const response = await fetch('/api/ventes/avec-genealogie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create vente with genealogy');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache des ventes pour actualiser la liste
      queryClient.invalidateQueries({ queryKey: ['ventes'] });
    },
  });
}

// Types pour la généalogie
export interface GenealogyData {
  lapin: any;
  pere: any;
  mere: any;
  grandParents: {
    paternel: {
      pere: any;
      mere: any;
    };
    maternel: {
      pere: any;
      mere: any;
    };
  };
  enfants: any[];
}

export default {
  useLapinGenealogy,
  useCreateVenteWithGenealogy,
};
