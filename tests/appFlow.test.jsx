// This file runs a smoke test through the Analyze and Practice flow.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App.jsx';

describe('app flow', () => {
  it('moves from example analysis into the first practice message', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Try an example' }));
    expect(screen.getByText('Some risk signals')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to Practice' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start round' }));
    expect(screen.getByText('Message 1 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Message 2 of 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(screen.getByRole('button', { name: 'See results' }));

    expect(screen.getByText('Round complete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Analyze' })).toBeInTheDocument();
  });
});
