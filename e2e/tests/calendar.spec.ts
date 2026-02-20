import { test, expect } from '../fixtures/api.fixture';

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
    const createEventDialog = authenticatedPage.getByRole('dialog', { name: 'Create Event' });
    await expect(createEventDialog).toBeVisible();

    await createEventDialog.getByPlaceholder('e.g. Emma Soccer Practice').fill('School Pickup');
    await createEventDialog.getByRole('button', { name: 'Save' }).click();

    await expect(authenticatedPage.getByText('School Pickup')).toBeVisible();

    await authenticatedPage.getByText('School Pickup').first().click();
    const editEventDialog = authenticatedPage.getByRole('dialog', { name: 'Edit Event' });
    await expect(editEventDialog).toBeVisible();

    await editEventDialog.getByPlaceholder('e.g. Emma Soccer Practice').fill('School Pickup Updated');
    await editEventDialog.getByRole('button', { name: 'Save' }).click();

    await expect(authenticatedPage.getByText('School Pickup Updated')).toBeVisible();

    const seeded = await api.seedEvent(family.id, {
      type: 'activity',
      title: 'To Delete',
      startDate: '2026-03-15',
      allDay: true,
      childIds: [child.id],
    });

    const seededId = seeded.id ?? seeded._id;
    if (!seededId) {
      throw new Error('Expected seeded event to include an id');
    }

    await authenticatedPage.reload();
    await expect(authenticatedPage.getByText('To Delete')).toBeVisible();

    await api.deleteEvent(family.id, seededId);
    await authenticatedPage.reload();
    await expect(authenticatedPage.getByText('To Delete')).not.toBeVisible();
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
