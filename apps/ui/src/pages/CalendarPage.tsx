import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CalendarView } from '../components/calendar/CalendarView';
import { EventCreationDrawer } from '../components/calendar/EventCreationDrawer';
import {
  useFamilies,
  useParents,
  useChildren,
  useEvents,
  useScheduleChangeRequests,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useApproveScheduleChangeRequest,
  useDeclineScheduleChangeRequest,
} from '../hooks/api';
import type { Event, ScheduleChangeRequest, Parent, Child } from '../types/calendar';

const CalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: families = [], isLoading: familiesLoading } = useFamilies();
  const [activeFamilyId, setActiveFamilyId] = useState<string | undefined>();

  // Get drawer state from URL
  const isCreating = searchParams.get('create') === 'true';
  const editingEventId = searchParams.get('edit') || undefined;
  const isEditing = Boolean(editingEventId);
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data: parents = [] } = useParents(activeFamilyId);
  const { data: children = [] } = useChildren(activeFamilyId);
  const { data: events = [] } = useEvents(activeFamilyId);
  const { data: scheduleChangeRequests = [] } = useScheduleChangeRequests(activeFamilyId);

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const approveScheduleChangeRequest = useApproveScheduleChangeRequest();
  const declineScheduleChangeRequest = useDeclineScheduleChangeRequest();

  useEffect(() => {
    const [firstFamily] = families;
    if (!activeFamilyId && firstFamily) {
      setActiveFamilyId(firstFamily.id);
    }
  }, [activeFamilyId, families]);

  // Get current parent (the logged-in user)
  const currentParent = parents.find((p) => p.role === 'primary') || parents[0];
  const currentParentId = currentParent?.id || '';

  // Transform data to match component expectations
  const transformedParents: Parent[] = parents.map((p) => ({
    id: p.id,
    name: p.fullName.split(' ')[0] || p.fullName,
    fullName: p.fullName,
    email: p.email || '',
    color: p.color || (p.role === 'primary' ? 'violet' : 'sky'),
    avatarUrl: p.avatarUrl || null,
  }));

  const transformedChildren: Child[] = children.map((c) => ({
    id: c.id,
    name: c.fullName.split(' ')[0] || c.fullName,
    fullName: c.fullName,
    birthdate: c.dateOfBirth,
    avatarUrl: null,
  }));

  const transformedEvents: Event[] = events.map((e: Record<string, unknown>) => {
    const startDate = e.startDate
      ? new Date(e.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    return {
      id: (e._id || e.id) as string,
      type: e.type as string,
      title: e.title as string,
      startDate,
      endDate: e.endDate ? new Date(e.endDate as string).toISOString().split('T')[0] : undefined,
      startTime: e.startTime as string | undefined,
      endTime: e.endTime as string | undefined,
      allDay: Boolean(e.allDay),
      parentId: (e.parentId as { _id?: string } | string | null)?.['_id'] || e.parentId || null,
      parentIds: Array.isArray(e.parentIds)
        ? (e.parentIds.map((id) => (id as { _id?: string } | string)?.['_id'] || id) as string[])
        : (e.parentIds as { _id?: string } | string | undefined)?._id
          ? [(e.parentIds as { _id?: string })._id as string]
          : [],
      childIds: Array.isArray(e.childIds)
        ? (e.childIds.map((id) => (id as { _id?: string } | string)?.['_id'] || id) as string[])
        : [],
      location: e.location as string | undefined,
      notes: (e.notes as string | null) ?? null,
      recurring: (e.recurring as Event['recurring']) ?? null,
    };
  });

  const transformedRequests: ScheduleChangeRequest[] = scheduleChangeRequests.map(
    (r: Record<string, unknown>) => ({
      id: (r._id || r.id) as string,
      status: r.status as ScheduleChangeRequest['status'],
      requestedBy: ((r.requestedBy as { _id?: string } | string | undefined)?._id ||
        r.requestedBy) as string,
      requestedAt: r.requestedAt as string,
      resolvedBy: ((r.resolvedBy as { _id?: string } | string | undefined)?._id ||
        r.resolvedBy ||
        null) as string | null,
      resolvedAt: (r.resolvedAt as string | null) ?? null,
      originalEventId: ((r.originalEventId as { _id?: string } | string | undefined)?._id ||
        r.originalEventId ||
        null) as string | null,
      proposedChange: r.proposedChange as ScheduleChangeRequest['proposedChange'],
      reason: r.reason as string,
      responseNote: (r.responseNote as string | null) ?? null,
    }),
  );

  const editingEvent = editingEventId
    ? transformedEvents.find((event) => event.id === editingEventId)
    : undefined;
  const drawerOpen = isCreating || isEditing;
  const drawerMode: 'create' | 'edit' = isEditing ? 'edit' : 'create';
  const drawerInitialDate = editingEvent?.startDate || initialDate;

  const handleOpenDrawer = (date?: string) => {
    const params: Record<string, string> = { create: 'true' };
    if (date) {
      params.date = date;
    }
    setSearchParams(params);
  };

  const handleCloseDrawer = () => {
    setSearchParams({});
  };

  const handleCreateEvent = async (eventData: Omit<Event, 'id'>) => {
    if (!activeFamilyId) return;
    await createEvent.mutateAsync({ familyId: activeFamilyId, ...eventData });
  };

  const handleUpdateEvent = async (eventId: string, eventData: Omit<Event, 'id'>) => {
    if (!activeFamilyId) return;
    await updateEvent.mutateAsync({ id: eventId, familyId: activeFamilyId, ...eventData });
  };

  const handleViewEvent = async (eventId: string) => {
    setSearchParams({ edit: eventId });
  };

  const handleEditEvent = async (eventId: string) => {
    setSearchParams({ edit: eventId });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!activeFamilyId) return;
    await deleteEvent.mutateAsync({ id: eventId, familyId: activeFamilyId });
  };

  const handleRequestScheduleChange = async (eventId: string) => {
    console.log('Request schedule change for event:', eventId);
  };

  const handleApproveRequest = async (requestId: string, responseNote?: string) => {
    if (!activeFamilyId) return;
    await approveScheduleChangeRequest.mutateAsync({
      id: requestId,
      familyId: activeFamilyId,
      responseNote,
    });
  };

  const handleDeclineRequest = async (requestId: string, responseNote?: string) => {
    if (!activeFamilyId) return;
    await declineScheduleChangeRequest.mutateAsync({
      id: requestId,
      familyId: activeFamilyId,
      responseNote,
    });
  };

  const handleViewRequest = async (requestId: string) => {
    console.log('View request:', requestId);
  };

  const handleChangeView = (view: 'month' | 'week' | 'day') => {
    console.log('View changed to:', view);
  };

  const handleNavigateDate = (date: string) => {
    console.log('Navigate to date:', date);
  };

  if (familiesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!activeFamilyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">
          No family found. Please set up your family first.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <CalendarView
        parents={transformedParents}
        children={transformedChildren}
        events={transformedEvents}
        scheduleChangeRequests={transformedRequests}
        currentParentId={currentParentId}
        onViewEvent={handleViewEvent}
        onCreateEvent={() => handleOpenDrawer()}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onRequestScheduleChange={handleRequestScheduleChange}
        onApproveRequest={handleApproveRequest}
        onDeclineRequest={handleDeclineRequest}
        onViewRequest={handleViewRequest}
        onChangeView={handleChangeView}
        onNavigateDate={handleNavigateDate}
      />

      <EventCreationDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        initialDate={drawerInitialDate}
        parents={transformedParents}
        children={transformedChildren}
        event={editingEvent}
        mode={drawerMode}
        currentParentId={currentParentId}
        onSubmit={(eventData) => {
          if (drawerMode === 'edit' && editingEventId) {
            return handleUpdateEvent(editingEventId, eventData);
          }
          return handleCreateEvent(eventData);
        }}
      />
    </div>
  );
};

export default CalendarPage;
