import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour récupérer la planification du personnel
export function useEmployePlanning(startDate?: Date, endDate?: Date) {
  const queryParams = new URLSearchParams();
  
  if (startDate) {
    queryParams.append('startDate', startDate.toISOString());
  }
  if (endDate) {
    queryParams.append('endDate', endDate.toISOString());
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery({
    queryKey: ['planning', 'employes', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/employes/planning${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee planning');
      }
      return response.json();
    },
  });
}

// Hook pour créer une planification d'employé
export function useCreateEmployePlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planningData: any) => {
      const response = await fetch('/api/employes/planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planningData),
      });

      if (!response.ok) {
        throw new Error('Failed to create employee planning');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning', 'employes'] });
    },
  });
}

// Hook pour mettre à jour une planification d'employé
export function useUpdateEmployePlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, planningData }: { id: string; planningData: any }) => {
      const response = await fetch(`/api/employes/planning/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planningData),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee planning');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning', 'employes'] });
    },
  });
}

// Hook pour supprimer une planification d'employé
export function useDeleteEmployePlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employes/planning/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee planning');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning', 'employes'] });
    },
  });
}

// Hook pour récupérer les absences d'un employé
export function useEmployeAbsences(employeId: string) {
  return useQuery({
    queryKey: ['absences', employeId],
    queryFn: async () => {
      const response = await fetch(`/api/employes/${employeId}/absences`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee absences');
      }
      return response.json();
    },
    enabled: !!employeId,
  });
}

// Hook pour créer une absence d'employé
export function useCreateEmployeAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeId, absenceData }: { employeId: string; absenceData: any }) => {
      const response = await fetch(`/api/employes/${employeId}/absences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(absenceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create employee absence');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['absences', variables.employeId] });
    },
  });
}

// Hook pour approuver/refuser une absence d'employé
export function useApproveEmployeAbsence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const response = await fetch(`/api/employes/absences/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve employee absence');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
    },
  });
}

// Types pour la planification
export interface EmployePlanning {
  id: string;
  employeId: string;
  employe: {
    nom: string;
    prenom: string;
    role?: string;
  };
  dateDebut: Date;
  dateFin: Date;
  heuresParJour: number;
  joursTravailles: string[];
  poste: string;
  statut: string;
}

export interface EmployeAbsence {
  id: string;
  employeId: string;
  dateDebut: Date;
  dateFin: Date;
  motif: string;
  statut: 'en_attente' | 'approuve' | 'refuse';
  createdAt: Date;
}

export default {
  useEmployePlanning,
  useCreateEmployePlanning,
  useUpdateEmployePlanning,
  useDeleteEmployePlanning,
  useEmployeAbsences,
  useCreateEmployeAbsence,
  useApproveEmployeAbsence,
};
