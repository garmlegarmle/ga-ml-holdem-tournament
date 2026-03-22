import { BET_SIZING_BUCKETS } from '@/config/betSizing';
import { BLIND_LEVELS } from '@/config/blindLevels';
import { DEFAULT_PLAYER_SEATS } from '@/config/gameSettings';
import { createCard } from '@/engine/core/cards';
import { advanceState, createInitialGameState } from '@/engine/stateMachine/reducer';
import type { Rank, Suit } from '@/types/cards';
import type { GameState } from '@/types/engine';
import type { BlindLevel, TournamentConfig } from '@/types/tournament';

const rankMap: Record<string, Rank> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const suitMap: Record<string, Suit> = {
  c: 'clubs',
  d: 'diamonds',
  h: 'hearts',
  s: 'spades',
};

export function card(code: string) {
  return createCard(rankMap[code[0]!.toUpperCase()]!, suitMap[code[1]!.toLowerCase()]!);
}

export function createTestConfig(playerCount: number, blindLevels: BlindLevel[] = BLIND_LEVELS.slice(0, 1)): TournamentConfig {
  return {
    startingStack: 1000,
    handsPerLevel: 8,
    blindLevels,
    seats: DEFAULT_PLAYER_SEATS.slice(0, playerCount).map((seat, index) => ({
      ...seat,
      seatIndex: index,
    })),
    betSizingBuckets: BET_SIZING_BUCKETS,
    initialButtonSeatIndex: 0,
    actionDelayMs: 0,
    autoProgress: false,
  };
}

export function advanceToPhase(initialState: GameState, targetPhase: GameState['phase'], maxSteps = 25): GameState {
  let state = initialState;

  for (let steps = 0; steps < maxSteps; steps += 1) {
    if (state.phase === targetPhase) {
      return state;
    }

    const next = advanceState(state);

    if (next === state) {
      throw new Error(`State machine stalled at phase ${state.phase}`);
    }

    state = next;
  }

  throw new Error(`Unable to reach phase ${targetPhase}`);
}

export function createStateAtPhase(targetPhase: GameState['phase'], playerCount = 3, blindLevels: BlindLevel[] = BLIND_LEVELS.slice(0, 1)): GameState {
  return advanceToPhase(createInitialGameState(createTestConfig(playerCount, blindLevels), 1234), targetPhase);
}
