// This file contains data validation tests.
import { describe, it, expect } from 'vitest';
import rules from '../src/data/rules.json';
import scenarios from '../src/data/scenarios.json';
import { analyzeMessage } from '../src/engine/analyze.js';

describe('data validation', () => {
  it('has exactly 12 rules', () => {
    expect(rules.length).toBe(12);
  });

  it('every rule has the required fields', () => {
    const required = [
      'id',
      'tacticId',
      'category',
      'tacticName',
      'patterns',
      'whyItMatters',
      'whatToVerify',
      'checklistAction'
    ];
    for (let i = 0; i < rules.length; i++) {
      for (let j = 0; j < required.length; j++) {
        expect(rules[i][required[j]]).toBeTruthy();
      }
      expect(Array.isArray(rules[i].patterns)).toBe(true);
    }
  });

  it('has 6 categories x 2', () => {
    const cats = {};
    for (let i = 0; i < rules.length; i++) {
      cats[rules[i].category] = (cats[rules[i].category] || 0) + 1;
    }
    expect(Object.keys(cats).length).toBe(6);
    for (let k in cats) {
      expect(cats[k]).toBe(2);
    }
  });

  it('rules sharing tacticId have identical whyItMatters and whatToVerify', () => {
    const map = {};
    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      if (!map[r.tacticId]) {
        map[r.tacticId] = { whyItMatters: r.whyItMatters, whatToVerify: r.whatToVerify };
      } else {
        expect(r.whyItMatters).toBe(map[r.tacticId].whyItMatters);
        expect(r.whatToVerify).toBe(map[r.tacticId].whatToVerify);
      }
    }
  });

  it('has exactly 8 scenarios with 6 suspicious 2 clean', () => {
    expect(scenarios.length).toBe(8);
    let sus = 0, clean = 0;
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].type === 'suspicious') sus++;
      if (scenarios[i].type === 'clean') clean++;
    }
    expect(sus).toBe(6);
    expect(clean).toBe(2);
  });

  it('suspicious scenarios have exactly 3 suspicious chunks', () => {
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].type === 'suspicious') {
        let count = 0;
        const chunks = scenarios[i].chunks || [];
        for (let j = 0; j < chunks.length; j++) {
          if (chunks[j].suspicious) count++;
        }
        expect(count).toBe(3);
      }
    }
  });

  it('clean scenarios have 0 suspicious chunks', () => {
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].type === 'clean') {
        let count = 0;
        const chunks = scenarios[i].chunks || [];
        for (let j = 0; j < chunks.length; j++) {
          if (chunks[j].suspicious) count++;
        }
        expect(count).toBe(0);
      }
    }
  });

  it('every suspicious chunk tacticId exists in rules', () => {
    const tacticIds = new Set(rules.map(r => r.tacticId));
    for (let i = 0; i < scenarios.length; i++) {
      const chunks = scenarios[i].chunks || [];
      for (let j = 0; j < chunks.length; j++) {
        if (chunks[j].suspicious) {
          expect(tacticIds.has(chunks[j].tacticId)).toBe(true);
        }
      }
    }
  });

  it('each scenario has 6-10 chunks', () => {
    for (let i = 0; i < scenarios.length; i++) {
      const len = (scenarios[i].chunks || []).length;
      expect(len >= 6 && len <= 10).toBe(true);
    }
  });

  it('every chunk has required fields and non-empty text', () => {
    for (let i = 0; i < scenarios.length; i++) {
      const chunks = scenarios[i].chunks || [];
      for (let j = 0; j < chunks.length; j++) {
        expect(chunks[j].id).toBeTruthy();
        expect(typeof chunks[j].text).toBe('string');
        expect(chunks[j].text.trim().length).toBeGreaterThan(0);
        expect(typeof chunks[j].suspicious).toBe('boolean');
        if (chunks[j].suspicious) {
          expect(chunks[j].tacticId).toBeTruthy();
        }
      }
    }
  });

  it('every suspicious chunk trips at least one rule', () => {
    for (let i = 0; i < scenarios.length; i++) {
      const chunks = scenarios[i].chunks || [];
      for (let j = 0; j < chunks.length; j++) {
        if (chunks[j].suspicious) {
          const result = analyzeMessage({ text: chunks[j].text });
          expect(result.distinctRuleCount).toBeGreaterThan(0);
        }
      }
    }
  });

  it('every clean chunk trips no rules', () => {
    for (let i = 0; i < scenarios.length; i++) {
      const chunks = scenarios[i].chunks || [];
      for (let j = 0; j < chunks.length; j++) {
        if (!chunks[j].suspicious) {
          const result = analyzeMessage({ text: chunks[j].text });
          expect(result.distinctRuleCount).toBe(0);
        }
      }
    }
  });
});
