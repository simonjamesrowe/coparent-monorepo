import { test, expect } from '../fixtures/api.fixture';

test.describe('Onboarding', () => {
  test('completes onboarding and reaches dashboard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/onboarding');
    await expect(authenticatedPage.getByRole('heading', { name: 'Name Your Family' })).toBeVisible();

    await authenticatedPage.getByPlaceholder('Enter your full name').fill('E2E Test Parent');
    await authenticatedPage.getByPlaceholder('e.g., The Kingston Family').fill('E2E Test Family');
    await authenticatedPage
      .getByPlaceholder('Start typing a city (e.g., London)')
      .fill('New York, USA');
    await authenticatedPage.getByRole('button', { name: 'Continue' }).click();

    await expect(authenticatedPage.getByRole('heading', { name: 'Add Your Children' })).toBeVisible();
    await authenticatedPage.getByPlaceholder('First and last name').fill('Test Child');
    await authenticatedPage.locator('input[type="date"]').first().fill('2018-05-15');
    await authenticatedPage.getByRole('button', { name: 'Add Child' }).click();
    await expect(authenticatedPage.getByText(/^Children added \(1\)$/)).toBeVisible();
    const childContinueButton = authenticatedPage.getByRole('button', { name: 'Continue' }).first();
    await expect(childContinueButton).toBeEnabled();
    await childContinueButton.evaluate((button: HTMLButtonElement) => button.click());

    await expect(
      authenticatedPage.getByRole('heading', { name: 'Invite Your Co-Parent' }),
    ).toBeVisible();
    await authenticatedPage.getByLabel('Co-Parent Email').fill('coparent+onboarding@coparent.dev');
    await authenticatedPage.getByRole('button', { name: 'Send Invite' }).click();

    await expect(authenticatedPage.getByRole('heading', { name: 'Review & Complete' })).toBeVisible();
    await authenticatedPage.getByRole('button', { name: 'Complete Setup' }).click();

    await expect(authenticatedPage).toHaveURL(/\/dashboard$/);
    await expect(authenticatedPage.getByText('E2E Test Family')).toBeVisible();
  });

  test('requires family and child fields before progressing', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/onboarding');
    const familyContinueButton = authenticatedPage.getByRole('button', { name: 'Continue' });

    await expect(familyContinueButton).toBeDisabled();
    await authenticatedPage.getByPlaceholder('Enter your full name').fill('E2E Test Parent');
    await expect(familyContinueButton).toBeDisabled();

    await authenticatedPage.getByPlaceholder('e.g., The Kingston Family').fill('Validation Family');
    await expect(familyContinueButton).toBeEnabled();
    await familyContinueButton.click();

    const childAddButton = authenticatedPage.getByRole('button', { name: 'Add Child' });
    const childContinueButton = authenticatedPage.getByRole('button', { name: 'Continue' });

    await expect(childAddButton).toBeDisabled();
    await expect(childContinueButton).toBeDisabled();

    await authenticatedPage.getByPlaceholder('First and last name').fill('Validation Child');
    await expect(childAddButton).toBeDisabled();

    await authenticatedPage.locator('input[type="date"]').first().fill('2019-08-01');
    await expect(childAddButton).toBeEnabled();
  });
});
