import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DreamHeader } from './DreamHeader';

describe('DreamHeader', () => {
  it('shows the journal title', () => {
    render(<DreamHeader />);
    expect(screen.getByRole('heading', { name: 'Your Dream Journal' })).toBeInTheDocument();
  });
});
