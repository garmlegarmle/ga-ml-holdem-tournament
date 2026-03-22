import { decideBotAction } from '@/engine/ai/decideAction';
import { card, createStateAtPhase } from '../testUtils';

describe('AI large jam discipline', () => {
  it('prefers folding to calling with a medium-strength hand versus a deep-stack shove', () => {
    const state = createStateAtPhase('preflop_action', 6);
    const actingSeat = state.seats.find((seat) => !seat.isHuman && seat.status === 'active')!;

    state.betting.actingSeatIndex = actingSeat.seatIndex;
    state.betting.currentBet = 6000;
    state.betting.lastAggressorSeatIndex = 4;
    state.betting.previousAggressorSeatIndex = 4;
    state.betting.lastFullRaiseSize = 5950;
    state.betting.fullRaiseCount = 2;
    state.betting.minRaiseTo = 11950;
    actingSeat.currentBet = 0;
    actingSeat.stack = 10000;
    actingSeat.totalCommitted = 0;
    actingSeat.profileId = 'balanced-regular';
    actingSeat.holeCards = [card('Ad'), card('Jc')];
    state.log.push({
      id: 'jam-1',
      handNumber: state.hand.handNumber,
      level: state.currentLevel.level,
      street: 'preflop',
      seatIndex: 4,
      playerId: state.seats[4]!.playerId,
      name: state.seats[4]!.name,
      type: 'all-in',
      amount: 6000,
      text: '대형 올인',
    });

    const decision = decideBotAction(state, actingSeat.playerId);
    const foldCandidate = decision.candidates.find((candidate) => candidate.type === 'fold');
    const callCandidate = decision.candidates.find((candidate) => candidate.type === 'call');

    expect(foldCandidate).toBeDefined();
    expect(callCandidate).toBeDefined();
    expect(foldCandidate!.weight).toBeGreaterThan(callCandidate!.weight);
  });
});
