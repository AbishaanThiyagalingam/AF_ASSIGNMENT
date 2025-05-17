import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/pages/Home';

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Home Component Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('renders the hero section with correct content', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/EXPLORE YOUR DREAM DESTINATIONS/i)).toBeInTheDocument();
    expect(screen.getByText(/ADD THEM TO YOUR WISHLIST/i)).toBeInTheDocument();
    expect(screen.getByText(/From tropical beaches to snowy mountains/i)).toBeInTheDocument();
  });

  test('displays login button when user is not logged in', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const discoverButton = screen.getByRole('button', { name: /Log in to Discover/i });
    expect(discoverButton).toBeInTheDocument();
    expect(discoverButton).toHaveClass('bg-gray-400');
    expect(discoverButton).toHaveAttribute('disabled');
  });

  test('displays discover button when user is logged in', () => {
    // Simulate logged in user
    window.localStorage.setItem('token', 'test-token');
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const discoverButton = screen.getByRole('button', { name: /Discover the World/i });
    expect(discoverButton).toBeInTheDocument();
    expect(discoverButton).toHaveClass('bg-white');
    expect(discoverButton).not.toHaveAttribute('disabled');
  });

  test('navigates to country page when logged in and button clicked', () => {
    // Simulate logged in user
    window.localStorage.setItem('token', 'test-token');
    
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    const discoverButton = screen.getByRole('button', { name: /Discover the World/i });
    fireEvent.click(discoverButton);
    
    expect(mockedNavigate).toHaveBeenCalledWith('/country');
  });

  test('renders traveler testimonials section correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/WHAT THE WORLD HAS TO SAY/i)).toBeInTheDocument();
    
    // Test for each traveler
    expect(screen.getByText(/Emily/i)).toBeInTheDocument();
    expect(screen.getByText(/Canada/i)).toBeInTheDocument();
    expect(screen.getByText(/Liam/i)).toBeInTheDocument();
    expect(screen.getByText(/Australia/i)).toBeInTheDocument();
    expect(screen.getByText(/Aisha/i)).toBeInTheDocument();
    expect(screen.getByText(/UAE/i)).toBeInTheDocument();
  });

  test('renders upcoming events section correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/UPCOMING EVENTS/i)).toBeInTheDocument();
    
    // Test for each event
    expect(screen.getByText(/World Travel Expo 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/June 15, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Tokyo Cherry Blossom Festival/i)).toBeInTheDocument();
    expect(screen.getByText(/March 25, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Rio Carnival Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/February 10, 2025/i)).toBeInTheDocument();
  });

  test('renders Navbar and Footer components', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });
});