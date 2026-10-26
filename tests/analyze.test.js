// This file contains tests for analyze engine.
import { describe, it, expect } from 'vitest';
import { analyzeMessage } from '../src/engine/analyze.js';
import { EXAMPLE_MESSAGE, EXAMPLE_SENDER } from '../src/data/example.js';

describe('analyzeMessage', () => {
  it('returns none for empty input', () => {
    const res = analyzeMessage({ text: '' });
    expect(res.summaryLevel).toBe('none');
    expect(res.matches.length).toBe(0);
  });

  it('handles long input over 3000', () => {
    const long = 'a'.repeat(3001);
    const res = analyzeMessage({ text: long });
    expect(res.isLong).toBe(true);
  });

  // 2 cases per rule roughly
  it('detects upfront fees 1', () => {
    const res = analyzeMessage({ text: 'pay a registration fee to apply' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects upfront fees 2', () => {
    const res = analyzeMessage({ text: 'pay a processing fee now' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects security deposit', () => {
    const res = analyzeMessage({ text: 'pay security deposit to reserve seat' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects training fee', () => {
    const res = analyzeMessage({ text: 'training fee required' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects push to whatsapp', () => {
    const res = analyzeMessage({ text: 'move this to whatsapp right now' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects push to telegram', () => {
    const res = analyzeMessage({ text: 'move to telegram for link' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects connect on whatsapp', () => {
    const res = analyzeMessage({ text: 'connect on whatsapp to proceed' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects talk on telegram', () => {
    const res = analyzeMessage({ text: 'talk on telegram now' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects free email gmail', () => {
    const res = analyzeMessage({ text: 'contact me at recruiter@gmail.com' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects free email yahoo', () => {
    const res = analyzeMessage({ text: 'email: test@yahoo.com' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects urgency limited slots', () => {
    const res = analyzeMessage({ text: 'limited slots available' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects urgency act now', () => {
    const res = analyzeMessage({ text: 'act now to apply' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects expires today', () => {
    const res = analyzeMessage({ text: 'offer expires today' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects urgent hiring', () => {
    const res = analyzeMessage({ text: 'urgent hiring for freshers' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects aadhaar', () => {
    const res = analyzeMessage({ text: 'send your aadhaar number' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects pan card', () => {
    const res = analyzeMessage({ text: 'need your pan card details' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects bank account', () => {
    const res = analyzeMessage({ text: 'send bank account details' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects ifsc', () => {
    const res = analyzeMessage({ text: 'share ifsc code' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects unrealistic pay regex', () => {
    const res = analyzeMessage({ text: 'work from home earn 50000 per month no experience' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects big payout', () => {
    const res = analyzeMessage({ text: 'simple task big payout' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects data entry high pay', () => {
    const res = analyzeMessage({ text: 'data entry easy high pay' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects hotmail', () => {
    const res = analyzeMessage({ text: 'contact via test@hotmail.com' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects rediffmail', () => {
    const res = analyzeMessage({ text: 'recruiter@rediffmail.com' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });
  it('detects apply within', () => {
    const res = analyzeMessage({ text: 'apply within 2 hours' });
    expect(res.distinctRuleCount).toBeGreaterThan(0);
  });

  it('adds source sender for sender matches', () => {
    const res = analyzeMessage({ text: 'hello', sender: 'recruiter@gmail.com' });
    expect(res.matches.some(m => m.source === 'sender')).toBe(true);
  });

  it('handles overlapping matches', () => {
    // Create a case where patterns might overlap - test that overlaps are resolved
    const res = analyzeMessage({ text: 'pay a small registration fee' });
    // Should not have overlapping ranges
    const matches = res.matches;
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].end <= matches[i+1].start || matches[i+1].end <= matches[i].start).toBe(true);
    }
  });

  it('try an example triggers 4-5 rules across different categories', () => {
    const res = analyzeMessage({ text: EXAMPLE_MESSAGE, sender: EXAMPLE_SENDER });
    expect(res.distinctRuleCount).toBeGreaterThanOrEqual(4);
    expect(res.distinctRuleCount).toBeLessThanOrEqual(5);
    const categories = new Set(res.matches.map((match) => match.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
    expect(res.summaryLevel).toBe('some');
  });

  it('summaryLevel none for zero signals', () => {
    const res = analyzeMessage({ text: 'Hello, we would like to invite you for interview via official portal.' });
    expect(res.summaryLevel).toBe('none');
  });

  it('does not false-positive on a clean interview invite', () => {
    const res = analyzeMessage({
      text: 'Thank you for applying. We would like to schedule a call through our official careers portal. No payment is required at any stage.',
      sender: 'Hiring Team <careers@fictional-company.example>'
    });
    expect(res.distinctRuleCount).toBe(0);
    expect(res.summaryLevel).toBe('none');
  });

  it('does not false-positive on a clean follow-up', () => {
    const res = analyzeMessage({
      text: 'We reviewed your profile and will share interview details by email. Please reply with your availability for next week.'
    });
    expect(res.distinctRuleCount).toBe(0);
    expect(res.checklist.length).toBe(0);
  });
});
