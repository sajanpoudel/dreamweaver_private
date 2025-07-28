import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeHeader } from './HomeHeader';

describe('HomeHeader', () => {
  it('shows the product name', () => {
    render(<HomeHeader />);
    expect(screen.getByRole('heading', { name: 'Dreamly' })).toBeInTheDocument();
  });
});
