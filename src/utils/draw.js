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

export function drawRound(previousIds = []) {
  const suspicious = scenarios.filter((scenario) => scenario.type === 'suspicious');
  const clean = scenarios.filter((scenario) => scenario.type === 'clean');
  const previousKey = [...previousIds].sort().join('|');

  for (let attempt = 0; attempt < 20; attempt++) {
    const picked = [...shuffle(suspicious).slice(0, 2), shuffle(clean)[0]];
    const key = picked.map((scenario) => scenario.id).sort().join('|');
    if (key !== previousKey) {
      return shuffle(picked);
    }
  }

  return shuffle([...shuffle(suspicious).slice(0, 2), clean[0]]);
}
