import { buildPots } from '@/engine/pots/buildPots';
import { distributePots } from '@/engine/pots/distributePots';
import { card } from '../testUtils';
import type { Seat } from '@/types/engine';

function makeSeat(overrides: Partial<Seat>): Seat {
  return {
    seatIndex: 0,
    playerId: 'p0',
    name: 'Player',
    isHuman: false,
    profileId: 'balanced-regular',
    stack: 0,
    status: 'active',
    eliminationOrder: null,
    holeCards: [card('As'), card('Kd')],
    hasFolded: false,
    isAllIn: false,
    hasShownCards: false,
    currentBet: 0,
    totalCommitted: 0,
    actedThisStreet: false,
    lastFullRaiseSeen: 0,
    lastAction: null,
    lastActionAmount: 0,
    winningsThisHand: 0,
    position: null,
    ...overrides,
  };
}

describe('pot building and distribution', () => {
  it('creates main and side pots for multi-way all-ins', () => {
    const seats = [
      makeSeat({
        seatIndex: 0,
        playerId: 'a',
        totalCommitted: 100,
        holeCards: [card('As'), card('Ad')],
      }),
      makeSeat({
        seatIndex: 1,
        playerId: 'b',
        totalCommitted: 300,
        holeCards: [card('Ks'), card('Kd')],
      }),
      makeSeat({
        seatIndex: 2,
        playerId: 'c',
        totalCommitted: 500,
        holeCards: [card('Qs'), card('Qd')],
      }),
    ];
    const board = [card('2c'), card('7d'), card('9h'), card('3s'), card('4c')];
    const pots = buildPots(seats);
    const { payouts } = distributePots(pots, seats, board, 0);

    expect(pots.map((pot) => pot.amount)).toEqual([300, 400, 200]);
    expect(
      payouts.reduce<Record<string, number>>((result, payout) => {
        result[payout.playerId] = (result[payout.playerId] ?? 0) + payout.amount;
        return result;
      }, {}),
    ).toEqual({
      a: 300,
      b: 400,
      c: 200,
    });
  });

  it('splits pots and awards the odd chip left of the button', () => {
    const seats = [
      makeSeat({
        seatIndex: 1,
        playerId: 'left',
        holeCards: [card('Ah'), card('Kd')],
        totalCommitted: 101,
      }),
      makeSeat({
        seatIndex: 2,
        playerId: 'right',
        holeCards: [card('Ad'), card('Kh')],
        totalCommitted: 100,
      }),
    ];
    const pots = [
      {
        id: 'main',
        amount: 201,
        eligiblePlayerIds: ['left', 'right'],
        contributions: { left: 101, right: 100 },
        isMain: true,
      },
    ];
    const board = [card('Qs'), card('Jc'), card('Tc'), card('2d'), card('3h')];
    const { payouts } = distributePots(pots, seats, board, 0);
    const totals = payouts.reduce<Record<string, number>>((result, payout) => {
      result[payout.playerId] = (result[payout.playerId] ?? 0) + payout.amount;
      return result;
    }, {});

    expect(totals.left).toBe(101);
    expect(totals.right).toBe(100);
  });
});
