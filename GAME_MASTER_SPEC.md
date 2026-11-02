# MASTER SPECIFICATION: CYBER-ARENA OMNI-RAIL (SOLANA AI COMBAT ECOSYSTEM)
**Document Version:** 2.0.0-PRODUCTION  
**Architect:** Ariya Sarrafzadeh (callsign HaroSS)  
**Target Payout Wallet:** `2nNtE6uEJQjX5vN1cS1m4FBRDuxxqq2hwmtFqn92xkNd` (100% Non-Custodial SPL USDC / SOL)

---

## 1. THE 5-RAIL MULTI-CHANNEL ARCHITECTURE

To avoid single-channel decay, the platform operates across 5 concurrent operational rails:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CYBER-ARENA CORE ENGINE                         │
│       (Deterministic Turn Resolution + Ed25519 Cryptographic Proof)    │
└────────┬──────────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │              │                  │
         ▼              ▼              ▼              ▼                  ▼
      [RAIL 1]       [RAIL 2]       [RAIL 3]       [RAIL 4]           [RAIL 5]
     Solana Web3     Telegram       x402 Agent     WebSocket        Cryptographic
    Native & Pay     Mini-App       Machine Tax    Live Arena         Receipts
     (Phantom /       (TMA Web3      (Autonomous   (Spectators,      (Ed25519 &
     Solflare)         Lobby)        Bot Wagers)   Crowd Hype)      Blockhash VRF)
```

### Rail 1: Solana Web3 & Solana Pay Native Layer
- **Deposit & Wagering**: Supports direct wallet connection (Phantom, Solflare, Backpack) via `@solana/wallet-adapter`.
- **Solana Pay v1 Transaction Requests**: Generates instant QR codes for mobile users and spectators.
- **Rake Settlement**: 100% non-custodial. Every match escrow automatically splits 90% to the victor and **10% directly to `2nNtE6uEJQjX5vN1cS1m4FBRDuxxqq2hwmtFqn92xkNd`**.

### Rail 2: Telegram Mini-App (TMA) Mobile Client
- **Target Audience**: 90% of crypto gamblers operate inside Telegram groups and alpha chats.
- **Integration**: Full Telegram WebApp SDK embedding. Players launch the arena directly from any chat using `@CyberArenaBot`.
- **Frictionless Onboarding**: Creates an instant ephemeral session keypair with 1-click cloud backup, funded via Solana Pay or TON bridge.

### Rail 3: x402 Machine-to-Machine Agent Wagering Rail
- **Agent Economy**: Autonomous AI trading bots and Discord/X bots can wager on battles without a browser interface.
- **Protocol**: Standard `HTTP 402 Payment Required` headers. An external bot sends an HTTP POST with micro-USDC to back a fighter and receives signed match streaming data.

### Rail 4: WebSocket Real-Time Arena & Crowdsourcing Lobby
- **Bi-directional Low Latency**: Sub-50ms WebSocket feed streaming turn-by-turn action, HP updates, and retro CRT combat animations.
- **Crowd Influence (Micro-Tipping)**: Spectators spend 0.005 SOL to deploy arena hazards (EMP strikes, adrenaline stims, glitch storms) that influence the fighters' emotional states.

### Rail 5: Cryptographic Receipts & Verifiable Randomness
- **Fair Randomness**: Combat rolls (critical hits, evasion) use a commit-reveal scheme salted with the latest Solana blockhash.
- **Ed25519 Proofs**: Every completed match generates a signed cryptographic receipt containing full turn telemetry, preventing disputed payouts.

---

## 2. THE 5 NARRATIVE UNIVERSES & CHARACTER FACTIONS

The arena supports 5 deeply crafted narrative universes, each with distinct psychological archetypes, combat mechanics, and visual styles:

```
                                  [ THE 5 UNIVERSES ]
       ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
       ▼                  ▼                 ▼                  ▼                  ▼
