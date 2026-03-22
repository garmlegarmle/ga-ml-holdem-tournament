import { applyPlayerAction, getLegalActions } from '@/engine/stateMachine/reducer';
import { BLIND_LEVELS } from '@/config/blindLevels';
import { advanceState } from '@/engine/stateMachine/reducer';
import { advanceToPhase, createStateAtPhase, createTestConfig } from '../testUtils';
import { createInitialGameState } from '@/engine/tournament/createTournament';

describe('tournament rules', () => {
  it('posts per-player antes and blinds correctly', () => {
    const state = createStateAtPhase('deal_hole_cards', 3, [BLIND_LEVELS[4]!]);
    const buttonSeat = state.seats.find((seat) => seat.seatIndex === 0)!;
    const smallBlindSeat = state.seats.find((seat) => seat.seatIndex === 1)!;
    const bigBlindSeat = state.seats.find((seat) => seat.seatIndex === 2)!;

    expect(buttonSeat.totalCommitted).toBe(25);
    expect(smallBlindSeat.totalCommitted).toBe(150);
    expect(bigBlindSeat.totalCommitted).toBe(275);
  });

  it('does not reopen raising after a short all-in raise', () => {
    let state = createStateAtPhase('preflop_action', 3);
    state = structuredClone(state);
    state.seats[1]!.stack = 50;

    state = applyPlayerAction(state, { playerId: state.seats[0]!.playerId, type: 'call' });
    state = applyPlayerAction(state, { playerId: state.seats[1]!.playerId, type: 'all-in' });
    state = applyPlayerAction(state, { playerId: state.seats[2]!.playerId, type: 'call' });

    const legalActions = getLegalActions(state, state.seats[0]!.playerId);

    expect(legalActions.some((action) => action.type === 'raise')).toBe(false);
    expect(legalActions.some((action) => action.type === 'call')).toBe(true);
  });

  it('uses a min-open size of two big blinds preflop', () => {
    const state = createStateAtPhase('preflop_action', 4);
    const actingSeat = state.seats.find((seat) => seat.seatIndex === state.betting.actingSeatIndex)!;
    const raiseAction = getLegalActions(state, actingSeat.playerId).find(
      (action): action is Extract<(typeof state)['seats'][number] extends never ? never : ReturnType<typeof getLegalActions>[number], { min: number }> =>
        action.type === 'raise',
    );

    expect(raiseAction?.min).toBe(state.currentLevel.bigBlind * 2);
  });

  it('applies heads-up blind and action order rules', () => {
    const initialState = createInitialGameState(createTestConfig(2), 111);
    const blindState = advanceToPhase(initialState, 'deal_hole_cards');

    expect(blindState.buttonSeatIndex).toBe(0);
    expect(blindState.seats[0]!.totalCommitted).toBe(25);
    expect(blindState.seats[1]!.totalCommitted).toBe(50);
    expect(blindState.betting.actingSeatIndex).toBe(0);

    const postflopState = advanceState({
      ...advanceToPhase(initialState, 'preflop_action'),
      phase: 'deal_flop',
    });

    expect(postflopState.phase).toBe('flop_action');
    expect(postflopState.betting.actingSeatIndex).toBe(1);
  });

  it('skips folded seats when choosing the first postflop actor', () => {
    const base = createStateAtPhase('deal_hole_cards', 4);
    const state = structuredClone({ ...base, phase: 'deal_flop' as const });

    state.seats[1]!.hasFolded = true;
    state.seats[1]!.isAllIn = false;
    state.seats[2]!.hasFolded = false;
    state.seats[3]!.hasFolded = false;

    const flopState = advanceState(state);

    expect(flopState.phase).toBe('flop_action');
    expect(flopState.betting.actingSeatIndex).toBe(2);
  });

  it('eliminates busted players and moves the button to the next occupied seat', () => {
    const initialState = createInitialGameState(createTestConfig(3), 222);
    let state = structuredClone(initialState);
    state.phase = 'eliminate_players';
    state.seats[0]!.stack = 1200;
    state.seats[1]!.stack = 0;
    state.seats[2]!.stack = 800;

    const eliminated = advanceState(state);
    const moved = advanceState(eliminated);

    expect(eliminated.seats[1]!.status).toBe('busted');
    expect(moved.buttonSeatIndex).toBe(2);
  });

  it('ends the game immediately when the human player busts', () => {
    const initialState = createInitialGameState(createTestConfig(4), 333);
    const state = structuredClone(initialState);
    state.phase = 'eliminate_players';
    state.seats[0]!.stack = 0;
    state.seats[1]!.stack = 1400;
    state.seats[2]!.stack = 1200;
    state.seats[3]!.stack = 400;

    const eliminated = advanceState(state);

    expect(eliminated.phase).toBe('tournament_complete');
    expect(eliminated.tournamentCompletionReason).toBe('human-busted');
    expect(eliminated.tournamentWinnerId).toBeNull();
    expect(eliminated.seats[0]!.status).toBe('busted');
  });
});
