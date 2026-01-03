import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../../lib/api/client';
import type { Event } from '../../types/calendar';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (familyId: string) => [...eventKeys.lists(), familyId] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export interface CreateEventRequest {
  type: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  parentId?: string | null;
  parentIds?: string[];
  childIds: string[];
  location?: string;
  notes?: string | null;
  recurring?: {
    frequency: 'daily' | 'weekly';
    days?: string[];
  } | null;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export function useEvents(familyId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.list(familyId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Event[]>(`/families/${familyId}/events`);
      return data;
    },
    enabled: !!familyId,
  });
}

export function useEvent(eventId: string | undefined, familyId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(eventId!),
    queryFn: async () => {
      const { data } = await apiClient.get<Event>(`/families/${familyId}/events/${eventId}`);
      return data;
    },
    enabled: !!eventId && !!familyId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, ...request }: CreateEventRequest & { familyId: string }) => {
      const { data } = await apiClient.post<Event>(`/families/${familyId}/events`, request);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list(variables.familyId) });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      familyId,
      ...request
    }: UpdateEventRequest & { id: string; familyId: string }) => {
      const { data } = await apiClient.put<Event>(`/families/${familyId}/events/${id}`, request);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list(variables.familyId) });
      queryClient.setQueryData(eventKeys.detail(data.id), data);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, familyId }: { id: string; familyId: string }) => {
      await apiClient.delete(`/families/${familyId}/events/${id}`);
      return { id, familyId };
    },
    onSuccess: ({ familyId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.list(familyId) });
    },
  });
}
