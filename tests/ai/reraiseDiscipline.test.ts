import { decideBotAction } from '@/engine/ai/decideAction';
import { card, createStateAtPhase } from '../testUtils';

describe('AI reraising discipline', () => {
  it('prefers calling over reraising with a medium-strength hand after heavy preflop aggression', () => {
    const state = createStateAtPhase('preflop_action', 6);
    const actingSeat = state.seats.find((seat) => !seat.isHuman && seat.status === 'active')!;

    state.betting.actingSeatIndex = actingSeat.seatIndex;
    state.betting.currentBet = 300;
    state.betting.lastAggressorSeatIndex = 4;
    state.betting.previousAggressorSeatIndex = 3;
    state.betting.lastFullRaiseSize = 150;
    state.betting.fullRaiseCount = 2;
    state.betting.minRaiseTo = 450;
    actingSeat.currentBet = 0;
    actingSeat.stack = 4000;
    actingSeat.totalCommitted = 0;
    actingSeat.holeCards = [card('Jc'), card('Td')];
    state.log.push(
      {
        id: 'raise-1',
        handNumber: state.hand.handNumber,
        level: state.currentLevel.level,
        street: 'preflop',
        seatIndex: 3,
        playerId: state.seats[3]!.playerId,
        name: state.seats[3]!.name,
        type: 'raise',
        amount: 150,
        text: '오픈 레이즈',
      },
      {
        id: 'raise-2',
        handNumber: state.hand.handNumber,
        level: state.currentLevel.level,
        street: 'preflop',
        seatIndex: 4,
        playerId: state.seats[4]!.playerId,
        name: state.seats[4]!.name,
        type: 'raise',
        amount: 300,
        text: '재레이즈',
      },
    );

    const decision = decideBotAction(state, actingSeat.playerId);
    const callCandidate = decision.candidates.find((candidate) => candidate.type === 'call');
    const raiseCandidate = decision.candidates.find((candidate) => candidate.type === 'raise');

    expect(callCandidate).toBeDefined();
    expect(raiseCandidate).toBeDefined();
    expect(callCandidate!.weight).toBeGreaterThan(raiseCandidate!.weight);
  });
});
