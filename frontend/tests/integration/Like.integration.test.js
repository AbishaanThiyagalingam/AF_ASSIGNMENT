import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Like from '../../src/pages/Like';

// Mock axios and useNavigate
jest.mock('axios');
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

describe('Like Component Integration Tests', () => {
  const mockLikedCountries = ['United States', 'Canada'];
  const mockCountriesData = [
    {
      cca3: 'USA',
      name: { common: 'United States' },
      flags: { svg: 'https://flagcdn.com/us.svg' },
      population: 331002651,
      region: 'Americas',
      capital: ['Washington D.C.']
    },
    {
      cca3: 'CAN',
      name: { common: 'Canada' },
      flags: { svg: 'https://flagcdn.com/ca.svg' },
      population: 38005238,
      region: 'Americas',
      capital: ['Ottawa']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('redirects to login when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    expect(mockedNavigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Please log in to view your liked countries' }
    });
  });

  test('displays liked countries after successful fetch', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: mockLikedCountries }) // First call for liked country names
      .mockResolvedValueOnce({ data: mockCountriesData }); // Second call for all countries
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  test('displays empty state when no countries are liked', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: [] }) // No liked countries
      .mockResolvedValueOnce({ data: mockCountriesData }); // All countries
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No liked countries yet')).toBeInTheDocument();
      expect(screen.getByText('Explore Countries')).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch liked countries/i)).toBeInTheDocument();
    });
  });

  test('navigates to country detail page on card click', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: mockLikedCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const countryCard = screen.getByText('United States').closest('div');
    fireEvent.click(countryCard);
    
    expect(mockedNavigate).toHaveBeenCalledWith('/country/USA', expect.anything());
  });

  test('removes country when unlike button is clicked', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: mockLikedCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    axios.post.mockResolvedValueOnce({ 
      data: { likedCountries: ['Canada'] } // After unliking US
    });
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const unlikeButton = screen.getAllByLabelText(/Unlike/i)[0];
    fireEvent.click(unlikeButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/like',
        { countryName: 'United States' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  test('redirects to login when session expires during unlike', async () => {
    window.localStorage.setItem('token', 'expired-token');
    axios.get
      .mockResolvedValueOnce({ data: mockLikedCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    axios.post.mockRejectedValueOnce({ response: { status: 401 } });
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const unlikeButton = screen.getAllByLabelText(/Unlike/i)[0];
    fireEvent.click(unlikeButton);
    
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login', {
        state: { message: 'Session expired. Please log in again.' }
      });
    });
  });

  test('navigates to explore page when empty state button clicked', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: [] }) // No liked countries
      .mockResolvedValueOnce({ data: mockCountriesData }); // All countries
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const exploreButton = screen.getByText('Explore Countries');
      fireEvent.click(exploreButton);
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
});