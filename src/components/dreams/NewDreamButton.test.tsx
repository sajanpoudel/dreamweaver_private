import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewDreamButton } from './NewDreamButton';

describe('NewDreamButton', () => {
  it('links to the new dream page', () => {
    render(<NewDreamButton />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dreams/new');
  });

  it('has a clear label', () => {
    render(<NewDreamButton />);
    expect(screen.getByRole('button', { name: /Record New Dream/ })).toBeInTheDocument();
  });
});
