import { test as base, expect } from './auth.fixture';
import { signTestJwt } from '../helpers/jwt';
import {
  cleanupDatabase,
  deleteEvent,
  seedChild,
  seedCoParent,
  seedEvent,
  seedFamily,
  seedInvitation,
  seedOnboardingComplete,
  type SeedChildInput,
  type SeedCoParentInput,
  type SeedEventInput,
} from '../helpers/seed';

interface ApiFixture {
  api: {
    token: string;
    seedFamily: (name?: string, timeZone?: string, token?: string) => ReturnType<typeof seedFamily>;
    seedChild: (familyId: string, data: SeedChildInput, token?: string) => ReturnType<typeof seedChild>;
    seedOnboardingComplete: (familyId: string, token?: string) => ReturnType<typeof seedOnboardingComplete>;
    seedInvitation: (
      familyId: string,
      email: string,
      role?: 'primary' | 'co-parent',
      token?: string,
    ) => ReturnType<typeof seedInvitation>;
    seedCoParent: (familyId: string, input?: SeedCoParentInput) => ReturnType<typeof seedCoParent>;
    seedEvent: (familyId: string, event: SeedEventInput, token?: string) => ReturnType<typeof seedEvent>;
    deleteEvent: (familyId: string, eventId: string, token?: string) => ReturnType<typeof deleteEvent>;
    cleanupDatabase: () => Promise<void>;
    signToken: typeof signTestJwt;
  };
}

interface ApiAutoFixtures {
  dbCleanup: void;
}

export const test = base.extend<ApiFixture & ApiAutoFixtures>({
  api: async ({}, use) => {
    const token = signTestJwt();

    await use({
      token,
      seedFamily,
      seedChild,
      seedOnboardingComplete,
      seedInvitation,
      seedCoParent,
      seedEvent,
      deleteEvent,
      cleanupDatabase,
      signToken: signTestJwt,
    });
  },
  dbCleanup: [
    async ({ api }, use) => {
      await api.cleanupDatabase();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
