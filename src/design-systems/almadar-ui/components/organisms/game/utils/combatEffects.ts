/**
 * Combat Effects Utility
 *
 * CSS animation utilities and effect triggers for combat visualization.
 * Extracted from Trait Wars design-system.
 */

export const combatAnimations = {
    shake: `
    @keyframes combat-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `,
    flash: `
    @keyframes combat-flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; filter: brightness(2); }
    }
  `,
    pulseRed: `
    @keyframes combat-pulse-red {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      50% { box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.6); }
    }
  `,
    healGlow: `
    @keyframes combat-heal-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      50% { box-shadow: 0 0 30px 10px rgba(34, 197, 94, 0.5); }
    }
  `,
};

export const combatClasses = {
    shake: 'animate-[combat-shake_0.3s_ease-in-out]',
    flash: 'animate-[combat-flash_0.2s_ease-in-out_2]',
    pulseRed: 'animate-[combat-pulse-red_0.5s_ease-in-out]',
    healGlow: 'animate-[combat-heal-glow_0.8s_ease-in-out]',
    hit: 'animate-pulse brightness-150',
    defend: 'animate-bounce',
    critical: 'animate-ping',
};

export interface CombatEffect {
    className: string;
    duration: number;
    sound?: string;
}

export const combatEffects: Record<string, CombatEffect> = {
    attack: { className: 'animate-pulse brightness-125', duration: 300 },
    hit: { className: 'animate-[shake_0.3s_ease-in-out] brightness-150', duration: 300 },
    critical: { className: 'animate-ping scale-110', duration: 500 },
    defend: { className: 'animate-bounce ring-4 ring-blue-400', duration: 400 },
    heal: { className: 'brightness-125 ring-4 ring-green-400', duration: 600 },
    defeat: { className: 'grayscale opacity-50 scale-75', duration: 800 },
    levelUp: { className: 'animate-bounce ring-4 ring-yellow-400 brightness-150', duration: 1000 },
};

export function applyTemporaryEffect(
    element: HTMLElement,
    effect: CombatEffect,
    onComplete?: () => void,
): void {
    const originalClass = element.className;
    element.className = `${originalClass} ${effect.className}`;
    setTimeout(() => {
        element.className = originalClass;
        onComplete?.();
    }, effect.duration);
}

export interface DamageResult {
    baseDamage: number;
    finalDamage: number;
    isCritical: boolean;
    isBlocked: boolean;
    damageReduction: number;
}

export function calculateDamage(
    attack: number,
    defense: number,
    isDefending: boolean = false,
    criticalChance: number = 0.1,
): DamageResult {
    const isCritical = Math.random() < criticalChance;
    const baseDamage = attack;
    const defenseMultiplier = isDefending ? 2 : 1;
    const effectiveDefense = defense * defenseMultiplier;
    let finalDamage = Math.max(1, baseDamage - effectiveDefense);
    if (isCritical) finalDamage = Math.floor(finalDamage * 2);
    const isBlocked = finalDamage <= 1 && effectiveDefense > baseDamage;
    const damageReduction = baseDamage - finalDamage;
    return { baseDamage, finalDamage, isCritical, isBlocked, damageReduction };
}

export type CombatEventType =
    | 'attack' | 'critical' | 'defend' | 'heal'
    | 'defeat' | 'level_up' | 'state_change';

export interface CombatEventData {
    type: CombatEventType;
    sourceId: string;
    targetId?: string;
    value?: number;
    message: string;
}

export function generateCombatMessage(event: CombatEventData): string {
    return event.message;
}
