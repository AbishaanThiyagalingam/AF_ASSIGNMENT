import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Country from '../../src/pages/Country';

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

describe('Country Component Integration Tests', () => {
  const mockCountries = [
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
    axios.get.mockReset();
  });

  test('displays countries after successful fetch', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  test('displays error message when fetch fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch countries/i)).toBeInTheDocument();
    });
  });

  test('filters countries by search term', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by country name...');
    fireEvent.change(searchInput, { target: { value: 'Canada' } });
    
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  test('filters countries by region', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('region/Africa')) {
        return Promise.resolve({ data: [{ 
          cca3: 'NGA',
          name: { common: 'Nigeria' },
          flags: { svg: 'https://flagcdn.com/ng.svg' },
          population: 206139589,
          region: 'Africa',
          capital: ['Abuja']
        }]});
      }
      return Promise.resolve({ data: mockCountries });
    });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const regionSelect = screen.getByRole('combobox');
    fireEvent.change(regionSelect, { target: { value: 'Africa' } });
    
    await waitFor(() => {
      expect(screen.getByText('Nigeria')).toBeInTheDocument();
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
    });
  });

  test('navigates to country detail page on card click', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const countryCard = screen.getByText('United States').closest('div');
    fireEvent.click(countryCard);
    
    expect(mockedNavigate).toHaveBeenCalledWith('/country/USA', expect.anything());
  });

  test('redirects to login when liking country while unauthenticated', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const likeButton = screen.getAllByLabelText(/Like/i)[0];
    fireEvent.click(likeButton);
    
    expect(mockedNavigate).toHaveBeenCalledWith('/login', expect.anything());
  });

  test('toggles like for authenticated user', async () => {
    window.localStorage.setItem('token', 'test-token');
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    axios.post.mockResolvedValueOnce({ 
      data: { likedCountries: ['United States'] } 
    });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const likeButton = screen.getAllByLabelText(/Like/i)[0];
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/like',
        { countryName: 'United States' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  test('handles pagination correctly', async () => {
    const manyCountries = Array(20).fill().map((_, i) => ({
      cca3: `C${i}`,
      name: { common: `Country ${i}` },
      flags: { svg: `https://flagcdn.com/c${i}.svg` },
      population: 1000000 + i,
      region: 'Europe',
      capital: ['Capital']
    }));
    
    axios.get.mockResolvedValueOnce({ data: manyCountries });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Country 0')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Country 12')).toBeInTheDocument();
    });
  });

  test('displays empty state when no countries match filters', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by country name...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentCountry' } });
    
    expect(screen.getByText(/No countries found/i)).toBeInTheDocument();
  });

  test('redirects to login when session expires during like action', async () => {
    window.localStorage.setItem('token', 'expired-token');
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    axios.post.mockRejectedValueOnce({ response: { status: 401 } });
    
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
    
    const likeButton = screen.getAllByLabelText(/Like/i)[0];
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login', expect.anything());
    });
  });
});