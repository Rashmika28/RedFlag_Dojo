// This file tests practice-round scenario selection.
import { describe, it, expect } from 'vitest';
import { drawRound } from '../src/utils/draw.js';

function key(picked) {
  return picked.map((scenario) => scenario.id).sort().join('|');
}

describe('drawRound', () => {
  it('always draws three unique scenarios with two suspicious and one clean', () => {
    for (let i = 0; i < 100; i++) {
      const drawn = drawRound();
      expect(drawn).toHaveLength(3);
      expect(new Set(drawn.map((scenario) => scenario.id)).size).toBe(3);
      expect(drawn.filter((scenario) => scenario.type === 'suspicious')).toHaveLength(2);
      expect(drawn.filter((scenario) => scenario.type === 'clean')).toHaveLength(1);
    }
  });

  it('draws a different mix from the previous round when alternatives exist', () => {
    const previous = drawRound();
    const next = drawRound(previous.map((scenario) => scenario.id));
    expect(key(next)).not.toBe(key(previous));
  });

  it('ignores unknown previous ids', () => {
    const drawn = drawRound(['not-a-scenario']);
    expect(drawn).toHaveLength(3);
  });
});
