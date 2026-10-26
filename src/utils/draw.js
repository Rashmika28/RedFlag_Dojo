// This file draws a practice round of two suspicious scenarios and one clean scenario.
import scenarios from '../data/scenarios.json';

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function mixKey(picked) {
  return picked.map((scenario) => scenario.id).sort().join('|');
}

export function drawRound(previousIds = []) {
  const suspicious = scenarios.filter((scenario) => scenario.type === 'suspicious');
  const clean = scenarios.filter((scenario) => scenario.type === 'clean');
  const previousKey = [...previousIds].sort().join('|');
  const mixes = [];

  for (let first = 0; first < suspicious.length; first++) {
    for (let second = first + 1; second < suspicious.length; second++) {
      for (let third = 0; third < clean.length; third++) {
        mixes.push([suspicious[first], suspicious[second], clean[third]]);
      }
    }
  }

  if (mixes.length === 0) {
    return shuffle(scenarios.slice(0, 3));
  }

  const alternatives = mixes.filter((picked) => mixKey(picked) !== previousKey);
  const pool = alternatives.length > 0 ? alternatives : mixes;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return shuffle(picked);
}
