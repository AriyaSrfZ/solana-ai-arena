import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGladiator, STARTER_PACKS } from '../src/economy/packs.js';
import { awardBattleXp, getUnlockedTraits } from '../src/progression/leveling.js';
import { getTierFromMmr, calculateEloDelta, updatePlayerRank, PlayerRankProfile } from '../src/ranked/elo.js';

test('Starter Packs: Apex High-Roller pack generates boosted Epic/Legendary gladiator', () => {
  const glad = generateGladiator('wallet_123', 'NEO_TOKYO', 'EPIC');
  assert.ok(['EPIC', 'LEGENDARY'].includes(glad.rarity), 'Guaranteed Epic or Legendary');
  assert.ok(glad.maxHp >= 130, 'Epic/Legendary has higher base HP (>= 130)');
  assert.ok(glad.attack >= 32, 'Epic/Legendary has boosted base attack (>= 32)');
  assert.equal(STARTER_PACKS.APEX_HIGH_ROLLER.priceSol, 0.20);
});

test('Leveling: Battle XP awards levels and increases core combat stats', () => {
  const glad = generateGladiator('wallet_abc', 'IRON_COLOSSEUM', 'COMMON');
  const initialHp = glad.maxHp;
  const initialAtk = glad.attack;

  // Award enough XP for multiple level-ups
  const result = awardBattleXp(glad, true, 500); // 120 + 500 = 620 XP
  assert.ok(result.leveledUp, 'Gladiator should level up');
  assert.ok(glad.level > 1, 'Level increased beyond 1');
  assert.ok(glad.maxHp > initialHp, 'Max HP grew with level');
  assert.ok(glad.attack > initialAtk, 'Attack grew with level');

  const traits = getUnlockedTraits(glad.level);
  assert.ok(traits.length >= 1);
});

test('Elo Ladder: Accurately maps MMR to Apex competitive tiers', () => {
  assert.equal(getTierFromMmr(450).tier, 'IRON');
  assert.equal(getTierFromMmr(1250).tier, 'SILVER');
  assert.equal(getTierFromMmr(1500).tier, 'GOLD');
  assert.equal(getTierFromMmr(1950).tier, 'DIAMOND');
  assert.equal(getTierFromMmr(2200).tier, 'MASTER');
  assert.equal(getTierFromMmr(2500).tier, 'CHALLENGER');
});

test('Elo Ladder: Winner gains rating, loser loses rating, streaks track cleanly', () => {
  const player: PlayerRankProfile = {
    wallet: 'sol_player_1',
    mmr: 1200,
    tier: 'SILVER',
    division: 4,
    lp: 0,
    wins: 10,
    losses: 5,
    winStreak: 2,
    seasonRewardPoolSharePercent: 0.01
  };

  const update = updatePlayerRank(player, true, 1200);
  assert.ok(update.mmrGained > 0, 'Winner gains MMR');
  assert.equal(player.wins, 11);
  assert.equal(player.winStreak, 3, 'Win streak increments');
  assert.ok(player.mmr > 1200);
});