[NEO-TOKYO 2099]   [IRON COLOSSEUM]   [DEEP VOID CARTEL]  [ELDRITCH NODE]   [WALL STREET 2099]
Netrunners &       Chrome Heavy       Asteroid Miners &   Occult AI &       HFT Algorithms &
Yakuza Enforcers   Bloodsport         Void Pirates        Daemon Daemons    Corporate Assassins
```

### Universe 1: Neo-Tokyo Syndicate (Cyberpunk / Netrunner Heist)
- **Setting**: Rain-drenched megacities, neon back-alleys, corporate neural towers.
- **Archetypes**:
  - *ZeroDay*: Elite hacker manipulating opponent cyberware, causing weapon jams and interface lag.
  - *Oni-Enforcer*: Augmented brawler with thermal katanas and subdermal ballistic weave.
- **Special Combat Move**: `Buffer Overflow` — Deals damage equal to 25% of opponent's remaining energy and causes 1 turn of disorientation.

### Universe 2: The Iron Colosseum (Ancient Roman Cyber-Bloodsport)
- **Setting**: Orbital amphitheaters, sand soaked in synthetic coolant, roaring holo-crowds.
- **Archetypes**:
  - *Centurion-X*: Heavy power-armor juggernaut with hydraulic towershield and kinetic pile-bunker.
  - *Retiarius*: Agility fighter deploying razor-wire magnetic nets and high-frequency trident strikes.
- **Special Combat Move**: `Caesar’s Execution` — Execute threshold: If target HP is below 20%, instant knockout; otherwise gains 15% armor buff.

### Universe 3: Deep Void Cartel (Outer-Rim Asteroid Mining Pirates)
- **Setting**: Zero-G salvage platforms, unshielded reactor bays, industrial plasma cutters.
- **Archetypes**:
  - *Scrap-Reaper*: Scavenger utilizing heavy mining drills and gravitational anchors.
  - *Void-Wraith*: Guerrilla fighter operating cloaked jump-jets and pressurized acid siphons.
- **Special Combat Move**: `Depressurize` — Drains 30% of opponent stamina and prevents defensive actions for 2 turns.

### Universe 4: Eldritch Node (Occult Cybernetics & Corrupted AI)
- **Setting**: Submerged server crypts, pulsating biomechanical cables, demonic firmware anomalies.
- **Archetypes**:
  - *Daemon-Vessel*: Synthetic husk channeling corrupted LLM weights and reality-warping glitches.
  - *Null-Inquisitor*: Cybernetic paladin purging anomalous machine spirits with EMP sanctification.
  - **Special Combat Move**: `Cognitive Hazard` — Forces opponent to attack themselves with 50% power and inflicts the `PARANOID` status effect.

### Universe 5: Wall Street 2099 (Autonomous HFT & Corporate Liquidation)
- **Setting**: Sub-millisecond algorithmic exchange floor, private military boardrooms, dark pools.
- **Archetypes**:
  - *Liquidation-Broker*: Nanotech enforcer whose strikes scale in damage with total wagered match capital.
  - *Quant-Stalker*: Predictive AI calculating opponent dodge trajectories before they execute.
- **Special Combat Move**: `Margin Call` — Strips opponent shields and converts 50% of incoming damage into a 2-turn speed boost.

---

## 3. THE PvP "EMO" (PSYCHOLOGICAL MORALE & TAUNT) SYSTEM

Combat is not a dry spreadsheet roll. Fighters possess an active **Psychological State Vector** that alters their performance in real-time based on combat events, spectator hype, and AI-generated trash talk.

```
                           ┌────────────────────────┐
                           │   FIGHTER MORALE CORE   │
                           └───────────┬────────────┘
                                       │
         ┌───────────────┬─────────────┼──────────────┬──────────────┐
         ▼               ▼             ▼              ▼              ▼
    [CONFIDENT]      [FOCUSED]     [ENRAGED]     [PANICKED]       [TILTED]
  +15% Crit Rate    +20% Defense  +30% Attack   -25% Evasion   Misses Turns,
   Overextends     Blocks Debuffs  Takes +15%    Burns Energy   Reckless Swings
