import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';

function TestTrigger() {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Test message', 'success')}>Show Toast</button>
      <button onClick={() => addToast('Error message', 'error')}>Show Error</button>
    </div>
  );
}

describe('Toast', () => {
  it('shows toast message when triggered', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('shows error toast with correct styling', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Error'));
    const toast = screen.getByText('Error message').closest('div');
    expect(toast?.className).toContain('bg-red-600');
  });

  it('dismisses toast on close button click', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>,
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    await user.click(screen.getByText('×'));
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });
});
