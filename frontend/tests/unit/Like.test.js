import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Like from '../../src/pages/Like';

// Mock axios and react-router-dom
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock components
jest.mock('../../src/components/NavBar', () => () => <div>Header Mock</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer Mock</div>);

describe('Like Component', () => {
  const mockLikedCountries = ['United States', 'Canada'];
  const mockCountriesData = [
    {
      cca3: 'USA',
      name: { common: 'United States' },
      flags: { svg: 'https://flagcdn.com/us.svg' },
      population: 331002651,
      region: 'Americas',
      capital: ['Washington, D.C.'],
    },
    {
      cca3: 'CAN',
      name: { common: 'Canada' },
      flags: { svg: 'https://flagcdn.com/ca.svg' },
      population: 38005238,
      region: 'Americas',
      capital: ['Ottawa'],
    }
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3000/api/users/likes') {
        return Promise.resolve({ data: mockLikedCountries });
      }
      if (url === 'https://restcountries.com/v3.1/all') {
        return Promise.resolve({ data: mockCountriesData });
      }
      return Promise.reject(new Error('Not found'));
    });
    axios.post.mockResolvedValue({ 
      data: { likedCountries: ['Canada'] } // After unliking US
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to login if no token exists', () => {
    Storage.prototype.getItem = jest.fn(() => null);
    
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Please log in to view your liked countries' }
    });
  });

  test('shows loading state initially', async () => {
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );

    // Check for loading skeletons
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('fetches and displays liked countries', async () => {
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/users/likes', {
        headers: { Authorization: 'Bearer mock-token' }
      });
      expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
    });

    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  test('shows empty state when no countries are liked', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3000/api/users/likes') {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });

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

  test('handles error when fetching liked countries fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch liked countries. Please try again later.')).toBeInTheDocument();
    });
  });

  test('removes country when unlike button is clicked', async () => {
    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    const unlikeButtons = screen.getAllByLabelText(/Unlike/i);
    fireEvent.click(unlikeButtons[0]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/users/like',
        { countryName: 'United States' },
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(screen.queryByText('United States')).not.toBeInTheDocument();
    });
  });

  test('redirects to login when session expires during unlike', async () => {
    axios.post.mockRejectedValueOnce({ 
      response: { status: 401 } 
    });

    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    const unlikeButtons = screen.getAllByLabelText(/Unlike/i);
    fireEvent.click(unlikeButtons[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { message: 'Session expired. Please log in again.' }
      });
    });
  });

  test('navigates to home when Explore Countries button is clicked', async () => {
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:3000/api/users/likes') {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <Like />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Explore Countries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Explore Countries'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});