// Start (or reuse) the shared dev Firebase emulators and print their client env as one JSON line.
// `orb serve` runs this before building the client: personas sign in as Auth-emulator users.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { startDevEmulators } from '@almadar/db/emulator';

const dataDir = process.env.ALMADAR_EMULATOR_DATA_DIR ?? join(homedir(), '.almadar', 'emulator-data');
const { env } = await startDevEmulators(dataDir, { ...process.env, NODE_ENV: 'development' });
process.stdout.write(`${JSON.stringify(env)}\n`);
process.exit(0);
