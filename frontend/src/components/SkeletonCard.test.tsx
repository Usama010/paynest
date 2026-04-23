import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SkeletonCard from './SkeletonCard';

describe('SkeletonCard', () => {
  it('renders with pulse animation', () => {
    const { container } = render(<SkeletonCard />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('renders placeholder elements', () => {
    const { container } = render(<SkeletonCard />);
    const divs = container.querySelectorAll('.bg-gray-200');
    expect(divs.length).toBeGreaterThan(0);
  });
});
