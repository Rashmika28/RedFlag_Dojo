// This file provides pure scoring logic for RedFlag Dojo.
export const BELT_THRESHOLDS = {
  WHITE: 0,
  YELLOW: 15,
  BROWN: 40,
  BLACK: 80
};

export const BELT_ORDER = ['WHITE', 'YELLOW', 'BROWN', 'BLACK'];

export function scoreMessage({ chunks = [], selectedChunkIds = [], scenarioType = 'suspicious' } = {}) {
  const selected = new Set(Array.isArray(selectedChunkIds) ? selectedChunkIds : []);
  let correctCaught = 0;
  let missed = 0;
  let falseFlags = 0;
  const details = { caught: [], missed: [], falseFlag: [] };
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const isSelected = selected.has(chunk.id);
    if (chunk.suspicious) {
      if (isSelected) {
        correctCaught++;
        details.caught.push(chunk.id);
      } else {
        missed++;
        details.missed.push(chunk.id);
      }
    } else {
      if (isSelected) {
        falseFlags++;
        details.falseFlag.push(chunk.id);
      }
      // else clean and not selected - fine
    }
  }
  let messageScore = 0;
  if (scenarioType === 'clean') {
    messageScore = 6 + (falseFlags * -2);
    if (messageScore < 0) messageScore = 0;
    if (messageScore > 6) messageScore = 6;
  } else {
    messageScore = (correctCaught * 2) + (falseFlags * -2);
    if (messageScore < 0) messageScore = 0;
    if (messageScore > 6) messageScore = 6;
  }
  return {
    messageScore,
    correctCaught,
    missed,
    falseFlags,
    details
  };
}

export function scoreRound(messageScores = []) {
  let roundScore = 0;
  for (let i = 0; i < messageScores.length; i++) {
    roundScore += messageScores[i] || 0;
  }
  if (roundScore > 18) roundScore = 18;
  if (roundScore < 0) roundScore = 0;
  return { roundScore };
}

export function getBelt(cumulativeScore = 0) {
  let belt = 'WHITE';
  if (cumulativeScore >= BELT_THRESHOLDS.BLACK) belt = 'BLACK';
  else if (cumulativeScore >= BELT_THRESHOLDS.BROWN) belt = 'BROWN';
  else if (cumulativeScore >= BELT_THRESHOLDS.YELLOW) belt = 'YELLOW';
  else belt = 'WHITE';
  const beltIndex = BELT_ORDER.indexOf(belt);
  return { belt, beltIndex };
}

export function getBeltProgress({ prevCumulative = 0, newCumulative = 0 } = {}) {
  const prev = getBelt(prevCumulative);
  const curr = getBelt(newCumulative);
  const beltUp = curr.beltIndex > prev.beltIndex;
  let pointsToNext = null;
  let nextBelt = null;
  if (curr.belt === 'WHITE') {
    nextBelt = 'YELLOW';
    pointsToNext = Math.max(0, BELT_THRESHOLDS.YELLOW - newCumulative);
  } else if (curr.belt === 'YELLOW') {
    nextBelt = 'BROWN';
    pointsToNext = Math.max(0, BELT_THRESHOLDS.BROWN - newCumulative);
  } else if (curr.belt === 'BROWN') {
    nextBelt = 'BLACK';
    pointsToNext = Math.max(0, BELT_THRESHOLDS.BLACK - newCumulative);
  } else if (curr.belt === 'BLACK') {
    nextBelt = null;
    pointsToNext = null;
  }
  return {
    beltUp,
    currentBelt: curr.belt,
    prevBelt: prev.belt,
    pointsToNext,
    nextBelt
  };
}
