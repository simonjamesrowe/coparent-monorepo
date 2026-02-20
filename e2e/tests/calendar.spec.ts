import { test, expect } from '../fixtures/api.fixture';

function dateToYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test.describe('Calendar events', () => {
  test('creates and edits an event from the calendar drawer', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Calendar E2E Family');
    const child = await api.seedChild(family.id, {
      fullName: 'Calendar Child',
      dateOfBirth: '2015-03-21',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+calendar@coparent.dev');

    await authenticatedPage.goto('/calendar');
    await expect(authenticatedPage.getByRole('heading', { name: 'Family Calendar' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Add Event' }).click();
    const createEventHeading = authenticatedPage
      .getByRole('heading', { name: 'Create Event' })
      .last();
    await expect(createEventHeading).toBeVisible();

    await authenticatedPage.getByPlaceholder('e.g. Emma Soccer Practice').fill('School Pickup');
    await authenticatedPage.getByRole('button', { name: 'Save' }).click();
    await expect(createEventHeading).toBeHidden({ timeout: 10_000 });

    const schoolPickupEvent = authenticatedPage.getByRole('button', { name: /School Pickup/ }).first();
    await expect(schoolPickupEvent).toBeVisible();

    await Promise.all([
      authenticatedPage.waitForURL(/\/calendar\?edit=/, { timeout: 10_000 }),
      schoolPickupEvent.click(),
    ]);
    const editEventHeading = authenticatedPage.getByRole('heading', { name: 'Edit Event' }).last();
    await expect(editEventHeading).toBeVisible();

    await authenticatedPage.getByPlaceholder('e.g. Emma Soccer Practice').fill('School Pickup Updated');
    await authenticatedPage.getByRole('button', { name: 'Save' }).click();
    await expect(editEventHeading).toBeHidden({ timeout: 10_000 });

    await expect(authenticatedPage.getByRole('button', { name: /School Pickup Updated/ }).first()).toBeVisible();

    const today = dateToYmd(new Date());
    const seeded = await api.seedEvent(family.id, {
      type: 'activity',
      title: 'To Delete',
      startDate: today,
      allDay: true,
      childIds: [child.id],
    });

    const seededId = seeded.id ?? seeded._id;
    if (!seededId) {
      throw new Error('Expected seeded event to include an id');
    }

    await authenticatedPage.reload();
    const toDeleteEvent = authenticatedPage.getByRole('button', { name: /To Delete/ });
    await expect(toDeleteEvent.first()).toBeVisible();

    await api.deleteEvent(family.id, seededId);
    await authenticatedPage.reload();
    await expect(toDeleteEvent).toHaveCount(0);
  });

  test('validates required title and date fields before save', async ({ authenticatedPage, api }) => {
    const family = await api.seedFamily('Calendar Validation Family');
    await api.seedChild(family.id, {
      fullName: 'Validation Child',
      dateOfBirth: '2017-07-19',
    });
    await api.seedOnboardingComplete(family.id);
    await api.seedInvitation(family.id, 'coparent+calendar-validation@coparent.dev');

    await authenticatedPage.goto('/calendar');
    await authenticatedPage.getByRole('button', { name: 'Add Event' }).click();

    const createEventDialog = authenticatedPage.getByRole('dialog', { name: 'Create Event' });
    await expect(createEventDialog).toBeVisible();

    const saveButton = createEventDialog.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeDisabled();

    await createEventDialog.getByPlaceholder('e.g. Emma Soccer Practice').fill('Validation Event');
    await expect(saveButton).toBeEnabled();

    await createEventDialog.locator('input[type="date"]').first().fill('');
    await expect(saveButton).toBeDisabled();
  });
});
