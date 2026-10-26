// This file contains tests for scoring logic.
import { describe, it, expect } from 'vitest';
import { scoreMessage, scoreRound, getBelt, getBeltProgress } from '../src/engine/scoring.js';

describe('scoring', () => {
  it('clean message untouched gives 6', () => {
    const chunks = [
      { id: 'c1', text: 'hi', suspicious: false },
      { id: 'c2', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: [], scenarioType: 'clean' });
    expect(res.messageScore).toBe(6);
  });

  it('clean message with all selected gives 0', () => {
    const chunks = [
      { id: 'c1', text: 'hi', suspicious: false },
      { id: 'c2', text: 'ok', suspicious: false },
      { id: 'c3', text: 'bye', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2', 'c3'], scenarioType: 'clean' });
    expect(res.messageScore).toBe(0);
  });

  it('clean message with 1 false tap gives 4', () => {
    const chunks = [
      { id: 'c1', text: 'hi', suspicious: false },
      { id: 'c2', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1'], scenarioType: 'clean' });
    expect(res.messageScore).toBe(4);
  });

  it('suspicious catches give +2', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1'], scenarioType: 'suspicious' });
    expect(res.correctCaught).toBe(1);
    expect(res.messageScore).toBe(2);
  });

  it('false flag on suspicious gives -2', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2'], scenarioType: 'suspicious' });
    expect(res.falseFlags).toBe(1);
    expect(res.messageScore).toBe(0); // 2 + (-2)
  });

  it('false flags reduce a suspicious message score', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'bad', suspicious: true },
      { id: 'c3', text: 'bad', suspicious: true },
      { id: 'c4', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2', 'c3', 'c4'], scenarioType: 'suspicious' });
    expect(res.messageScore).toBe(4); // 6 - 2
  });

  it('misses cost nothing and floor 0', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: [], scenarioType: 'suspicious' });
    expect(res.missed).toBe(1);
    expect(res.messageScore).toBe(0);
  });

  it('caps a suspicious message score at 6', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'bad', suspicious: true },
      { id: 'c3', text: 'bad', suspicious: true }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2', 'c3'], scenarioType: 'suspicious' });
    expect(res.messageScore).toBe(6);
  });

  it('never drops below 0 from false flags', () => {
    const chunks = [
      { id: 'c1', text: 'ok', suspicious: false },
      { id: 'c2', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2'], scenarioType: 'suspicious' });
    expect(res.messageScore).toBe(0);
  });

  it('round total max 18', () => {
    const res = scoreRound([6, 6, 6]);
    expect(res.roundScore).toBe(18);
  });

  it('belt thresholds', () => {
    expect(getBelt(0).belt).toBe('WHITE');
    expect(getBelt(15).belt).toBe('YELLOW');
    expect(getBelt(40).belt).toBe('BROWN');
    expect(getBelt(80).belt).toBe('BLACK');
  });

  it('belt up detection', () => {
    const res = getBeltProgress({ prevCumulative: 0, newCumulative: 15 });
    expect(res.beltUp).toBe(true);
  });

  it('points to next belt', () => {
    const res = getBeltProgress({ prevCumulative: 0, newCumulative: 10 });
    expect(res.pointsToNext).toBe(5);
    expect(res.nextBelt).toBe('YELLOW');
  });

  it('clean message loses 2 for each false tap and floors at 0', () => {
    const chunks = [
      { id: 'c1', text: 'one', suspicious: false },
      { id: 'c2', text: 'two', suspicious: false },
      { id: 'c3', text: 'three', suspicious: false }
    ];
    expect(scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2'], scenarioType: 'clean' }).messageScore).toBe(2);
    expect(scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2', 'c3'], scenarioType: 'clean' }).messageScore).toBe(0);
  });

  it('false flags can zero out a partially caught suspicious message', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'ok', suspicious: false },
      { id: 'c3', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2', 'c3'], scenarioType: 'suspicious' });
    expect(res.correctCaught).toBe(1);
    expect(res.falseFlags).toBe(2);
    expect(res.messageScore).toBe(0);
  });

  it('returns detail ids for feedback', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'bad', suspicious: true },
      { id: 'c3', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c3'], scenarioType: 'suspicious' });
    expect(res.details.caught).toEqual(['c1']);
    expect(res.details.missed).toEqual(['c2']);
    expect(res.details.falseFlag).toEqual(['c3']);
  });

  it('round score is the sum of three messages', () => {
    expect(scoreRound([6, 4, 0]).roundScore).toBe(10);
    expect(scoreRound([]).roundScore).toBe(0);
  });

  it('belt thresholds hold at their boundaries', () => {
    expect(getBelt(14).belt).toBe('WHITE');
    expect(getBelt(39).belt).toBe('YELLOW');
    expect(getBelt(79).belt).toBe('BROWN');
    expect(getBelt(100).belt).toBe('BLACK');
  });

  it('black belt has no next rank', () => {
    const res = getBeltProgress({ prevCumulative: 70, newCumulative: 82 });
    expect(res.beltUp).toBe(true);
    expect(res.currentBelt).toBe('BLACK');
    expect(res.nextBelt).toBeNull();
    expect(res.pointsToNext).toBeNull();
  });

  it('does not report a belt up within the same rank', () => {
    const res = getBeltProgress({ prevCumulative: 20, newCumulative: 35 });
    expect(res.beltUp).toBe(false);
    expect(res.pointsToNext).toBe(5);
  });
});
