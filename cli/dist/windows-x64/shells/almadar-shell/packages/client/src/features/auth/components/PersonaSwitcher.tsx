/**
 * Dev persona switch — view the app as each identity its domain implies.
 *
 * Renders only when auth is mocked (no Firebase credentials), so it cannot appear
 * in a real deployment. Role gates and ownership-scoped lists are the parts of an
 * app that look identical whether they work or are simply empty; switching viewer
 * in one click is how you tell the difference.
 */

import React from 'react';
import { HStack, Select, Typography } from '@almadar/ui';
import { isAuthEnabled } from '../../../config/firebase';
import { listMockAccounts, onMockRosterChanged } from '../../../config/mockAuth';
import { authService } from '../authService';
import { useAuthContext } from '../AuthContext';

export function PersonaSwitcher(): React.ReactElement | null {
  const { user } = useAuthContext();
  // The roster arrives over HTTP after first paint. Without this the picker
  // renders its empty pre-fetch state and never updates, because the signed-out
  // viewer never changes and so the auth listener never fires.
  const [accounts, setAccounts] = React.useState(() => listMockAccounts());

  React.useEffect(() => onMockRosterChanged(() => setAccounts(listMockAccounts())), []);

  if (isAuthEnabled()) return null;

  const options = accounts.map((p) => ({
    value: p.id,
    label: `${String(p.name ?? p.id)} — ${String(p.role ?? 'no role')}`,
  }));

  return (
    <HStack gap="sm" align="center">
      <Typography variant="caption" color="muted">
        Viewing as
      </Typography>
      <Select
        options={options}
        value={user?.uid ?? ''}
        placeholder="Signed out"
        onChange={(event) => {
          void authService.signInAsPersona(event.target.value);
        }}
      />
    </HStack>
  );
}

export default PersonaSwitcher;
