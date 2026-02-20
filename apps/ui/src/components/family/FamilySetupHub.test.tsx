import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Child, Family, Invitation, Parent } from '../../lib/api/client';

import { FamilySetupHub } from './FamilySetupHub';

const family: Family = {
  id: 'fam-1',
  name: 'Rowe Family',
  timeZone: 'America/Los_Angeles',
  parentIds: [],
  childIds: [],
  invitationIds: [],
  createdAt: '2026-02-01T00:00:00Z',
};

const parent: Parent = {
  id: 'par-1',
  familyId: 'fam-1',
  fullName: 'Alex Rowe',
  email: 'alex@example.com',
  role: 'primary',
  status: 'active',
  auth0Id: 'auth0|1',
  color: '#0d9488',
  avatarUrl: undefined,
  lastSignedInAt: '2026-02-01T00:00:00Z',
};

const child: Child = {
  id: 'chi-1',
  familyId: 'fam-1',
  fullName: 'Theo Rowe',
  dateOfBirth: '2015-01-01',
  school: 'Test School',
  medicalNotes: 'None',
};

describe('FamilySetupHub child editor', () => {
  it('opens editor via childIdToEdit and saves updates', async () => {
    const user = userEvent.setup();
    const onUpdateChild = vi.fn();
    const onCloseChildEditor = vi.fn();

    render(
      <FamilySetupHub
        families={[family]}
        parents={[parent]}
        children={[child]}
        invitations={[] as Invitation[]}
        activeFamilyId="fam-1"
        childIdToEdit="chi-1"
        onCloseChildEditor={onCloseChildEditor}
        onUpdateChild={onUpdateChild}
      />,
    );

    const dob = screen.getByLabelText('Date of Birth');
    await user.clear(dob);
    await user.type(dob, '2014-12-31');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onUpdateChild).toHaveBeenCalledWith(
      'chi-1',
      expect.objectContaining({ dateOfBirth: '2014-12-31' }),
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onCloseChildEditor).toHaveBeenCalledTimes(1);
  });
});
