import { test, expect } from '../fixtures/api.fixture';

test.describe('Children management', () => {
  test('adds a child from family setup', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Children E2E Family');
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+children@coparent.dev');

    await authenticatedPage.goto('/family-setup');
    await expect(authenticatedPage.getByRole('heading', { name: 'Children' })).toBeVisible();

    const addChildButton = authenticatedPage.getByRole('button', { name: 'Add Child' });
    await expect(addChildButton).toBeDisabled();

    await authenticatedPage.getByPlaceholder('First and last name').fill('Second Test Child');
    await authenticatedPage.locator('input[type="date"]').first().fill('2017-04-02');
    await expect(addChildButton).toBeEnabled();
    await addChildButton.click();

    await expect(authenticatedPage.getByText('Second Test Child')).toBeVisible();
  });

  test('edits child details from the editor panel', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Children Edit Family');
    const child = await api.seedChild(family.id, {
      fullName: 'Editable Child',
      dateOfBirth: '2016-10-11',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+children-edit@coparent.dev');

    await authenticatedPage.goto(`/family-setup?childId=${child.id}`);
    await expect(authenticatedPage.locator('#child-edit-full-name')).toBeVisible();

    await authenticatedPage.locator('#child-edit-full-name').fill('Edited Child');
    await authenticatedPage.locator('#child-edit-school').fill('Springfield Elementary');
    await authenticatedPage.locator('#child-edit-medical-notes').fill('Peanut allergy');
    await authenticatedPage.getByRole('button', { name: 'Save changes' }).click();

    await expect(authenticatedPage.getByText('Edited Child')).toBeVisible();
    await expect(authenticatedPage.getByText('Springfield Elementary')).toBeVisible();
    await expect(authenticatedPage.getByText('Peanut allergy')).toBeVisible();
  });
});
