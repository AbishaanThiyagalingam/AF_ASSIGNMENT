import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Wishlist from '../../src/pages/Wishlist';

// Mock axios and react-router-dom
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock components
jest.mock('../../src/components/NavBar', () => () => <div>Header Mock</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer Mock</div>);

describe('Wishlist Component', () => {
  const mockWishlistCountries = ['Japan', 'France'];
  const mockCountriesData = [
    {
      cca3: 'JPN',
      name: { common: 'Japan' },
      flags: { svg: 'https://flagcdn.com/jp.svg' },
      population: 125836021,
      region: 'Asia',
      capital: ['Tokyo'],
    },
    {
      cca3: 'FRA',
      name: { common: 'France' },
      flags: { svg: 'https://flagcdn.com/fr.svg' },
      population: 67391582,
      region: 'Europe',
      capital: ['Paris'],
    }
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3000/api/users/wishlist') {
        return Promise.resolve({ data: mockWishlistCountries });
      }
      if (url === 'https://restcountries.com/v3.1/all') {
        return Promise.resolve({ data: mockCountriesData });
      }
      return Promise.reject(new Error('Not found'));
    });
    axios.post.mockResolvedValue({ 
      data: { wishList: ['France'] } // After removing Japan
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to login if no token exists', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Please log in to view your wishlist' }
    });
  });

  test('shows loading state initially', async () => {
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    // Check for loading skeletons
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('fetches and displays wishlist countries', async () => {
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/users/wishlist', {
        headers: { Authorization: 'Bearer mock-token' }
      });
      expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
    });

    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  test('shows empty state when no countries in wishlist', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3000/api/users/wishlist') {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });

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

  test('handles error when fetching wishlist fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch wishlist countries. Please try again later.')).toBeInTheDocument();
    });
  });

  test('removes country when remove button is clicked', async () => {
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByLabelText(/Remove.*from wishlist/i);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/wishlist',
        { countryName: 'Japan' },
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
    });
  });

  test('redirects to login when session expires during removal', async () => {
    axios.post.mockRejectedValueOnce({ 
      response: { status: 401 } 
    });

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByLabelText(/Remove.*from wishlist/i);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { message: 'Session expired. Please log in again.' }
      });
    });
  });

  test('navigates to home when Explore Countries button is clicked', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3000/api/users/wishlist') {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Explore Countries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Explore Countries'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('displays correct country information', async () => {
    render(
      <MemoryRouter>
        <Wishlist />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.getByText('125,836,021')).toBeInTheDocument();
      expect(screen.getByText('Asia')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });
});