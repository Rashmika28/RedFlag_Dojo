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

  it('false flag on suspicious gives -1', () => {
    const chunks = [
      { id: 'c1', text: 'bad', suspicious: true },
      { id: 'c2', text: 'ok', suspicious: false }
    ];
    const res = scoreMessage({ chunks, selectedChunkIds: ['c1', 'c2'], scenarioType: 'suspicious' });
    expect(res.falseFlags).toBe(1);
    expect(res.messageScore).toBe(1); // 2 + (-1)
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
});
