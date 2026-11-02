export type Universe = 
  | 'NEO_TOKYO' 
  | 'IRON_COLOSSEUM' 
  | 'DEEP_VOID' 
  | 'ELDRITCH_NODE' 
  | 'WALL_STREET';

export type EmotionalState = 
  | 'CONFIDENT' 
  | 'FOCUSED' 
  | 'ENRAGED' 
  | 'PANICKED' 
  | 'TILTED';

export interface Gladiator {
  id: string;
  name: string;
  universe: Universe;
  archetype: string;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  specialMove: string;
  morale: number; // 0 to 100
  emotion: EmotionalState;
}

export interface CombatAction {
  turn: number;
  attackerId: string;
  defenderId: string;
  actionType: 'STRIKE' | 'DEFEND' | 'SPECIAL' | 'TAUNT';
  damageDealt: number;
  isCrit: boolean;
  attackerEmotion: EmotionalState;
  defenderEmotion: EmotionalState;
  combatLog: string;
  tauntMessage?: string;
}

export interface MatchResult {
  matchId: string;
  winnerId: string;
  loserId: string;
  totalTurns: number;
  log: CombatAction[];
  payoutSplit: {
    winnerPayoutLamports: number;
    houseRakeLamports: number;
    totalPotLamports: number;
  };
}
