import { Gladiator, CombatAction, MatchResult } from './types.js';
import { updateMorale, applyEmotionalMultipliers, generatePsychologicalTaunt } from './emo.js';

export const OPERATOR_WALLET = "2nNtE6uEJQjX5vN1cS1m4FBRDuxxqq2hwmtFqn92xkNd";

export function simulateTurn(
  turn: number,
  attacker: Gladiator,
  defender: Gladiator
): CombatAction {
  const mods = applyEmotionalMultipliers(attacker);
  const defMods = applyEmotionalMultipliers(defender);

  // Check if attacker misses due to emotional TILT or PANIC
  const roll = Math.random() * 100;
  if (roll < mods.missChancePercent) {
    updateMorale(attacker, -10); // Missing tilts you further
    return {
      turn,
      attackerId: attacker.id,
      defenderId: defender.id,
      actionType: 'STRIKE',
      damageDealt: 0,
      isCrit: false,
      attackerEmotion: attacker.emotion,
      defenderEmotion: defender.emotion,
      combatLog: `${attacker.name} swung recklessly while ${attacker.emotion} and completely MISSED!`,
    };
  }

  // Calculate base damage with modifiers
  const isCrit = (Math.random() * 100) < (10 + mods.critBonusPercent);
  const rawAttack = attacker.attack * mods.attackMultiplier * (isCrit ? 1.75 : 1.0);
  const effectiveDef = defender.defense * defMods.defenseMultiplier;
  const netDamage = Math.max(5, Math.round(rawAttack - (effectiveDef * 0.4)));

  defender.currentHp = Math.max(0, defender.currentHp - netDamage);

  // Morale feedback
  updateMorale(attacker, isCrit ? +15 : +5);
  updateMorale(defender, isCrit ? -20 : -10);

  // Generate taunt if significant damage or crit
  let tauntMessage: string | undefined;
  if (isCrit || netDamage > 25) {
    tauntMessage = generatePsychologicalTaunt(attacker, defender, netDamage);
    updateMorale(defender, -10); // Taunts hurt defender morale
  }

  return {
    turn,
    attackerId: attacker.id,
    defenderId: defender.id,
    actionType: isCrit ? 'SPECIAL' : 'STRIKE',
    damageDealt: netDamage,
    isCrit,
    attackerEmotion: attacker.emotion,
    defenderEmotion: defender.emotion,
    combatLog: `${attacker.name} strikes ${defender.name} for ${netDamage} damage! ${isCrit ? '[CRITICAL HIT!]' : ''}`,
    tauntMessage
  };
}

export function executeMatch(
  matchId: string,
  fighterA: Gladiator,
  fighterB: Gladiator,
  wagerLamports: number
): MatchResult {
  const log: CombatAction[] = [];
  let turn = 1;
  const maxTurns = 30;

  // Faster fighter acts first
  let [first, second] = fighterA.speed >= fighterB.speed ? [fighterA, fighterB] : [fighterB, fighterA];

  while (first.currentHp > 0 && second.currentHp > 0 && turn <= maxTurns) {
    // First attacks second
    const action1 = simulateTurn(turn, first, second);
    log.push(action1);
    if (second.currentHp <= 0) break;

    // Second counters
    const action2 = simulateTurn(turn, second, first);
    log.push(action2);
    if (first.currentHp <= 0) break;

    turn++;
  }

  const winner = first.currentHp > 0 ? first : second;
  const loser = first.currentHp > 0 ? second : first;

  // 90% to winner, 10% to house rake
  const houseRakeLamports = Math.floor(wagerLamports * 0.10);
  const winnerPayoutLamports = wagerLamports - houseRakeLamports;

  return {
    matchId,
    winnerId: winner.id,
    loserId: loser.id,
    totalTurns: turn,
    log,
    payoutSplit: {
      winnerPayoutLamports,
      houseRakeLamports,
      totalPotLamports: wagerLamports
    }
  };
}
