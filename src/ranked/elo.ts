export type RankedTier = 
  | 'IRON' 
  | 'BRONZE' 
  | 'SILVER' 
  | 'GOLD' 
  | 'PLATINUM' 
  | 'DIAMOND' 
  | 'MASTER' 
  | 'CHALLENGER';

export interface PlayerRankProfile {
  wallet: string;
  mmr: number;
  tier: RankedTier;
  division: number; // 4, 3, 2, 1
  lp: number; // 0 to 100
  wins: number;
  losses: number;
  winStreak: number;
  seasonRewardPoolSharePercent: number;
}

export function getTierFromMmr(mmr: number): { tier: RankedTier; division: number; lp: number } {
  if (mmr >= 2400) return { tier: 'CHALLENGER', division: 1, lp: Math.min(100, mmr - 2400) };
  if (mmr >= 2100) return { tier: 'MASTER', division: 1, lp: Math.min(100, mmr - 2100) };
  if (mmr >= 1800) {
    const inTier = mmr - 1800;
    const div = 4 - Math.floor(inTier / 75);
    return { tier: 'DIAMOND', division: Math.max(1, Math.min(4, div)), lp: inTier % 75 };
  }
  if (mmr >= 1600) {
    const inTier = mmr - 1600;
    const div = 4 - Math.floor(inTier / 50);
    return { tier: 'PLATINUM', division: Math.max(1, Math.min(4, div)), lp: inTier % 50 * 2 };
  }
  if (mmr >= 1400) {
    const inTier = mmr - 1400;
    const div = 4 - Math.floor(inTier / 50);
    return { tier: 'GOLD', division: Math.max(1, Math.min(4, div)), lp: inTier % 50 * 2 };
  }
  if (mmr >= 1200) {
    const inTier = mmr - 1200;
    const div = 4 - Math.floor(inTier / 50);
    return { tier: 'SILVER', division: Math.max(1, Math.min(4, div)), lp: inTier % 50 * 2 };
  }
  if (mmr >= 1000) {
    const inTier = mmr - 1000;
    const div = 4 - Math.floor(inTier / 50);
    return { tier: 'BRONZE', division: Math.max(1, Math.min(4, div)), lp: inTier % 50 * 2 };
  }

  // Under 1000 MMR is IRON
  const inTier = Math.max(0, mmr);
  const div = 4 - Math.floor(inTier / 250);
  return { tier: 'IRON', division: Math.max(1, Math.min(4, div)), lp: Math.round((inTier % 250) / 2.5) };
}

export function calculateEloDelta(
  ratingA: number,
  ratingB: number,
  aWon: boolean,
  kFactor: number = 32
): { deltaA: number; deltaB: number } {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  const actualA = aWon ? 1 : 0;
  const actualB = aWon ? 0 : 1;

  const deltaA = Math.round(kFactor * (actualA - expectedA));
  const deltaB = Math.round(kFactor * (actualB - expectedB));

  return { deltaA, deltaB };
}

export function updatePlayerRank(
  profile: PlayerRankProfile,
  isVictory: boolean,
  opponentMmr: number
): { mmrGained: number; newTier: RankedTier } {
  const { deltaA } = calculateEloDelta(profile.mmr, opponentMmr, isVictory);
  profile.mmr = Math.max(100, profile.mmr + deltaA);

  if (isVictory) {
    profile.wins += 1;
    profile.winStreak += 1;
  } else {
    profile.losses += 1;
    profile.winStreak = 0;
  }

  const rankInfo = getTierFromMmr(profile.mmr);
  profile.tier = rankInfo.tier;
  profile.division = rankInfo.division;
  profile.lp = rankInfo.lp;

  const tierShares: Record<RankedTier, number> = {
    IRON: 0,
    BRONZE: 0,
    SILVER: 0.01,
    GOLD: 0.05,
    PLATINUM: 0.10,
    DIAMOND: 0.20,
    MASTER: 0.30,
    CHALLENGER: 0.34
  };
  profile.seasonRewardPoolSharePercent = tierShares[profile.tier];

  return { mmrGained: deltaA, newTier: profile.tier };
}
