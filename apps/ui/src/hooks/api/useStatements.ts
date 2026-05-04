import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { Statement, StatementLine } from '../../types/expenses';

export const statementKeys = {
  all: ['statements'] as const,
  lists: () => [...statementKeys.all, 'list'] as const,
  list: (familyId: string) => [...statementKeys.lists(), familyId] as const,
  details: () => [...statementKeys.all, 'detail'] as const,
  detail: (id: string) => [...statementKeys.details(), id] as const,
  lines: (statementId: string) => [...statementKeys.all, 'lines', statementId] as const,
};

export interface CreateStatementRequest {
  accountId: string;
  fileName: string;
  periodStart: string;
  periodEnd: string;
  mappingTemplateId?: string;
}

export interface CreateStatementLineRequest {
  date: string;
  description: string;
  amount: number;
  currency?: string;
  categoryGuess?: string;
  isChildExpense?: boolean;
  requiresApproval?: boolean;
}

export interface UpdateStatementLineRequest {
  categoryGuess?: string;
  isChildExpense?: boolean;
  requiresApproval?: boolean;
}

export function useStatements(familyId: string | undefined) {
  return useQuery({
    queryKey: statementKeys.list(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Statement[]>(`/families/${familyId}/statements`);
      return data;
    },
    enabled: !!familyId,
  });
}

export function useStatementLines(familyId: string | undefined, statementId: string | undefined) {
  return useQuery({
    queryKey: statementKeys.lines(statementId!),
    queryFn: async () => {
      const { data } = await apiClient.get<StatementLine[]>(
        `/families/${familyId}/statements/${statementId}/lines`,
      );
      return data;
    },
    enabled: !!familyId && !!statementId,
  });
}

export function useCreateStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, ...request }: CreateStatementRequest & { familyId: string }) => {
      const { data } = await apiClient.post<Statement>(`/families/${familyId}/statements`, request);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statementKeys.list(variables.familyId) });
    },
  });
}

export function useCreateStatementLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      statementId,
      lines,
    }: {
      familyId: string;
      statementId: string;
      lines: CreateStatementLineRequest[];
    }) => {
      const { data } = await apiClient.post<StatementLine[]>(
        `/families/${familyId}/statements/${statementId}/lines`,
        { lines },
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statementKeys.lines(variables.statementId) });
    },
  });
}

export function useUpdateStatementLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      statementId,
      lineId,
      ...request
    }: UpdateStatementLineRequest & {
      familyId: string;
      statementId: string;
      lineId: string;
    }) => {
      const { data } = await apiClient.patch<StatementLine>(
        `/families/${familyId}/statements/${statementId}/lines/${lineId}`,
        request,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statementKeys.lines(variables.statementId) });
    },
  });
}

export function useDeleteStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/statements/${id}`);
      return { id, familyId };
    },
    onSuccess: ({ familyId }) => {
      queryClient.invalidateQueries({ queryKey: statementKeys.list(familyId) });
    },
  });
}
