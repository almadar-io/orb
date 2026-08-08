import type { RawUserClaims } from '@almadar/core';

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: RawUserClaims & { uid: string };
    }
  }
}

export {};
