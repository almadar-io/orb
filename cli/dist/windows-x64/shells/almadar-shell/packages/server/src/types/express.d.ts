import type { EventPayloadValue } from '@almadar/core';

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email?: string;
        name?: string;
        picture?: string;
        [key: string]: EventPayloadValue;
      };
    }
  }
}

export {};
