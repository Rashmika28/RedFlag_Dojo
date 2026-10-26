// This file provides pure analysis logic for RedFlag Dojo.
import rules from '../data/rules.json';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRegexForPattern(pattern) {
  // If pattern contains regex chars assume regex
  if (pattern.includes('\\') || pattern.includes('(') || pattern.includes(')') || pattern.includes('{') || pattern.includes('}') || pattern.includes('|') || pattern.includes('[') || pattern.includes(']') || pattern.includes('+') || pattern.includes('*') || pattern.includes('?') || pattern.includes('^') || pattern.includes('$') || pattern.includes('.')) {
    try {
      return new RegExp(pattern, 'gi');
    } catch (e) {
      return new RegExp(escapeRegExp(pattern), 'gi');
    }
  }
  return new RegExp(escapeRegExp(pattern), 'gi');
}

function findMatchesInText(text, source) {
  const matches = [];
  if (!text) return matches;
  for (let r = 0; r < rules.length; r++) {
    const rule = rules[r];
    const patterns = rule.patterns || [];
    for (let p = 0; p < patterns.length; p++) {
      const pattern = patterns[p];
      const regex = getRegexForPattern(pattern);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const phrase = match[0];
        matches.push({
          ruleId: rule.id,
          tacticId: rule.tacticId,
          tacticName: rule.tacticName,
          category: rule.category,
          phrase,
          start: match.index,
          end: match.index + phrase.length,
          whyItMatters: rule.whyItMatters,
          whatToVerify: rule.whatToVerify,
          checklistAction: rule.checklistAction,
          source
        });
        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    }
  }
  return matches;
}

function resolveOverlaps(matches) {
  if (!matches.length) return [];
  // Sort by start, then by length desc (keep longest/earliest preference)
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    if ((b.end - b.start) !== (a.end - a.start)) return (b.end - b.start) - (a.end - a.start);
    return 0;
  });
  const result = [];
  let lastEnd = -1;
  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    if (m.start >= lastEnd) {
      result.push(m);
      lastEnd = m.end;
    }
  }
  return result;
}

export function analyzeMessage(input = {}) {
  const { text = '', sender = '' } = input || {};
  const messageText = typeof text === 'string' ? text : '';
  const senderText = typeof sender === 'string' ? sender : '';
  const length = messageText.length;
  const isLong = length > 3000;
  const hasInput = messageText.trim().length > 0 || senderText.trim().length > 0;
  if (!hasInput) {
    return {
      matches: [],
      distinctRuleCount: 0,
      summaryLevel: 'none',
      rulesTriggered: [],
      checklist: [],
      hasInput: false,
      isLong,
      length
    };
  }
  if (isLong) {
    return {
      matches: [],
      distinctRuleCount: 0,
      summaryLevel: 'none',
      rulesTriggered: [],
      checklist: [],
      hasInput: true,
      isLong: true,
      length
    };
  }
  const textMatches = findMatchesInText(messageText, 'text');
  const senderMatches = findMatchesInText(senderText, 'sender');
  const resolved = [
    ...resolveOverlaps(textMatches),
    ...resolveOverlaps(senderMatches)
  ];
  // Remove duplicates of same ruleId+phrase+start? keep resolved
  const distinctRuleIds = [];
  const seenRules = new Set();
  for (let i = 0; i < resolved.length; i++) {
    if (!seenRules.has(resolved[i].ruleId)) {
      seenRules.add(resolved[i].ruleId);
      distinctRuleIds.push(resolved[i].ruleId);
    }
  }
  const distinctRuleCount = distinctRuleIds.length;
  let summaryLevel = 'none';
  if (distinctRuleCount === 0) summaryLevel = 'none';
  else if (distinctRuleCount >= 1 && distinctRuleCount <= 2) summaryLevel = 'few';
  else if (distinctRuleCount >= 3 && distinctRuleCount <= 4) summaryLevel = 'some';
  else if (distinctRuleCount >= 5) summaryLevel = 'many';
  // Build checklist from triggered signals in order of first appearance, cap at ~6
  const checklist = [];
  const seenActions = new Set();
  for (let i = 0; i < resolved.length; i++) {
    const action = resolved[i].checklistAction;
    if (action && !seenActions.has(action)) {
      seenActions.add(action);
      checklist.push(action);
      if (checklist.length >= 6) break;
    }
  }
  return {
    matches: resolved,
    distinctRuleCount,
    summaryLevel,
    rulesTriggered: distinctRuleIds,
    checklist,
    hasInput: true,
    isLong: false,
    length
  };
}
