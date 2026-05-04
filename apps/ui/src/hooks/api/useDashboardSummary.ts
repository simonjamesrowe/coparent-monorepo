import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { DashboardSummary } from '../../types/expenses';

export const dashboardSummaryKeys = {
  all: ['dashboard-summary'] as const,
  detail: (familyId: string, month: string) =>
    [...dashboardSummaryKeys.all, familyId, month] as const,
};

export function useDashboardSummary(familyId: string | undefined, month: string | undefined) {
  return useQuery({
    queryKey: dashboardSummaryKeys.detail(familyId!, month!),
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>(
        `/families/${familyId}/expenses/dashboard-summary?month=${month}`,
      );
      return data;
    },
    enabled: !!familyId && !!month,
  });
}
