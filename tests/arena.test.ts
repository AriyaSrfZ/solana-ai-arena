import test from 'node:test';
import assert from 'node:assert/strict';
import { Gladiator } from '../src/combat/types.js';
import { updateMorale, recalculateEmotion, applyEmotionalMultipliers } from '../src/combat/emo.js';
import { simulateTurn, executeMatch } from '../src/combat/engine.js';

function createMockGladiator(id: string, name: string): Gladiator {
  return {
    id,
    name,
    universe: 'NEO_TOKYO',
    archetype: 'Netrunner',
    maxHp: 100,
    currentHp: 100,
    attack: 25,
    defense: 15,
    speed: 10,
    specialMove: 'Buffer Overflow',
    morale: 50,
    emotion: 'FOCUSED'
  };
}

test('EMO: Low morale transitions gladiator into TILTED state', () => {
  const g = createMockGladiator('g1', 'ZeroDay');
  updateMorale(g, -40); // Morale becomes 10 (<= 15)
  assert.equal(g.emotion, 'TILTED', 'Gladiator should be TILTED');
  
  const mods = applyEmotionalMultipliers(g);
  assert.equal(mods.missChancePercent, 25, 'Tilted gladiator has 25% miss chance');
});

test('EMO: High morale transitions gladiator into CONFIDENT state', () => {
  const g = createMockGladiator('g2', 'Oni-Enforcer');
  updateMorale(g, +40); // Morale becomes 90 (>= 80)
  assert.equal(g.emotion, 'CONFIDENT', 'Gladiator should be CONFIDENT');
  
  const mods = applyEmotionalMultipliers(g);
  assert.equal(mods.critBonusPercent, 15, 'Confident gladiator gains +15% crit chance');
});

test('Combat: simulateTurn deals damage and updates morale feedback', () => {
  const attacker = createMockGladiator('a1', 'Striker');
  const defender = createMockGladiator('d1', 'Defender');
  const initialDefHp = defender.currentHp;

  const action = simulateTurn(1, attacker, defender);
  assert.ok(action.turn === 1);
  if (!action.combatLog.includes('MISSED')) {
    assert.ok(defender.currentHp < initialDefHp, 'Defender took damage');
    assert.ok(action.damageDealt > 0);
  }
});

test('Combat: executeMatch runs full match and resolves decisive winner', () => {
  const fA = createMockGladiator('fa', 'Centurion-X');
  const fB = createMockGladiator('fb', 'Retiarius');
  const wager = 100_000_000; // 0.1 SOL

  const match = executeMatch('match-001', fA, fB, wager);

  assert.ok(match.totalTurns > 0, 'Match completed in turns');
  assert.ok(['fa', 'fb'].includes(match.winnerId), 'Decisive winner determined');
  assert.ok(match.log.length > 0, 'Combat log is populated');

  // Verify 90/10 payout split math
  assert.equal(match.payoutSplit.winnerPayoutLamports, 90_000_000, 'Winner gets 90% (0.09 SOL)');
  assert.equal(match.payoutSplit.houseRakeLamports, 10_000_000, 'House takes 10% (0.01 SOL)');
  assert.equal(
    match.payoutSplit.winnerPayoutLamports + match.payoutSplit.houseRakeLamports,
    match.payoutSplit.totalPotLamports,
    'No lamports leaked in rake calculation'
  );
});
