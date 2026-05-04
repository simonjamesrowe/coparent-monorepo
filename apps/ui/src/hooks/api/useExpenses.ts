import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { Expense, ExpenseStatus } from '../../types/expenses';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (familyId: string) => [...expenseKeys.lists(), familyId] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

export interface CreateExpenseRequest {
  childId?: string | null;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  status?: ExpenseStatus;
  requiresApproval?: boolean;
  source?: 'manual' | 'statement';
  sourceStatementLineId?: string;
  receiptUrl?: string | null;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export function useExpenses(familyId: string | undefined) {
  return useQuery({
    queryKey: expenseKeys.list(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Expense[]>(`/families/${familyId}/expenses`);
      return data;
    },
    enabled: !!familyId,
  });
}

export function useExpense(expenseId: string | undefined, familyId: string | undefined) {
  return useQuery({
    queryKey: expenseKeys.detail(expenseId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Expense>(`/families/${familyId}/expenses/${expenseId}`);
      return data;
    },
    enabled: !!expenseId && !!familyId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, ...request }: CreateExpenseRequest & { familyId: string }) => {
      const { data } = await apiClient.post<Expense>(`/families/${familyId}/expenses`, request);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.list(variables.familyId) });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      familyId,
      ...request
    }: UpdateExpenseRequest & { id: string; familyId: string }) => {
      const { data } = await apiClient.put<Expense>(
        `/families/${familyId}/expenses/${id}`,
        request,
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.list(variables.familyId) });
      queryClient.setQueryData(expenseKeys.detail(data.id), data);
    },
  });
}

export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      familyId,
      status,
    }: {
      id: string;
      familyId: string;
      status: 'approved' | 'denied' | 'reimbursed';
    }) => {
      const { data } = await apiClient.patch<Expense>(
        `/families/${familyId}/expenses/${id}/status`,
        { status },
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.list(variables.familyId) });
      queryClient.setQueryData(expenseKeys.detail(data.id), data);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/expenses/${id}`);
      return { id, familyId };
    },
    onSuccess: ({ familyId }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.list(familyId) });
    },
  });
}
