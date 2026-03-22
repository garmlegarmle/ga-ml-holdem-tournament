import { compareHands, evaluateBestHand } from '@/engine/evaluators/handEvaluator';
import { card } from '../testUtils';

describe('hand evaluator', () => {
  it('ranks a flush above a straight', () => {
    const flush = evaluateBestHand([card('Ah'), card('Jh'), card('9h'), card('6h'), card('3h'), card('Kd'), card('2s')]);
    const straight = evaluateBestHand([card('9c'), card('8d'), card('7h'), card('6s'), card('5c'), card('Ah'), card('2d')]);

    expect(flush.categoryName).toBe('Flush');
    expect(straight.categoryName).toBe('Straight');
    expect(compareHands(flush, straight)).toBeGreaterThan(0);
  });

  it('breaks ties correctly with kickers', () => {
    const aceKicker = evaluateBestHand([card('As'), card('Kd'), card('Qh'), card('Qc'), card('8s'), card('5d'), card('2c')]);
    const jackKicker = evaluateBestHand([card('Ah'), card('Jd'), card('Qs'), card('Qd'), card('8c'), card('5s'), card('2h')]);

    expect(aceKicker.categoryName).toBe('One Pair');
    expect(compareHands(aceKicker, jackKicker)).toBeGreaterThan(0);
  });
});
