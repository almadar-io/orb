/**
 * Dev persona switch — view the app as each identity its `[identity]` entity declares.
 *
 * Exists only in a build pointed at the Auth emulator (`VITE_FIREBASE_AUTH_EMULATOR_HOST`), so it
 * never appears, or calls the server, in a real deployment or a client-only site. Choosing a
 * persona signs in as that emulated user: a real ID token, so `@user` resolves as in production.
 */

import React from 'react';
import { HStack, Select, Typography } from '@almadar/ui';
import { useDevPersonas } from '@almadar/auth/react';
import { useAuthContext } from '../AuthContext';

const API_BASE: string = import.meta.env.VITE_API_URL ?? '';
const EMULATOR_HOST: string | undefined = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;

function DevPersonaPicker(): React.ReactElement | null {
  const { user } = useAuthContext();
  const { personas, signInAs } = useDevPersonas(API_BASE);
  if (personas.length === 0) return null;

  const options = personas.map((p) => ({
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
          void signInAs(event.target.value);
        }}
      />
    </HStack>
  );
}

export function PersonaSwitcher(): React.ReactElement | null {
  return EMULATOR_HOST ? <DevPersonaPicker /> : null;
}

export default PersonaSwitcher;
