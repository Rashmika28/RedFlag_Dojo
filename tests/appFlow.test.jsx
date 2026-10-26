// This file runs smoke tests through the Analyze and Practice flows.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App.jsx';

function openPractice() {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Try an example' }));
  fireEvent.click(screen.getByRole('button', { name: 'Go to Practice' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start round' }));
}

function submitRoundWithoutSelections() {
  const scores = [];
  for (let index = 0; index < 3; index++) {
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    const stamp = screen.getByLabelText(/^Message score \d out of 6$/);
    const score = Number(stamp.getAttribute('aria-label').match(/\d+/)[0]);
    scores.push(score);
    expect([0, 6]).toContain(score);
    if (index < 2) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'See results' }));
    }
  }
  return scores;
}

describe('app flow', () => {
  it('moves from example analysis through a full practice round', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content');
    fireEvent.click(screen.getByRole('button', { name: 'Try an example' }));
    expect(screen.getByText('Some risk signals')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to Practice' }));
    expect(screen.getByRole('heading', { name: /Read the message/ })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Belt progression' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start round' }));
    expect(screen.getByText('Message 1 of 3')).toBeInTheDocument();

    const scores = submitRoundWithoutSelections();
    expect(scores.filter((score) => score === 6)).toHaveLength(1);

    expect(screen.getByText('Round complete')).toBeInTheDocument();
    expect(screen.getByLabelText('Round score 6 out of 18')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Analyze' })).toBeInTheDocument();
  });

  it('returns to Analyze and keeps the session score on the practice start screen', () => {
    openPractice();
    submitRoundWithoutSelections();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Analyze' }));
    expect(screen.getByRole('heading', { name: /Spot the pressure before you reply/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Practice' }));
    expect(screen.getByRole('button', { name: 'Start round' })).toBeInTheDocument();
    expect(screen.getByText('6', { selector: '.practice-start__value' })).toBeInTheDocument();
  });

  it('starts a fresh message after Play again', () => {
    openPractice();
    submitRoundWithoutSelections();

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    expect(screen.getByText('Message 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('accumulates session score and shows a belt up after three rounds', () => {
    openPractice();
    submitRoundWithoutSelections();

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    submitRoundWithoutSelections();
    expect(screen.getByText('12', { selector: '.summary-hero__cumulative strong' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    submitRoundWithoutSelections();
    expect(screen.getByText('Belt up')).toBeInTheDocument();
    expect(screen.getByText('White to Yellow. The next drill just got sharper.')).toBeInTheDocument();
    expect(screen.getByText('22 points to Brown')).toBeInTheDocument();
  });

  it('blocks over-limit messages and shows the no-signal state', () => {
    render(<App />);
    const textarea = screen.getByLabelText('Recruiter message');

    fireEvent.change(textarea, { target: { value: 'x'.repeat(3001) } });
    expect(screen.getByText('3001 / 3000 characters')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/too long/i);
    expect(screen.getByRole('button', { name: 'Check signals' })).toBeDisabled();

    fireEvent.change(textarea, {
      target: { value: 'Thank you for applying. We would like to schedule a call through our official careers portal.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check signals' }));

    expect(screen.getByText('No signals found')).toBeInTheDocument();
    expect(screen.getByText(/doesn't mean the message is trustworthy/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Evidence ledger' })).not.toBeInTheDocument();
  });

  it('reports sender-line evidence separately from the message', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Recruiter message'), { target: { value: 'Hello there' } });
    fireEvent.change(screen.getByLabelText(/Sender line/), {
      target: { value: 'Talent Desk <hr@gmail.com>' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check signals' }));

    expect(screen.getByText('Few risk signals')).toBeInTheDocument();
    expect(screen.getByText('sender line')).toBeInTheDocument();
    expect(screen.getByText(/@gmail\.com/, { selector: 'mark.evidence-mark' })).toBeInTheDocument();
  });
});
