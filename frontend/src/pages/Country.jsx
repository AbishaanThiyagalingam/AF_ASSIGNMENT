import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/NavBar';
import Footer from '../components/Footer';

const Country = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const countriesPerPage = 12;

  // User preferences
  const [likedCountries, setLikedCountries] = useState([]);
  const [wishlistCountries, setWishlistCountries] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const availableRegions = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch user's liked countries and wishlist
  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedCountries();
      fetchWishlistCountries();
    }
  }, [isAuthenticated]);

  const fetchLikedCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/likes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikedCountries(response.data);
    } catch (error) {
      console.error('Error fetching liked countries:', error);
    }
  };

  const fetchWishlistCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistCountries(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchAllCountries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      setCountries(response.data);
      setFilteredCountries(response.data);
    } catch (error) {
      console.error('Error fetching all countries:', error);
      setError('Failed to fetch countries. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCountriesByRegion = async (selectedRegion) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/region/${selectedRegion}`);
      setCountries(response.data);
      setFilteredCountries(response.data);
    } catch (error) {
      console.error(`Error fetching countries for region ${selectedRegion}:`, error);
      setError(`Failed to fetch countries for ${selectedRegion}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllCountries();
  }, []);

  // Fetch countries based on region
  useEffect(() => {
    if (region === 'All') {
      fetchAllCountries();
    } else {
      fetchCountriesByRegion(region);
    }
  }, [region]);

  // Handle search filter
  useEffect(() => {
    const results = countries.filter((c) =>
      c.name.common.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCountries(results);
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchTerm, countries]);

  // Handle country selection - navigate to detail page
  const handleCountryClick = (country) => {
    navigate(`/country/${country.cca3}`, { state: { country } });
  };

  // Toggle like for a country
  const handleLikeCountry = async (e, countryName) => {
    e.stopPropagation(); // Prevent card click event

    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please log in to like countries' } });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/users/like', 
        { countryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLikedCountries(response.data.likedCountries);
    } catch (error) {
      console.error('Error updating country like:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      }
    }
  };

  // Toggle wishlist for a country
  const handleWishlistCountry = async (e, countryName) => {
    e.stopPropagation(); // Prevent card click event

    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please log in to add countries to your wishlist' } });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/users/wishlist', 
        { countryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setWishlistCountries(response.data.wishList);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      }
    }
  };

  // Pagination logic
  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = filteredCountries.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate pagination buttons with ellipsis for large page counts
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftBound = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
      const rightBound = Math.min(leftBound + maxVisiblePages - 1, totalPages);
      
      if (leftBound > 1) {
        pages.push(1);
        if (leftBound > 2) pages.push('...');
      }
      
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }
      
      if (rightBound < totalPages) {
        if (rightBound < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages.map((page, index) => (
      page === '...' ? (
        <span key={index} className="px-3 py-1">...</span>
      ) : (
        <button
          key={index}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-1 rounded-md transition-all duration-200 ${
            currentPage === page
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
        >
          {page}
        </button>
      )
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800 mb-2">
              Country Explorer
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover countries around the world with detailed information about their population, region, capital, and more.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by country name..."
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-3 w-full md:w-1/4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none transition"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {availableRegions.map((r) => (
                <option key={r} value={r}>
                  {r === 'All' ? 'Filter by Region' : r}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(countriesPerPage)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="bg-gray-200 h-48 w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {currentCountries.length > 0 ? (
                <>
                  <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10">
                    {currentCountries.map((country) => (
                      <div
                        key={country.cca3}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative"
                        onClick={() => handleCountryClick(country)}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={country.flags.svg}
                            alt={`${country.name.common} flag`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          
                          {/* Action buttons (Like and Wishlist) */}
                          <div className="absolute top-2 right-2 flex gap-2">
                            {/* Like button */}
                            <button
                              onClick={(e) => handleLikeCountry(e, country.name.common)}
                              className={`p-2 rounded-full ${
                                likedCountries.includes(country.name.common)
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-white text-gray-500 hover:bg-gray-100'
                              } shadow-md transition-all duration-200`}
                              aria-label={`${likedCountries.includes(country.name.common) ? 'Unlike' : 'Like'} ${country.name.common}`}
                            >
                              <svg className="w-5 h-5" fill={likedCountries.includes(country.name.common) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                            
                            {/* Wishlist button */}
                            <button
                              onClick={(e) => handleWishlistCountry(e, country.name.common)}
                              className={`p-2 rounded-full ${
                                wishlistCountries.includes(country.name.common)
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-white text-gray-500 hover:bg-gray-100'
                              } shadow-md transition-all duration-200`}
                              aria-label={`${wishlistCountries.includes(country.name.common) ? 'Remove from' : 'Add to'} wishlist`}
                            >
                              <svg className="w-5 h-5" fill={wishlistCountries.includes(country.name.common) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-5">
                          <h2 className="text-xl font-bold mb-3 text-gray-800">{country.name.common}</h2>
                          <div className="space-y-2 text-gray-600">
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span><strong>Population:</strong> {country.population.toLocaleString()}</span>
                            </p>
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span><strong>Region:</strong> {country.region}</span>
                            </p>
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span><strong>Capital:</strong> {country.capital?.[0] || 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mb-10">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
                          currentPage === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'
                        }`}
                        disabled={currentPage === 1}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>

                      {renderPagination()}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center ${
                          currentPage === totalPages
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'
                        }`}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No countries found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Country;