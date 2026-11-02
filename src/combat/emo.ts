import { EmotionalState, Gladiator } from './types.js';

export function updateMorale(gladiator: Gladiator, delta: number): void {
  gladiator.morale = Math.max(0, Math.min(100, gladiator.morale + delta));
  recalculateEmotion(gladiator);
}

export function recalculateEmotion(gladiator: Gladiator): void {
  const hpPercent = (gladiator.currentHp / gladiator.maxHp) * 100;

  if (gladiator.morale <= 15) {
    gladiator.emotion = 'TILTED';
  } else if (hpPercent <= 25 && gladiator.morale < 40) {
    gladiator.emotion = 'PANICKED';
  } else if (hpPercent <= 40 && gladiator.morale >= 50) {
    gladiator.emotion = 'ENRAGED';
  } else if (gladiator.morale >= 80) {
    gladiator.emotion = 'CONFIDENT';
  } else {
    gladiator.emotion = 'FOCUSED';
  }
}

export function applyEmotionalMultipliers(gladiator: Gladiator): {
  attackMultiplier: number;
  defenseMultiplier: number;
  critBonusPercent: number;
  missChancePercent: number;
} {
  switch (gladiator.emotion) {
    case 'CONFIDENT':
      return { attackMultiplier: 1.10, defenseMultiplier: 0.90, critBonusPercent: 15, missChancePercent: 0 };
    case 'FOCUSED':
      return { attackMultiplier: 1.00, defenseMultiplier: 1.20, critBonusPercent: 5, missChancePercent: 0 };
    case 'ENRAGED':
      return { attackMultiplier: 1.30, defenseMultiplier: 0.85, critBonusPercent: 20, missChancePercent: 5 };
    case 'PANICKED':
      return { attackMultiplier: 0.85, defenseMultiplier: 0.80, critBonusPercent: 0, missChancePercent: 15 };
    case 'TILTED':
      return { attackMultiplier: 0.75, defenseMultiplier: 0.70, critBonusPercent: 0, missChancePercent: 25 };
    default:
      return { attackMultiplier: 1.0, defenseMultiplier: 1.0, critBonusPercent: 0, missChancePercent: 0 };
  }
}

export function generatePsychologicalTaunt(attacker: Gladiator, defender: Gladiator, damage: number): string {
  const taunts = [
    `"${defender.name}, your neural latency is lagging. Did you buy that cyberware on clearance?"`,
    `"${defender.name}, that hit cracked your core. Even the spectator algorithms are betting against you."`,
    `"Is that all the power from ${defender.universe}? Your corporate sponsors must be weeping."`,
    `"Overheating already? Check your telemetry, you're about to be dismantled."`
  ];
  return taunts[Math.floor(Math.random() * taunts.length)];
}
