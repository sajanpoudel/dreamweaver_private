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

  it('says when nothing was identified', () => {
    render(<DreamMetadata symbols={[]} themes={[]} emotions={[]} />);
    expect(screen.getByText('No symbols identified')).toBeInTheDocument();
    expect(screen.getByText('No themes identified')).toBeInTheDocument();
    expect(screen.getByText('No emotions identified')).toBeInTheDocument();
  });

  it('skips the meaning of a symbol that has none', () => {
    const { container } = render(
      <DreamMetadata symbols={[symbols[1]]} themes={[]} emotions={[]} />
    );
    expect(container.querySelectorAll('li p')).toHaveLength(0);
  });

  it('lists themes', () => {
    render(<DreamMetadata symbols={[]} themes={themes} emotions={[]} />);
    expect(screen.getByText('Escape')).toBeInTheDocument();
    expect(screen.queryByText('No themes identified')).not.toBeInTheDocument();
  });

  it('draws an intensity bar scaled out of ten', () => {
    const { container } = render(<DreamMetadata symbols={[]} themes={[]} emotions={emotions} />);
    const bar = container.querySelector('.bg-primary') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });

  it('shows a full bar for an intensity of ten', () => {
    const { container } = render(
      <DreamMetadata
        symbols={[]}
        themes={[]}
        emotions={[{ id: 'e2', name: 'Joy', intensity: 10 }]}
      />
    );
    expect((container.querySelector('.bg-primary') as HTMLElement).style.width).toBe('100%');
  });
});
