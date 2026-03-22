import { decideBotAction } from '@/engine/ai/decideAction';
import { getLegalActions } from '@/engine/stateMachine/reducer';
import { createStateAtPhase } from '../testUtils';

describe('AI legal action compliance', () => {
  it('always chooses a legal action for every bot profile', () => {
    const baseState = createStateAtPhase('preflop_action', 9);

    for (const seat of baseState.seats.filter((candidate) => !candidate.isHuman && candidate.status === 'active')) {
      const state = structuredClone(baseState);
      state.betting.actingSeatIndex = seat.seatIndex;
      state.rngState += seat.seatIndex * 17;

      const decision = decideBotAction(state, seat.playerId);
      const legalActions = getLegalActions(state, seat.playerId);
      const matchingAction = legalActions.find((action) => action.type === decision.action.type);

      expect(matchingAction, `${seat.name} chose ${decision.action.type}`).toBeDefined();

      if (decision.action.amount !== undefined && matchingAction && 'min' in matchingAction) {
        expect(decision.action.amount).toBeGreaterThanOrEqual(matchingAction.min);
        expect(decision.action.amount).toBeLessThanOrEqual(matchingAction.max);
      }
    }
  });
});
