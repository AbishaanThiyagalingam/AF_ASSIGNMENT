import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Country from '../../src/pages/Country';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../src/components/NavBar', () => () => <div>Header Mock</div>);
jest.mock('../../src/components/Footer', () => () => <div>Footer Mock</div>);

describe('Country Component', () => {
  const mockCountries = [
    {
      cca3: 'USA',
      name: { common: 'United States' },
      flags: { svg: 'https://flagcdn.com/us.svg' },
      population: 331002651,
      region: 'Americas',
      capital: ['Washington, D.C.'],
    },
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockCountries });
    useNavigate.mockReturnValue(jest.fn());
  });

  test('renders loading state initially', async () => {
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );

    // Check for loading elements by their classes
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('fetches and displays countries successfully', async () => {
    render(
      <MemoryRouter>
        <Country />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });
  });
});