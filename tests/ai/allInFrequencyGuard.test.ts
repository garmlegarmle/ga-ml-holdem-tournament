import { decideBotAction } from '@/engine/ai/decideAction';
import { createStateAtPhase } from '../testUtils';
import { card } from '../testUtils';

describe('AI all-in guard rails', () => {
  it('does not even consider a deep-stack open jam in a normal early spot', () => {
    const state = createStateAtPhase('preflop_action', 9);
    const actingSeat = state.seats.find((seat) => !seat.isHuman && seat.seatIndex === state.betting.actingSeatIndex)!;

    actingSeat.holeCards = [
      card('9c'),
      card('8d'),
    ];

    const decision = decideBotAction(state, actingSeat.playerId);

    expect(decision.candidates.some((candidate) => candidate.type === 'all-in')).toBe(false);
  });
});
