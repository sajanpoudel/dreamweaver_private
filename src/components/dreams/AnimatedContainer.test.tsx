import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatedContainer } from './AnimatedContainer';

describe('AnimatedContainer', () => {
  it('renders its children', () => {
    render(<AnimatedContainer>Hello</AnimatedContainer>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
