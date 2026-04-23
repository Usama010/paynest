import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountdownTimer from './CountdownTimer';

describe('CountdownTimer', () => {
  it('shows "Ended" for past end time', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    render(<CountdownTimer endTime={past} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('shows remaining time for future end time', () => {
    const future = new Date(Date.now() + 300000).toISOString();
    render(<CountdownTimer endTime={future} />);
    expect(screen.queryByText('Ended')).not.toBeInTheDocument();
    expect(screen.getByText(/\d+m \d+s/)).toBeInTheDocument();
  });

  it('applies green color for active timer', () => {
    const future = new Date(Date.now() + 300000).toISOString();
    render(<CountdownTimer endTime={future} />);
    const el = screen.getByText(/\d+m/);
    expect(el.className).toContain('text-green-600');
  });

  it('applies red color for ended timer', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    render(<CountdownTimer endTime={past} />);
    const el = screen.getByText('Ended');
    expect(el.className).toContain('text-red-600');
  });
});
