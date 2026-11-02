import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Gladiator, Universe } from './combat/types.js';
import { executeMatch, OPERATOR_WALLET } from './combat/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3040;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const UNIVERSES: Record<Universe, { fA: Partial<Gladiator>; fB: Partial<Gladiator> }> = {
  NEO_TOKYO: {
    fA: { name: 'ZeroDay', archetype: 'Netrunner Specialist', attack: 26, defense: 14, speed: 12, specialMove: 'Buffer Overflow' },
    fB: { name: 'Oni-Enforcer', archetype: 'Thermal Katana Heavy', attack: 28, defense: 12, speed: 10, specialMove: 'Dragon Sever' }
  },
  IRON_COLOSSEUM: {
    fA: { name: 'Centurion-X', archetype: 'Hydraulic Towershield', attack: 22, defense: 20, speed: 8, specialMove: 'Caesar Execution' },
    fB: { name: 'Retiarius', archetype: 'Magnetic Shock Trident', attack: 29, defense: 10, speed: 14, specialMove: 'Net Entangle' }
  },
  DEEP_VOID: {
    fA: { name: 'Scrap-Reaper', archetype: 'Plasma Drill Scavenger', attack: 25, defense: 16, speed: 9, specialMove: 'Depressurize' },
    fB: { name: 'Void-Wraith', archetype: 'Pressurized Acid Siphon', attack: 27, defense: 13, speed: 13, specialMove: 'Void Phase' }
  },
  ELDRITCH_NODE: {
    fA: { name: 'Daemon-Vessel', archetype: 'Corrupted Neural Husk', attack: 30, defense: 10, speed: 11, specialMove: 'Cognitive Hazard' },
    fB: { name: 'Null-Inquisitor', archetype: 'EMP Sanctifier', attack: 24, defense: 18, speed: 9, specialMove: 'Sanctified EMP' }
  },
  WALL_STREET: {
    fA: { name: 'Liquidation-Broker', archetype: 'Capital Scaling Enforcer', attack: 26, defense: 15, speed: 10, specialMove: 'Margin Call' },
    fB: { name: 'Quant-Stalker', archetype: 'Predictive Dodge AI', attack: 25, defense: 15, speed: 12, specialMove: 'Arbitrage Strike' }
  }
};

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Cyber-Arena Omni-Rail',
    operatorWallet: OPERATOR_WALLET,
    universesSupported: Object.keys(UNIVERSES),
    activeRails: ['Solana Web3 Native', 'Telegram Mini-App', 'x402 Agent Protocol', 'WebSocket Arena', 'Ed25519 Receipts']
  });
});

app.post('/api/match', (req, res) => {
  const { universe, wagerSol } = req.body;
  const selectedUniverse: Universe = (universe && UNIVERSES[universe as Universe]) ? universe as Universe : 'NEO_TOKYO';
  const uData = UNIVERSES[selectedUniverse];

  const fA: Gladiator = {
    id: 'fa',
    name: uData.fA.name!,
    universe: selectedUniverse,
    archetype: uData.fA.archetype!,
    maxHp: 100,
    currentHp: 100,
    attack: uData.fA.attack!,
    defense: uData.fA.defense!,
    speed: uData.fA.speed!,
    specialMove: uData.fA.specialMove!,
    morale: 50,
    emotion: 'FOCUSED'
  };

  const fB: Gladiator = {
    id: 'fb',
    name: uData.fB.name!,
    universe: selectedUniverse,
    archetype: uData.fB.archetype!,
    maxHp: 100,
    currentHp: 100,
    attack: uData.fB.attack!,
    defense: uData.fB.defense!,
    speed: uData.fB.speed!,
    specialMove: uData.fB.specialMove!,
    morale: 50,
    emotion: 'FOCUSED'
  };

  const wagerLamports = Math.round((Number(wagerSol) || 0) * 1e9);
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Run combat simulation
  const result = executeMatch(matchId, fA, fB, wagerLamports);

  // Map defender remaining HP into the log for smooth UI playback
  const enrichedLog = result.log.map((action, idx) => {
    return {
      ...action,
      defenderHp: action.defenderId === 'fa' ? fA.currentHp : fB.currentHp
    };
  });

  res.json({
    matchId,
    universe: selectedUniverse,
    winnerId: result.winnerId,
    winnerName: result.winnerId === 'fa' ? fA.name : fB.name,
    totalTurns: result.totalTurns,
    log: enrichedLog,
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
