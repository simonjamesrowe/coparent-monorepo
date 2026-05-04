import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { CsvMappingTemplate, CsvMappings } from '../../types/expenses';

export const csvTemplateKeys = {
  all: ['csv-mapping-templates'] as const,
  lists: () => [...csvTemplateKeys.all, 'list'] as const,
  list: (familyId: string) => [...csvTemplateKeys.lists(), familyId] as const,
  presets: (familyId: string) => [...csvTemplateKeys.all, 'presets', familyId] as const,
};

export interface CreateCsvMappingTemplateRequest {
  accountId?: string;
  name: string;
  mappings: CsvMappings;
  delimiter?: string;
  hasHeaderRow?: boolean;
}

export function useCsvMappingTemplates(familyId: string | undefined) {
  return useQuery({
    queryKey: csvTemplateKeys.list(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<CsvMappingTemplate[]>(
        `/families/${familyId}/csv-mapping-templates`,
      );
      return data;
    },
    enabled: !!familyId,
  });
}

export function useCsvMappingPresets(familyId: string | undefined) {
  return useQuery({
    queryKey: csvTemplateKeys.presets(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<CsvMappingTemplate[]>(
        `/families/${familyId}/csv-mapping-templates/presets`,
      );
      return data;
    },
    enabled: !!familyId,
  });
}

export function useCreateCsvMappingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      familyId,
      ...request
    }: CreateCsvMappingTemplateRequest & { familyId: string }) => {
      const { data } = await apiClient.post<CsvMappingTemplate>(
        `/families/${familyId}/csv-mapping-templates`,
        request,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: csvTemplateKeys.list(variables.familyId) });
    },
  });
}

export function useDeleteCsvMappingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/csv-mapping-templates/${id}`);
      return { id, familyId };
    },
    onSuccess: ({ familyId }) => {
      queryClient.invalidateQueries({ queryKey: csvTemplateKeys.list(familyId) });
    },
  });
}

export function useSeedCsvMappingPresets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId }: { familyId: string }) => {
      const { data } = await apiClient.post<CsvMappingTemplate[]>(
        `/families/${familyId}/csv-mapping-templates/seed-presets`,
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: csvTemplateKeys.list(variables.familyId) });
      queryClient.invalidateQueries({ queryKey: csvTemplateKeys.presets(variables.familyId) });
    },
  });
}
