import { MongoClient, ObjectId } from 'mongodb';

import { signTestJwt } from './jwt';

const API_BASE_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/coparent-e2e';

function resolveDatabaseName(uri: string): string {
  try {
    const parsed = new URL(uri);
    const name = parsed.pathname.replace(/^\//, '');
    return name || 'coparent-e2e';
  } catch {
    return 'coparent-e2e';
  }
}

async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token ?? signTestJwt()}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed (${response.status}) ${path}: ${errorBody}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface SeedFamilyResult {
  id: string;
  name: string;
  timeZone: string;
}

export async function seedFamily(
  name = 'E2E Test Family',
  timeZone = 'America/New_York',
  token?: string,
): Promise<SeedFamilyResult> {
  return apiFetch<SeedFamilyResult>('/families', {
    method: 'POST',
    token,
    body: {
      name,
      timeZone,
      fullName: 'E2E Parent',
    },
  });
}

export interface SeedChildInput {
  fullName: string;
  dateOfBirth: string;
  school?: string;
  medicalNotes?: string;
}

export interface SeedChildResult {
  id: string;
  familyId: string;
  fullName: string;
  dateOfBirth: string;
  school?: string;
  medicalNotes?: string;
}

export async function seedChild(
  familyId: string,
  data: SeedChildInput,
  token?: string,
): Promise<SeedChildResult> {
  return apiFetch<SeedChildResult>(`/families/${familyId}/children`, {
    method: 'POST',
    token,
    body: data,
  });
}

export async function seedOnboardingComplete(familyId: string, token?: string) {
  return apiFetch(`/onboarding/${familyId}`, {
    method: 'PATCH',
    token,
    body: {
      currentStep: 'complete',
      completedSteps: ['family', 'child', 'invite', 'review'],
      isComplete: true,
    },
  });
}

export interface SeedInvitationResult {
  id: string;
  familyId: string;
  email: string;
  role: 'primary' | 'co-parent';
  status: string;
}

export async function seedInvitation(
  familyId: string,
  email: string,
  role: 'primary' | 'co-parent' = 'co-parent',
  token?: string,
): Promise<SeedInvitationResult> {
  return apiFetch<SeedInvitationResult>(`/families/${familyId}/invitations`, {
    method: 'POST',
    token,
    body: {
      email,
      role,
    },
  });
}

export interface SeedCoParentInput {
  auth0Id?: string;
  email?: string;
  fullName?: string;
  role?: 'primary' | 'co-parent';
}

export async function seedCoParent(familyId: string, input: SeedCoParentInput = {}) {
  const client = new MongoClient(MONGODB_URI);
  const databaseName = resolveDatabaseName(MONGODB_URI);

  await client.connect();
  const db = client.db(databaseName);

  try {
    const existing = await db.collection('parents').findOne({
      familyId: new ObjectId(familyId),
      auth0Id: input.auth0Id ?? 'auth0|e2e-coparent',
    });

    if (existing?._id) {
      return { id: existing._id.toString() };
    }

    const parentId = new ObjectId();
    const now = new Date();

    await db.collection('parents').insertOne({
      _id: parentId,
      auth0Id: input.auth0Id ?? 'auth0|e2e-coparent',
      familyId: new ObjectId(familyId),
      fullName: input.fullName ?? 'E2E Co-Parent',
      email: input.email ?? 'e2e-coparent@coparent.dev',
      role: input.role ?? 'co-parent',
      status: 'active',
      color: '#64748b',
      avatarUrl: null,
      lastSignedInAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection('families').updateOne(
      { _id: new ObjectId(familyId) },
      {
        $addToSet: { parentIds: parentId },
      },
    );

    return { id: parentId.toString() };
  } finally {
    await client.close();
  }
}

export interface SeedEventInput {
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
}

export async function seedEvent(familyId: string, event: SeedEventInput, token?: string) {
  return apiFetch<{ id?: string; _id?: string }>(`/families/${familyId}/events`, {
    method: 'POST',
    token,
    body: event,
  });
}

export async function deleteEvent(familyId: string, eventId: string, token?: string) {
  return apiFetch<void>(`/families/${familyId}/events/${eventId}`, {
    method: 'DELETE',
    token,
  });
}

export async function cleanupDatabase(): Promise<void> {
  const client = new MongoClient(MONGODB_URI);
  const databaseName = resolveDatabaseName(MONGODB_URI);

  await client.connect();
  try {
    await client.db(databaseName).dropDatabase();
  } finally {
    await client.close();
  }
}
