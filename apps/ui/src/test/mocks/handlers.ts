import { http, HttpResponse } from 'msw';

import type {
  Conversation,
  Family,
  Invitation,
  OnboardingState,
  Child,
  Parent,
  CurrentUser,
} from '../../lib/api/client';

type EventRecord = {
  id: string;
  type: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  parentId: string | null;
  parentIds: string[];
  childIds: string[];
  location?: string;
  notes?: string | null;
};

const defaultFamily: Family = {
  id: 'fam-1',
  name: 'Test Family',
  timeZone: 'America/New_York',
  parentIds: ['parent-1'],
  childIds: ['child-1'],
  invitationIds: ['invite-1'],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const defaultChild: Child = {
  id: 'child-1',
  familyId: 'fam-1',
  fullName: 'Test Child',
  dateOfBirth: '2016-05-10',
  school: 'Test School',
  medicalNotes: 'None',
};

const defaultParent: Parent = {
  id: 'parent-1',
  familyId: 'fam-1',
  fullName: 'Primary Parent',
  email: 'parent@coparent.dev',
  role: 'primary',
  status: 'active',
  auth0Id: 'auth0|test-user-1',
  color: '#0d9488',
  avatarUrl: '',
  lastSignedInAt: '2026-01-01T00:00:00.000Z',
};

const defaultInvitation: Invitation = {
  id: 'invite-1',
  familyId: 'fam-1',
  email: 'coparent@coparent.dev',
  role: 'co-parent',
  status: 'pending',
  sentAt: '2026-01-02T00:00:00.000Z',
  expiresAt: '2026-01-09T00:00:00.000Z',
};

const defaultOnboarding: OnboardingState = {
  familyId: 'fam-1',
  currentStep: 'review',
  completedSteps: ['family', 'child', 'invite'],
  isComplete: false,
  lastUpdated: '2026-01-02T00:00:00.000Z',
};

const defaultConversation: Conversation = {
  id: 'conv-1',
  type: 'message',
  subject: 'Test conversation',
  lastMessageAt: '2026-01-02T00:00:00.000Z',
  unreadCount: 0,
  participants: {
    parent1: { id: 'parent-1', name: 'Primary Parent', avatarUrl: null },
    parent2: { id: 'parent-2', name: 'Co Parent', avatarUrl: null },
  },
  messages: [
    {
      id: 'msg-1',
      senderId: 'parent-1',
      content: 'Hello from test mock',
      timestamp: '2026-01-02T00:00:00.000Z',
      isRead: true,
    },
  ],
};

let families: Family[] = [defaultFamily];
let childrenByFamily: Record<string, Child[]> = { [defaultFamily.id]: [defaultChild] };
let eventsByFamily: Record<string, EventRecord[]> = { [defaultFamily.id]: [] };
let parentsByFamily: Record<string, Parent[]> = { [defaultFamily.id]: [defaultParent] };
let invitationsByFamily: Record<string, Invitation[]> = {
  [defaultFamily.id]: [defaultInvitation],
};
let onboardingByFamily: Record<string, OnboardingState> = {
  [defaultFamily.id]: defaultOnboarding,
};
let conversationsByFamily: Record<string, Conversation[]> = {
  [defaultFamily.id]: [defaultConversation],
};
let accountsByFamily: Record<string, Array<Record<string, unknown>>> = { [defaultFamily.id]: [] };
let expenseCategoriesByFamily: Record<string, Array<Record<string, unknown>>> = {
  [defaultFamily.id]: [],
};
let expensesByFamily: Record<string, Array<Record<string, unknown>>> = { [defaultFamily.id]: [] };
let budgetsByFamily: Record<string, Array<Record<string, unknown>>> = { [defaultFamily.id]: [] };
let statementsByFamily: Record<string, Array<Record<string, unknown>>> = { [defaultFamily.id]: [] };
let csvMappingTemplatesByFamily: Record<string, Array<Record<string, unknown>>> = {
  [defaultFamily.id]: [],
};
let statementLinesByStatement: Record<string, Array<Record<string, unknown>>> = {};

const currentUser: CurrentUser = {
  auth0Id: 'auth0|test-user-1',
  email: 'parent@coparent.dev',
  profiles: [
    {
      id: 'parent-1',
      familyId: 'fam-1',
      fullName: 'Primary Parent',
      role: 'primary',
      status: 'active',
    },
  ],
  isNewUser: false,
};

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const handlers = [
  http.get('*/families', () => {
    return HttpResponse.json(families);
  }),

  http.post('*/families', async ({ request }) => {
    const body = (await request.json()) as { name: string; timeZone: string };
    const family: Family = {
      id: nextId('fam'),
      name: body.name,
      timeZone: body.timeZone,
      parentIds: ['parent-1'],
      childIds: [],
      invitationIds: [],
      createdAt: new Date().toISOString(),
    };

    families = [family, ...families];
    childrenByFamily[family.id] = [];
    eventsByFamily[family.id] = [];
    parentsByFamily[family.id] = [
      {
        ...defaultParent,
        id: 'parent-1',
        familyId: family.id,
      },
    ];
    invitationsByFamily[family.id] = [];
    onboardingByFamily[family.id] = {
      familyId: family.id,
      currentStep: 'child',
      completedSteps: ['family'],
      isComplete: false,
      lastUpdated: new Date().toISOString(),
    };
    conversationsByFamily[family.id] = [];

    return HttpResponse.json(family, { status: 201 });
  }),

  http.get('*/families/:familyId/children', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(childrenByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/children', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as {
      fullName: string;
      dateOfBirth: string;
      school?: string;
      medicalNotes?: string;
    };

    const child: Child = {
      id: nextId('child'),
      familyId,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      school: body.school,
      medicalNotes: body.medicalNotes,
    };

    childrenByFamily[familyId] = [...(childrenByFamily[familyId] ?? []), child];
    return HttpResponse.json(child, { status: 201 });
  }),

  http.get('*/families/:familyId/events', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(eventsByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/events', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as EventRecord;

    const event: EventRecord = {
      id: nextId('event'),
      type: body.type,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      startTime: body.startTime,
      endTime: body.endTime,
      allDay: body.allDay,
      parentId: body.parentId ?? null,
      parentIds: body.parentIds ?? [],
      childIds: body.childIds ?? [],
      location: body.location,
      notes: body.notes,
    };

    eventsByFamily[familyId] = [...(eventsByFamily[familyId] ?? []), event];
    return HttpResponse.json(event, { status: 201 });
  }),

  http.get('*/families/:familyId/invitations', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(invitationsByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/invitations', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as { email: string; role: 'primary' | 'co-parent' };

    const invitation: Invitation = {
      id: nextId('invite'),
      familyId,
      email: body.email,
      role: body.role,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    invitationsByFamily[familyId] = [...(invitationsByFamily[familyId] ?? []), invitation];
    return HttpResponse.json(invitation, { status: 201 });
  }),

  http.get('*/families/:familyId/parents', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(parentsByFamily[familyId] ?? []);
  }),

  http.get('*/me', () => {
    return HttpResponse.json(currentUser);
  }),

  http.get('*/families/:familyId/conversations', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(conversationsByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/conversations/message', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as {
      subject?: string;
      message: string;
      recipientId?: string;
    };

    const conversation: Conversation = {
      id: nextId('conv'),
      type: 'message',
      subject: body.subject || 'New conversation',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      participants: {
        parent1: { id: 'parent-1', name: 'Primary Parent', avatarUrl: null },
        parent2: { id: body.recipientId ?? 'parent-2', name: 'Co Parent', avatarUrl: null },
      },
      messages: [
        {
          id: nextId('msg'),
          senderId: 'parent-1',
          content: body.message,
          timestamp: new Date().toISOString(),
          isRead: true,
        },
      ],
    };

    conversationsByFamily[familyId] = [conversation, ...(conversationsByFamily[familyId] ?? [])];
    return HttpResponse.json(conversation, { status: 201 });
  }),

  http.post('*/families/:familyId/conversations/permission', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as {
      subject?: string;
      type: 'medical' | 'travel' | 'schedule' | 'extracurricular';
      childId?: string;
      childName?: string;
      description: string;
    };

    const conversation: Conversation = {
      id: nextId('conv'),
      type: 'permission',
      subject: body.subject || 'Permission request',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      participants: {
        parent1: { id: 'parent-1', name: 'Primary Parent', avatarUrl: null },
        parent2: { id: 'parent-2', name: 'Co Parent', avatarUrl: null },
      },
      permissionRequest: {
        id: nextId('perm'),
        type: body.type,
        childId: body.childId ?? 'child-1',
        childName: body.childName ?? 'Test Child',
        description: body.description,
        requestedBy: 'parent-1',
        status: 'pending',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        response: null,
      },
    };

    conversationsByFamily[familyId] = [conversation, ...(conversationsByFamily[familyId] ?? [])];
    return HttpResponse.json(conversation, { status: 201 });
  }),

  http.patch('*/onboarding/:familyId', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const updates = (await request.json()) as Partial<OnboardingState>;

    onboardingByFamily[familyId] = {
      ...(onboardingByFamily[familyId] ?? {
        familyId,
        currentStep: 'family',
        completedSteps: [],
        isComplete: false,
      }),
      ...updates,
      familyId,
      lastUpdated: new Date().toISOString(),
    };

    return HttpResponse.json(onboardingByFamily[familyId]);
  }),

  http.get('*/onboarding/:familyId', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(
      onboardingByFamily[familyId] ?? {
        familyId,
        currentStep: 'family',
        completedSteps: [],
        isComplete: false,
        lastUpdated: null,
      },
    );
  }),

  http.get('*/families/:familyId/accounts', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(accountsByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/accounts', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as Record<string, unknown>;

    const account = {
      id: nextId('acc'),
      _id: nextId('acc'),
      familyId,
      ...body,
    };

    accountsByFamily[familyId] = [...(accountsByFamily[familyId] ?? []), account];
    return HttpResponse.json(account, { status: 201 });
  }),

  http.delete('*/families/:familyId/accounts/:id', ({ params }) => {
    const familyId = params.familyId as string;
    const id = params.id as string;
    accountsByFamily[familyId] = (accountsByFamily[familyId] ?? []).filter(
      (a) => a.id !== id && a._id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/families/:familyId/expense-categories', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(expenseCategoriesByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/expense-categories', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as Record<string, unknown>;

    const category = {
      id: nextId('cat'),
      _id: nextId('cat'),
      familyId,
      type: 'custom',
      ...body,
    };

    expenseCategoriesByFamily[familyId] = [
      ...(expenseCategoriesByFamily[familyId] ?? []),
      category,
    ];
    return HttpResponse.json(category, { status: 201 });
  }),

  http.post('*/families/:familyId/expense-categories/seed', ({ params }) => {
    const familyId = params.familyId as string;

    const predefinedCategories = [
      { id: 'cat-1', _id: 'cat-1', familyId, name: 'Food', type: 'predefined', color: 'teal' },
      {
        id: 'cat-2',
        _id: 'cat-2',
        familyId,
        name: 'School',
        type: 'predefined',
        color: 'violet',
      },
      {
        id: 'cat-3',
        _id: 'cat-3',
        familyId,
        name: 'Healthcare',
        type: 'predefined',
        color: 'rose',
      },
      {
        id: 'cat-4',
        _id: 'cat-4',
        familyId,
        name: 'Clothing',
        type: 'predefined',
        color: 'amber',
      },
      {
        id: 'cat-5',
        _id: 'cat-5',
        familyId,
        name: 'Activities',
        type: 'predefined',
        color: 'emerald',
      },
      {
        id: 'cat-6',
        _id: 'cat-6',
        familyId,
        name: 'Transport',
        type: 'predefined',
        color: 'sky',
      },
      {
        id: 'cat-7',
        _id: 'cat-7',
        familyId,
        name: 'Entertainment',
        type: 'predefined',
        color: 'fuchsia',
      },
      { id: 'cat-8', _id: 'cat-8', familyId, name: 'Other', type: 'predefined', color: 'stone' },
    ];

    expenseCategoriesByFamily[familyId] = predefinedCategories;
    return HttpResponse.json(predefinedCategories, { status: 201 });
  }),

  http.get('*/families/:familyId/expenses', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(expensesByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/expenses', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as Record<string, unknown>;

    const expense = {
      id: nextId('exp'),
      _id: nextId('exp'),
      familyId,
      status: 'draft',
      source: 'manual',
      requiresApproval: false,
      ...body,
    };

    expensesByFamily[familyId] = [...(expensesByFamily[familyId] ?? []), expense];
    return HttpResponse.json(expense, { status: 201 });
  }),

  http.get('*/families/:familyId/expenses/dashboard-summary', ({ params }) => {
    const familyId = params.familyId as string;
    const expenses = expensesByFamily[familyId] ?? [];

    const summary = {
      month: '2026-02',
      totalSpent: expenses.reduce((sum, e) => sum + ((e.amount as number) || 0), 0),
      totalChildExpenses: expenses
        .filter((e) => e.childId)
        .reduce((sum, e) => sum + ((e.amount as number) || 0), 0),
      reimbursementsDue: 0,
      categoryBreakdown: [],
      accountSpend: [],
    };

    return HttpResponse.json(summary);
  }),

  http.get('*/families/:familyId/budgets', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(budgetsByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/budgets', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as Record<string, unknown>;

    const budget = {
      id: nextId('bud'),
      _id: nextId('bud'),
      familyId,
      spent: 0,
      status: 'on_track',
      ...body,
    };

    budgetsByFamily[familyId] = [...(budgetsByFamily[familyId] ?? []), budget];
    return HttpResponse.json(budget, { status: 201 });
  }),

  http.put('*/families/:familyId/budgets/:id', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const id = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;

    const budgets = budgetsByFamily[familyId] ?? [];
    const index = budgets.findIndex((b) => b.id === id || b._id === id);

    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...body };
      budgetsByFamily[familyId] = budgets;
      return HttpResponse.json(budgets[index]);
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.get('*/families/:familyId/statements', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(statementsByFamily[familyId] ?? []);
  }),

  http.post('*/families/:familyId/statements', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const body = (await request.json()) as Record<string, unknown>;

    const statement = {
      id: nextId('stm'),
      _id: nextId('stm'),
      familyId,
      uploadedAt: new Date().toISOString(),
      ...body,
    };

    statementsByFamily[familyId] = [...(statementsByFamily[familyId] ?? []), statement];
    return HttpResponse.json(statement, { status: 201 });
  }),

  http.get('*/families/:familyId/statements/:statementId/lines', ({ params }) => {
    const statementId = params.statementId as string;
    return HttpResponse.json(statementLinesByStatement[statementId] ?? []);
  }),

  http.post('*/families/:familyId/statements/:statementId/lines', async ({ params, request }) => {
    const familyId = params.familyId as string;
    const statementId = params.statementId as string;
    const body = (await request.json()) as { lines: Array<Record<string, unknown>> };

    const created = (body.lines ?? []).map((line) => ({
      id: nextId('line'),
      _id: nextId('line'),
      familyId,
      statementId,
      isChildExpense: false,
      requiresApproval: false,
      currency: 'USD',
      ...line,
    }));

    statementLinesByStatement[statementId] = [
      ...(statementLinesByStatement[statementId] ?? []),
      ...created,
    ];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(
    '*/families/:familyId/statements/:statementId/lines/:lineId',
    async ({ params, request }) => {
      const statementId = params.statementId as string;
      const lineId = params.lineId as string;
      const body = (await request.json()) as Record<string, unknown>;

      const lines = statementLinesByStatement[statementId] ?? [];
      const index = lines.findIndex((l) => l.id === lineId || l._id === lineId);

      if (index !== -1) {
        lines[index] = { ...lines[index], ...body };
        statementLinesByStatement[statementId] = lines;
        return HttpResponse.json(lines[index]);
      }

      return new HttpResponse(null, { status: 404 });
    },
  ),

  http.get('*/families/:familyId/csv-mapping-templates', ({ params }) => {
    const familyId = params.familyId as string;
    return HttpResponse.json(csvMappingTemplatesByFamily[familyId] ?? []);
  }),
];
