import type { VerifiedUser } from '@almadar/auth';

declare global {
  namespace Express {
    interface Request {
      authUser?: VerifiedUser;
    }
  }
}

export {};
