// Base Types
export type { TemplateProps } from './types';

// Layout Templates
export { DashboardLayout, type DashboardLayoutProps, type NavItem } from './DashboardLayout';
export { AuthLayout, type AuthLayoutProps } from './AuthLayout';

// Feature Templates
export {
  CounterTemplate,
  type CounterTemplateProps,
  type CounterSize,
  type CounterVariant
} from './CounterTemplate';

// Wireframe Templates
export {
  GameTemplate,
  type GameTemplateProps
} from './GameTemplate';

export {
  GenericAppTemplate,
  type GenericAppTemplateProps
} from './GenericAppTemplate';

export {
  GameShell,
  type GameShellProps
} from './GameShell';

// Game View Templates (thin wrappers — logic in Board organisms)
export {
  BattleTemplate,
  type BattleTemplateProps,
  type BattleEntity,
  type BattlePhase,
  type BattleUnit,
  type BattleTile,
  type BattleSlotContext,
} from './BattleTemplate';

export {
  CastleTemplate,
  type CastleTemplateProps,
  type CastleEntity,
  type CastleSlotContext,
} from './CastleTemplate';

export {
  WorldMapTemplate,
  type WorldMapTemplateProps,
  type WorldMapEntity,
  type MapHero,
  type MapHex,
  type WorldMapSlotContext,
} from './WorldMapTemplate';

// 3D Game Canvas Templates are NOT barrel-exported because they depend on
// @react-three/fiber + three which are optional peer dependencies.
// Import directly if needed:
//   import { GameCanvas3DWorldMapTemplate } from '@almadar/ui/components/templates/GameCanvas3DWorldMapTemplate';
//   import { GameCanvas3DBattleTemplate } from '@almadar/ui/components/templates/GameCanvas3DBattleTemplate';
//   import { GameCanvas3DCastleTemplate } from '@almadar/ui/components/templates/GameCanvas3DCastleTemplate';
