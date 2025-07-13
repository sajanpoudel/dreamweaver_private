import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DreamMetadata } from './DreamMetadata';

const symbols = [
  { id: 's1', name: 'Water', meaning: 'Emotions' },
  { id: 's2', name: 'Door', meaning: null },
];
const themes = [{ id: 't1', name: 'Escape' }];
const emotions = [{ id: 'e1', name: 'Fear', intensity: 5 }];

describe('DreamMetadata', () => {
  it('shows the three section titles', () => {
    render(<DreamMetadata symbols={[]} themes={[]} emotions={[]} />);
    expect(screen.getByText('Symbols')).toBeInTheDocument();
    expect(screen.getByText('Themes')).toBeInTheDocument();
    expect(screen.getByText('Emotions')).toBeInTheDocument();
  });
});
