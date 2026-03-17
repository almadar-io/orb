export type { PhysicsPreset, PhysicsBody, PhysicsConstraint } from './types';
export { projectileMotion, pendulum, springOscillator } from './mechanics';

import { projectileMotion, pendulum, springOscillator } from './mechanics';
import type { PhysicsPreset } from './types';

export const ALL_PRESETS: PhysicsPreset[] = [
    projectileMotion,
    pendulum,
    springOscillator,
];
