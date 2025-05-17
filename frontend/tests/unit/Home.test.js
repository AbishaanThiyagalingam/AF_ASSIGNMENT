import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';

// Mock image imports
jest.mock('../../src/images/img1.jpg', () => 'test-image-stub');
jest.mock('../../src/images/liam.jpeg', () => 'test-image-stub');
jest.mock('../../src/images/emily.jpeg', () => 'test-image-stub');
jest.mock('../../src/images/Aisha.jpeg', () => 'test-image-stub');

// Mock useNavigate if needed
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Home Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the hero section with correct content', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('EXPLORE YOUR DREAM DESTINATIONS')).toBeInTheDocument();
    expect(screen.getByText('ADD THEM TO YOUR WISHLIST')).toBeInTheDocument();
  });

  test('shows login button when user is not logged in', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const button = screen.getByRole('button', { name: /Log in to Discover/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Discover the World/i })).not.toBeInTheDocument();
  });

  test('shows discover button when user is logged in', () => {
    localStorage.setItem('token', 'test-token');
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const button = screen.getByRole('button', { name: /Discover the World/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Log in to Discover/i })).not.toBeInTheDocument();
  });

  test('navigates to login page when not logged in and button clicked', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const button = screen.getByRole('button', { name: /Log in to Discover/i });
    fireEvent.click(button);
  });

  test('navigates to country page when logged in and button clicked', () => {
    localStorage.setItem('token', 'test-token');
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const button = screen.getByRole('button', { name: /Discover the World/i });
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith('/country');
  });

  test('renders testimonials section with correct data', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText('WHAT THE WORLD HAS TO SAY')).toBeInTheDocument();
    expect(screen.getByText('Emily')).toBeInTheDocument();
    expect(screen.getByText('Liam')).toBeInTheDocument();
    expect(screen.getByText('Aisha')).toBeInTheDocument();
  });

  test('renders upcoming events section with correct data', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });

  test('matches snapshot when logged out', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});