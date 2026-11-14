import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Gladiator, Universe } from './combat/types.js';
import { executeMatch, OPERATOR_WALLET } from './combat/engine.js';
import { STARTER_PACKS, generateGladiator, GladiatorNFT } from './economy/packs.js';
import { awardBattleXp, getUnlockedTraits } from './progression/leveling.js';
import { getTierFromMmr, updatePlayerRank, PlayerRankProfile } from './ranked/elo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3040;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory ladder and inventory state
const ladderProfiles = new Map<string, PlayerRankProfile>();
const userGladiators = new Map<string, GladiatorNFT[]>();

function getOrCreateProfile(wallet: string): PlayerRankProfile {
  if (!ladderProfiles.has(wallet)) {
    ladderProfiles.set(wallet, {
      wallet,
      mmr: 1200,
      tier: 'SILVER',
      division: 4,
      lp: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      seasonRewardPoolSharePercent: 0.01
    });
  }
  return ladderProfiles.get(wallet)!;
}

// Seed mock ranked ladder for Apex competitive ladder
const seedWallets = [
  { wallet: '8xZ...Challenger1', mmr: 2540, tier: 'CHALLENGER', div: 1, wins: 142, losses: 38 },
  { wallet: '4kM...GrandMaster', mmr: 2280, tier: 'MASTER', div: 1, wins: 98, losses: 32 },
  { wallet: '9pL...DiamondApex', mmr: 1980, tier: 'DIAMOND', div: 2, wins: 76, losses: 41 },
  { wallet: '3tN...GoldStriker', mmr: 1520, tier: 'GOLD', div: 3, wins: 45, losses: 39 },
  { wallet: '6wQ...SilverGamer', mmr: 1240, tier: 'SILVER', div: 4, wins: 24, losses: 28 },
  { wallet: '1bV...IronRecruit', mmr: 450, tier: 'IRON', div: 2, wins: 4, losses: 18 }
];

seedWallets.forEach(s => {
  ladderProfiles.set(s.wallet, {
    wallet: s.wallet,
    mmr: s.mmr,
    tier: s.tier as any,
    division: s.div,
    lp: 75,
    wins: s.wins,
    losses: s.losses,
    winStreak: 3,
    seasonRewardPoolSharePercent: 0.10
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Cyber-Arena Omni-Rail',
    operatorWallet: OPERATOR_WALLET,
    starterPacksActive: Object.keys(STARTER_PACKS),
    rankedTiers: ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'CHALLENGER'],
    activeRails: ['Solana Web3 Native', 'Telegram Mini-App', 'x402 Agent Protocol', 'WebSocket Arena', 'Ed25519 Receipts']
  });
});

app.get('/api/packs', (req, res) => {
  res.json({
    packs: STARTER_PACKS,
    treasuryWallet: OPERATOR_WALLET,
    notice: '100% of Starter Pack mint fees route non-custodially to treasury.'
  });
});

app.post('/api/packs/mint', (req, res) => {
  const { wallet, packType, universe } = req.body;
  const pType = packType || 'RECRUIT';
  const pack = STARTER_PACKS[pType] || STARTER_PACKS.RECRUIT;
  const targetUniverse = universe || 'NEO_TOKYO';
  const userWallet = wallet || 'demo_player_wallet';

  const minted: GladiatorNFT[] = [];
  for (let i = 0; i < pack.gladiatorCount; i++) {
    const glad = generateGladiator(userWallet, targetUniverse, pack.guaranteedRarity);
    glad.xp += pack.bonusXp;
    minted.push(glad);
  }

  const existing = userGladiators.get(userWallet) || [];
  userGladiators.set(userWallet, [...existing, ...minted]);

  res.json({
    packType: pack.packType,
    costSol: pack.priceSol,
    mintedCount: minted.length,
    gladiators: minted,
    treasuryPayout: {
      recipient: OPERATOR_WALLET,
      amountSol: pack.priceSol
    }
  });
});

app.get('/api/ladder', (req, res) => {
  const list = Array.from(ladderProfiles.values())
    .sort((a, b) => b.mmr - a.mmr)
    .slice(0, 25);
  res.json({
    season: 'Season 1: Omni-Genesis',
    totalCompetitors: ladderProfiles.size,
    leaderboard: list
  });
});

app.post('/api/match', (req, res) => {
  const { universe, wagerSol, wallet } = req.body;
  const selectedUniverse: Universe = universe || 'NEO_TOKYO';
  const playerWallet = wallet || 'sol_player_primary';
  const profile = getOrCreateProfile(playerWallet);

  const fA: Gladiator = {
    id: 'player_1',
    name: 'ZeroDay (Level 3 Netrunner)',
    universe: selectedUniverse,
    archetype: 'Netrunner Specialist',
    maxHp: 116,
    currentHp: 116,
    attack: 31,
    defense: 18,
    speed: 12,
    specialMove: 'Buffer Overflow',
    morale: 60,
    emotion: 'FOCUSED'
  };

  const fB: Gladiator = {
    id: 'rival_bot',
    name: 'Apex Syndicate Enforcer',
    universe: selectedUniverse,
    archetype: 'Yakuza Heavy',
    maxHp: 110,
    currentHp: 110,
    attack: 28,
    defense: 16,
    speed: 10,
    specialMove: 'Dragon Sever',
    morale: 50,
    emotion: 'FOCUSED'
  };

  const wagerLamports = Math.round((Number(wagerSol) || 0) * 1e9);
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const result = executeMatch(matchId, fA, fB, wagerLamports);
  const playerWon = result.winnerId === 'player_1';

  // Update Apex-tier Ranked MMR & Tier
  const rankUpdate = updatePlayerRank(profile, playerWon, 1250);

  res.json({
    matchId,
    universe: selectedUniverse,
    winnerId: result.winnerId,
    winnerName: playerWon ? fA.name : fB.name,
    totalTurns: result.totalTurns,
    log: result.log,
    rankedUpdate: {
      playerWon,
      mmrChange: rankUpdate.mmrGained,
      currentMmr: profile.mmr,
      tier: profile.tier,
      division: profile.division,
      lp: profile.lp,
      winStreak: profile.winStreak
    },
    payoutSplit: {
      totalPotSol: (result.payoutSplit.totalPotLamports / 1e9).toFixed(3),
      winnerPayoutSol: (result.payoutSplit.winnerPayoutLamports / 1e9).toFixed(3),
      houseRakeSol: (result.payoutSplit.houseRakeLamports / 1e9).toFixed(3),
      operatorWallet: OPERATOR_WALLET
    }
  });
});

app.listen(PORT, () => {
  console.log(`[CYBER-ARENA] Live on http://localhost:${PORT}`);
});
