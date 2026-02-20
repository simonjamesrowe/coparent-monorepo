import type { Dialog, Page } from '@playwright/test';

import { test, expect } from '../fixtures/api.fixture';

async function answerPromptSequence(page: Page, answers: string[]) {
  const queue = [...answers];
  const handler = async (dialog: Dialog) => {
    await dialog.accept(queue.shift() ?? '');
  };

  page.on('dialog', handler);
  return () => page.off('dialog', handler);
}

test.describe('Messaging', () => {
  test('creates a conversation and sends a follow-up message', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Messaging E2E Family');
    await api.seedCoParent(family.id, {
      auth0Id: 'auth0|messaging-coparent',
      email: 'messaging-coparent@coparent.dev',
      fullName: 'Messaging CoParent',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+messaging@coparent.dev');

    await authenticatedPage.goto('/messages');

    const detach = await answerPromptSequence(authenticatedPage, [
      'School handoff',
      'Can you do pickup this Thursday?',
    ]);

    await authenticatedPage.getByRole('button', { name: 'New message' }).click();
    detach();

    const schoolHandoffConversation = authenticatedPage
      .getByRole('button', { name: /School handoff/ })
      .first();
    await expect(schoolHandoffConversation).toBeVisible();
    await schoolHandoffConversation.click();

    await authenticatedPage
      .getByPlaceholder('Write a message or follow up on a decision...')
      .fill('Yes, I can handle pickup and after-school care.');
    await authenticatedPage.getByRole('button', { name: 'Send' }).click();

    await expect(
      authenticatedPage.getByText('Yes, I can handle pickup and after-school care.').nth(1),
    ).toBeVisible();
  });

  test('does not create a conversation when first message is empty', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Messaging Validation Family');
    await api.seedCoParent(family.id, {
      auth0Id: 'auth0|messaging-validation-coparent',
      email: 'messaging-validation-coparent@coparent.dev',
      fullName: 'Messaging Validation CoParent',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+messaging-validation@coparent.dev');

    await authenticatedPage.goto('/messages');

    const detach = await answerPromptSequence(authenticatedPage, ['Validation subject', '   ']);

    await authenticatedPage.getByRole('button', { name: 'New message' }).click();
    detach();

    await expect(authenticatedPage.getByText('No conversations found').first()).toBeVisible();
  });
});