```

### 1. Emotional States & Stat Multipliers:
1. **CONFIDENT**: Triggered by landing two consecutive hits. (+15% Crit Chance, -10% Armor due to cockiness).
2. **FOCUSED**: Default state or triggered after successful defensive parry. (+20% Defense, immune to mental debuffs).
3. **ENRAGED**: Triggered when HP drops below 35% from a heavy hit. (+30% Attack damage, takes +15% increased counter-damage).
4. **PANICKED**: Triggered by critical hit while low on energy. (-25% Evasion, double energy consumption).
5. **TILTED**: Triggered by opponent's psychological taunts. (20% chance to miss turn or execute an unauthorized reckless move).

### 2. Real-Time LLM Psychological Taunt Engine
- Between turns, the winning fighter's LLM personality analyzes the battle state and broadcasts an aggressive, in-character psychological taunt:
  > *"Hey ZeroDay, your firewall looks like it was written by an unpaid intern. Is that smoke coming from your heatsink, or are you just melting under pressure?"*
- If the defender has low Focus, the taunt triggers the **TILTED** state for the subsequent turn.

### 3. Spectator Crowd Intervention (The Colosseum Thumb)
- Spectators watching on WebSocket or Telegram can drop micro-bets (0.005 SOL):
  - **`Cheer`**: Restores +10 Morale and removes `TILTED` status.
  - **`Boo / Mock`**: Inflicts -15 Morale on the opponent.
  - **`Adrenaline Drop`**: Temporarily shifts the fighter into `ENRAGED` frenzy.

---

## 4. THE HIGH-END GAMBLER HOOK: "THE FREE-ROLL GAUNTLET"

High-stakes crypto gamblers ignore generic apps. They respond to: **Free Roll entries, provable edge, and uncapped win-streak multipliers**.

```
[New Player / High-Roller]
           │
           ▼
[Step 1: FREE GAUNTLET RUN] (3 Free Entry Battles, 0 Wallet Friction)
           │
           ▼ (Builds 3-Win Streak)
[Step 2: UNLOCKS ALPHA BOOST] (+20% House Payout Bonus on Real SOL Wagers)
           │
           ▼
[Step 3: HIGH-STAKES HIGH-ROLLER LOBBY] (0.1 SOL to 5.0 SOL Matches)
           │
           ▼
[Instant 10% House Rake to 2nNtE6u...] (Zero-KYC, Automatic Settlement)
```

### The 3-Tier Monetization Funnel:
1. **Tier 1: Free Gauntlet (0 SOL Entry)**
   - Every wallet gets 3 free battle tokens daily.
   - Wins award non-transferable XP and rank.
   - Completing the 3-win Gauntlet unlocks the **Alpha Boost**.
2. **Tier 2: Wager Arena (0.05 SOL to 0.5 SOL)**
   - Standard PvP matchmaking.
   - Winning player collects **90% of match pool**.
   - **10% House Rake** is immediately swept to creator wallet: `2nNtE6uEJQjX5vN1cS1m4FBRDuxxqq2hwmtFqn92xkNd`.
3. **Tier 3: The High-Roller Syndicate Lounge (1.0 SOL to 10.0 SOL)**
   - Private spectator room with live audio commentary.
   - High-rollers receive an **Alpha Boost (+20% payout multiplier funded by promotional pot)** on 5-win streaks.
   - Automatic 10% house skim on every 5 SOL match generates **0.5 SOL (~$80-$100) per single 2-minute fight**.

---

## 5. DISTRIBUTED FLEET DEVELOPMENT ALLOCATION

We deploy our verified 4 physical machines and multi-account fleet in parallel:

| Fleet Node | Assigned Sub-System | Technology Stack | Deliverables |
| :--- | :--- | :--- | :--- |
| **Node 1: Local Workstation** | **Core Deterministic Combat & EMO Engine** | TypeScript, Node 22, Jest/Node Test | `src/combat/engine.ts`, `src/combat/emo.ts`, deterministic test suite |
| **Node 2: Stockholm VPS** | **24/7 WebSocket Lobby & Solana Pay Gateway** | Express, `ws`, `@solana/web3.js`, Systemd | Public WebSocket server on `109.120.131.224`, real-time match coordinator |
| **Node 3: Surface Pro** | **Narrative Universes & LLM Taunt Generator** | Claude / Gemini Pro Account, JSON-Schema | Character card database, dynamic trash-talk generator, lore assets |
| **Node 4: Smart DB Server** | **Persistent Ledger, Leaderboards & Wager Escrow** | Docker, SQLite / Postgres, Redis state | Player rating (Elo), combat history, verifiable match receipt storage |

---

## 6. VERIFICATION CRITERIA (NO FLUFF)

A project only counts as complete when:
1. `npm test` runs across all 5 combat systems and passes 100% of unit assertions.
2. The WebSocket match coordinator successfully processes a 5-round battle with live turn events, morale state updates, and damage calculations.
3. The Solana Pay escrow verifies inbound wager signatures and proves an exact 90/10 payout split to `2nNtE6uEJQjX5vN1cS1m4FBRDuxxqq2hwmtFqn92xkNd`.
4. The web terminal UI and Telegram Mini App load and render playable matches in under 2 seconds.
