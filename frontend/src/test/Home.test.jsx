import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('Home Component', () => {
  it('renders the chess reinvented heading', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Chess Reinvented ✨')).toBeInTheDocument();
  });

  it('renders the call-to-action buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Join Live Game')).toBeInTheDocument();
    expect(screen.getByText('Challenge Friend')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Dive into real-time chess battles/)).toBeInTheDocument();
  });
});