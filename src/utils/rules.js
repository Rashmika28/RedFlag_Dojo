// This file provides tactic lookups from the rule data.
import rules from '../data/rules.json';

export const rulesByTacticId = rules.reduce((map, rule) => {
  if (!map[rule.tacticId]) {
    map[rule.tacticId] = rule;
  }
  return map;
}, {});
