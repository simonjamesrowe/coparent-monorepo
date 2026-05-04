import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { Account } from '../../types/expenses';

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (familyId: string) => [...accountKeys.lists(), familyId] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

export interface CreateAccountRequest {
  type: 'bank-account' | 'credit-card';
  bankName: string;
  accountName: string;
  last4: string;
  ownerParentId: string;
  accountSubtype?: 'checking' | 'savings';
  cardType?: 'visa' | 'mastercard' | 'amex';
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {}

export function useAccounts(familyId: string | undefined) {
  return useQuery({
    queryKey: accountKeys.list(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>(`/families/${familyId}/accounts`);
      return data;
    },
    enabled: !!familyId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, ...request }: CreateAccountRequest & { familyId: string }) => {
      const { data } = await apiClient.post<Account>(`/families/${familyId}/accounts`, request);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list(variables.familyId) });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      familyId,
      ...request
    }: UpdateAccountRequest & { id: string; familyId: string }) => {
      const { data } = await apiClient.put<Account>(
        `/families/${familyId}/accounts/${id}`,
        request,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list(variables.familyId) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/accounts/${id}`);
      return { id, familyId };
    },
    onSuccess: ({ familyId }) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list(familyId) });
    },
  });
}
