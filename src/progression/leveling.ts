import { GladiatorNFT } from '../economy/packs.js';

export function calculateNextLevelXp(level: number): number {
  return Math.round(100 * Math.pow(1.22, level - 1));
}

export function awardBattleXp(
  gladiator: GladiatorNFT,
  isVictory: boolean,
  bonusXp: number = 0
): { leveledUp: boolean; oldLevel: number; newLevel: number; levelsGained: number } {
  const baseReward = isVictory ? 120 : 40;
  const totalEarned = baseReward + bonusXp;

  gladiator.xp += totalEarned;
  const oldLevel = gladiator.level;

  let leveledUp = false;
  while (gladiator.xp >= gladiator.nextLevelXp) {
    gladiator.xp -= gladiator.nextLevelXp;
    gladiator.level += 1;
    leveledUp = true;

    // Stat Growth per Level
    gladiator.maxHp += 8;
    gladiator.attack += 3;
    gladiator.defense += 2;
    gladiator.speed += 1;
    gladiator.currentHp = gladiator.maxHp;

    gladiator.nextLevelXp = calculateNextLevelXp(gladiator.level);
  }

  return {
    leveledUp,
    oldLevel,
    newLevel: gladiator.level,
    levelsGained: gladiator.level - oldLevel
  };
}

export function getUnlockedTraits(level: number): string[] {
  const perks: string[] = ['Basic Circuitry'];
  if (level >= 5) perks.push('Level 5: Neural Overclock (Special Move Tier 2)');
  if (level >= 10) perks.push('Level 10: Morale Anchor (Immune to Turn 1 Tilt)');
  if (level >= 20) perks.push('Level 20: Apex Executioner (+10% Crit Chance)');
  if (level >= 30) perks.push('Level 30: Nanite Reconstitution (10% HP Regen per Round)');
  return perks;
}
