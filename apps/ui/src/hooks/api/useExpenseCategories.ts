import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { Category } from '../../types/expenses';

export const expenseCategoryKeys = {
  all: ['expense-categories'] as const,
  lists: () => [...expenseCategoryKeys.all, 'list'] as const,
  list: (familyId: string) => [...expenseCategoryKeys.lists(), familyId] as const,
};

export interface CreateExpenseCategoryRequest {
  name: string;
  type?: 'predefined' | 'custom';
  color: string;
}

export function useExpenseCategories(familyId: string | undefined) {
  return useQuery({
    queryKey: expenseCategoryKeys.list(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>(`/families/${familyId}/expense-categories`);
      return data;
    },
    enabled: !!familyId,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      ...request
    }: CreateExpenseCategoryRequest & { familyId: string }) => {
      const { data } = await apiClient.post<Category>(
        `/families/${familyId}/expense-categories`,
        request,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseCategoryKeys.list(variables.familyId),
      });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      familyId,
      ...request
    }: CreateExpenseCategoryRequest & { id: string; familyId: string }) => {
      const { data } = await apiClient.put<Category>(
        `/families/${familyId}/expense-categories/${id}`,
        request,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseCategoryKeys.list(variables.familyId),
      });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/expense-categories/${id}`);
      return { id, familyId };
    },
    onSuccess: ({ familyId }) => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.list(familyId) });
    },
  });
}

export function useSeedExpenseCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId }: { familyId: string }) => {
      const { data } = await apiClient.post<Category[]>(
        `/families/${familyId}/expense-categories/seed`,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseCategoryKeys.list(variables.familyId),
      });
    },
  });
}
