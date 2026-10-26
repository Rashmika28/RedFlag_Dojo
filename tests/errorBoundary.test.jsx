// This file verifies the render-error recovery screen.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../src/components/ErrorBoundary.jsx';

function BrokenScreen() {
  throw new Error('test render failure');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('shows a recovery screen instead of crashing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BrokenScreen />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: 'The hall went quiet.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(screen.getByText(/session-only/)).toBeInTheDocument();
  });
});
