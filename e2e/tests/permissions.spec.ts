import { test, expect } from '../fixtures/api.fixture';
import type { Dialog, Page } from '@playwright/test';

async function answerPromptSequence(page: Page, answers: string[]) {
  const queue = [...answers];
  const handler = async (dialog: Dialog) => {
    const next = queue.shift() ?? '';
    await dialog.accept(next);
  };

  page.on('dialog', handler);
  return () => page.off('dialog', handler);
}

test.describe('Permission requests', () => {
  test('creates a permission request and shows it as pending', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Permissions E2E Family');
    await api.seedChild(family.id, {
      fullName: 'Permission Child',
      dateOfBirth: '2014-06-10',
    });
    await api.seedCoParent(family.id, {
      auth0Id: 'auth0|permissions-coparent',
      email: 'permissions-coparent@coparent.dev',
      fullName: 'Permissions CoParent',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+permissions@coparent.dev');

    await authenticatedPage.goto('/messages');
    await expect(
      authenticatedPage.getByRole('heading', { name: 'Clear, documented co-parent decisions' }),
    ).toBeVisible();

    const detach = await answerPromptSequence(authenticatedPage, [
      'medical',
      'Doctor consent form',
      'Need approval for urgent pediatric visit paperwork.',
    ]);

    await authenticatedPage.getByRole('button', { name: 'New permission' }).click();
    detach();

    const doctorConsentRequest = authenticatedPage
      .getByRole('button', { name: /Doctor consent form/ })
      .first();
    await expect(doctorConsentRequest).toBeVisible();
    await doctorConsentRequest.click();
    await expect(
      authenticatedPage.getByText('Need approval for urgent pediatric visit paperwork.').nth(1),
    ).toBeVisible();
    await expect(authenticatedPage.getByText('pending').first()).toBeVisible();
  });

  test('does not create a request when description is empty', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Permissions Validation Family');
    await api.seedChild(family.id, {
      fullName: 'Validation Child',
      dateOfBirth: '2013-02-05',
    });
    await api.seedCoParent(family.id, {
      auth0Id: 'auth0|permissions-validation-coparent',
      email: 'permissions-validation-coparent@coparent.dev',
      fullName: 'Validation CoParent',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+permissions-validation@coparent.dev');

    await authenticatedPage.goto('/messages');

    const detach = await answerPromptSequence(authenticatedPage, [
      'schedule',
      'Validation permission',
      '   ',
    ]);

    await authenticatedPage.getByRole('button', { name: 'New permission' }).click();
    detach();

    await expect(authenticatedPage.getByText('No conversations found').first()).toBeVisible();
  });
});
