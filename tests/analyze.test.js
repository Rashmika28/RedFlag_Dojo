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

  it('handles overlapping matches by keeping the earliest and longest', () => {
    const res = analyzeMessage({ text: 'pay a small registration fee' });
    expect(res.matches.length).toBe(1);
    expect(res.matches[0].phrase).toBe('pay a small registration fee');
    for (let i = 0; i < res.matches.length - 1; i++) {
      expect(res.matches[i].end <= res.matches[i + 1].start).toBe(true);
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

  it.each([
    ['fee-upfront-1', 'pay a registration fee'],
    ['fee-upfront-1', 'pay a small processing fee'],
    ['fee-upfront-2', 'pay a security deposit'],
    ['fee-upfront-2', 'training fee required'],
    ['msg-push-1', 'move this to whatsapp'],
    ['msg-push-1', 'move to telegram'],
    ['msg-push-2', 'connect on whatsapp'],
    ['msg-push-2', 'talk on telegram'],
    ['email-free-1', 'write to hr@gmail.com'],
    ['email-free-1', 'write to hr@outlook.com'],
    ['email-free-2', 'write to hr@rediffmail.com'],
    ['email-free-2', 'write to hr@aol.com'],
    ['urgency-1', 'limited slots available'],
    ['urgency-1', 'act now'],
    ['urgency-2', 'offer expires today'],
    ['urgency-2', 'apply within two hours'],
    ['urgency-2', 'urgent hiring'],
    ['pii-bank-1', 'send your aadhaar'],
    ['pii-bank-1', 'share pan card'],
    ['pii-bank-2', 'send bank account details'],
    ['pii-bank-2', 'share ifsc code'],
    ['vague-pay-1', 'work from home earn 50000'],
    ['vague-pay-1', 'high pay for no experience'],
    ['vague-pay-2', 'simple task with a big payout'],
    ['vague-pay-2', 'data entry easy high pay']
  ])('matches %s for the intended phrase "%s"', (ruleId, text) => {
    const res = analyzeMessage({ text });
    expect(res.matches.length).toBeGreaterThan(0);
    expect(res.matches.every((match) => match.ruleId === ruleId)).toBe(true);
  });

  it('returns offsets that slice back to the exact matched phrase', () => {
    const text = 'Please pay a small registration fee, then move this to WhatsApp.';
    const res = analyzeMessage({ text });
    expect(res.matches.length).toBeGreaterThan(0);
    for (const match of res.matches) {
      expect(text.slice(match.start, match.end)).toBe(match.phrase);
    }
  });

  it('keeps sender offsets in the sender line', () => {
    const sender = 'Talent Desk <hr@gmail.com>';
    const res = analyzeMessage({ text: 'Hello there', sender });
    const match = res.matches.find((item) => item.source === 'sender');
    expect(match).toBeTruthy();
    expect(match.phrase).toBe('@gmail.com');
    expect(sender.slice(match.start, match.end)).toBe(match.phrase);
  });

  it('counts a repeated phrase once for rules but returns each match', () => {
    const res = analyzeMessage({ text: 'Aadhaar is required. Send Aadhaar again.' });
    expect(res.matches.length).toBe(2);
    expect(res.distinctRuleCount).toBe(1);
    expect(res.checklist.length).toBe(1);
  });

  it('caps the checklist at six actions', () => {
    const res = analyzeMessage({
      text: 'Registration fee. Move this to WhatsApp. Limited slots. Send Aadhaar and bank account. Work from home earn 50000. Email hr@gmail.com.'
    });
    expect(res.distinctRuleCount).toBeGreaterThan(6);
    expect(res.checklist.length).toBe(6);
    expect(new Set(res.checklist).size).toBe(6);
  });

  it('maps distinct rule counts to summary levels', () => {
    const messages = [
      'send your aadhaar',
      'send your aadhaar. move this to whatsapp',
      'send your aadhaar. move this to whatsapp. registration fee',
      'send your aadhaar. move this to whatsapp. registration fee. limited slots',
      'send your aadhaar. move this to whatsapp. registration fee. limited slots. work from home earn 50000'
    ];
    const levels = messages.map((text) => analyzeMessage({ text }).summaryLevel);
    expect(levels).toEqual(['few', 'few', 'some', 'some', 'many']);
    expect(messages.map((text) => analyzeMessage({ text }).distinctRuleCount)).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles malformed input without throwing', () => {
    expect(() => analyzeMessage()).not.toThrow();
    expect(() => analyzeMessage(null)).not.toThrow();
    expect(() => analyzeMessage({ text: 123, sender: null })).not.toThrow();
    expect(analyzeMessage({ text: 123 }).matches).toEqual([]);
    expect(analyzeMessage({ text: '   ' }).hasInput).toBe(false);
  });
});
