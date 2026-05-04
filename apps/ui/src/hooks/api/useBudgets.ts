import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { Budget } from '../../types/expenses';

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (familyId: string, month?: string) =>
    [...budgetKeys.lists(), familyId, ...(month ? [month] : [])] as const,
};

export interface CreateBudgetRequest {
  categoryId: string;
  month: string;
  limit: number;
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {}

export function useBudgets(familyId: string | undefined, month?: string) {
  return useQuery({
    queryKey: budgetKeys.list(familyId!, month),
    queryFn: async () => {
      const params = month ? `?month=${month}` : '';
      const { data } = await apiClient.get<Budget[]>(`/families/${familyId}/budgets${params}`);
      return data;
    },
    enabled: !!familyId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, ...request }: CreateBudgetRequest & { familyId: string }) => {
      const { data } = await apiClient.post<Budget>(`/families/${familyId}/budgets`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      familyId,
      ...request
    }: UpdateBudgetRequest & { id: string; familyId: string }) => {
      const { data } = await apiClient.put<Budget>(`/families/${familyId}/budgets/${id}`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/budgets/${id}`);
      return { id, familyId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}
