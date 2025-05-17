import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Wishlist from '../../src/pages/Wishlist';

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

describe('Wishlist Component Integration Tests', () => {
  const mockWishlistCountries = ['Japan', 'France'];
  const mockCountriesData = [
    {
      cca3: 'JPN',
      name: { common: 'Japan' },
      flags: { svg: 'https://flagcdn.com/jp.svg' },
      population: 126476461,
      region: 'Asia',
      capital: ['Tokyo']
    },
    {
      cca3: 'FRA',
      name: { common: 'France' },
      flags: { svg: 'https://flagcdn.com/fr.svg' },
      population: 67391582,
      region: 'Europe',
      capital: ['Paris']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    axios.get.mockReset();
  });

  test('redirects to login when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    expect(mockedNavigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Please log in to view your wishlist' }
    });
  });

  test('displays wishlist countries after successful fetch', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: mockWishlistCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  test('displays empty state when no countries in wishlist', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
      expect(screen.getByText('Explore Countries')).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch wishlist countries/i)).toBeInTheDocument();
    });
  });

  test('navigates to country detail page on card click', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: mockWishlistCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    const countryCard = screen.getByText('Japan').closest('div');
    fireEvent.click(countryCard);
    
    expect(mockedNavigate).toHaveBeenCalledWith('/country/JPN', expect.anything());
  });

  test('removes country when remove button is clicked', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: mockWishlistCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    axios.post.mockResolvedValueOnce({ 
      data: { wishList: ['France'] } // After removing Japan
    });
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    const removeButton = screen.getAllByLabelText(/Remove Japan from wishlist/i)[0];
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/wishlist',
        { countryName: 'Japan' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  test('redirects to login when session expires during removal', async () => {
    window.localStorage.setItem('token', 'expired-token');
    axios.get
      .mockResolvedValueOnce({ data: mockWishlistCountries })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    axios.post.mockRejectedValueOnce({ response: { status: 401 } });
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    const removeButton = screen.getAllByLabelText(/Remove Japan from wishlist/i)[0];
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login', {
        state: { message: 'Session expired. Please log in again.' }
      });
    });
  });

  test('navigates to explore page when empty state button clicked', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockCountriesData });
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      const exploreButton = screen.getByText('Explore Countries');
      fireEvent.click(exploreButton);
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('only shows countries that are in the wishlist', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get
      .mockResolvedValueOnce({ data: ['Japan'] }) // Only Japan in wishlist
      .mockResolvedValueOnce({ data: mockCountriesData }); // But API returns Japan and France
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.queryByText('France')).not.toBeInTheDocument();
    });
  });
});