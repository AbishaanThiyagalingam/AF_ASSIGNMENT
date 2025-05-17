import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/NavBar';
import Footer from '../components/Footer';

const Like = () => {
  const [countries, setCountries] = useState([]);
  const [likedCountries, setLikedCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Please log in to view your liked countries' } });
      return;
    }

    const fetchLikedCountries = async () => {
      setIsLoading(true);
      try {
        // Fetch user's liked country names
        const likesResponse = await axios.get('http://localhost:3000/api/users/likes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (likesResponse.data.length === 0) {
          setIsLoading(false);
          return;
        }
        
        setLikedCountries(likesResponse.data);
        
        // Fetch all countries to get detailed information
        const countriesResponse = await axios.get('https://restcountries.com/v3.1/all');
        
        // Filter only the liked countries
        const likedCountriesDetails = countriesResponse.data.filter(country => 
          likesResponse.data.includes(country.name.common)
        );
        
        setCountries(likedCountriesDetails);
      } catch (error) {
        console.error('Error fetching liked countries:', error);
        if (error.response && error.response.status === 401) {
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
        } else {
          setError('Failed to fetch liked countries. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedCountries();
  }, [navigate]);

  // Handle country selection - navigate to detail page
  const handleCountryClick = (country) => {
    navigate(`/country/${country.cca3}`, { state: { country } });
  };

  // Remove country from liked countries
  const handleUnlikeCountry = async (e, countryName) => {
    e.stopPropagation(); // Prevent card click event

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/users/like', 
        { countryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state to remove the unliked country
      setLikedCountries(response.data.likedCountries);
      setCountries(countries.filter(country => country.name.common !== countryName));
    } catch (error) {
      console.error('Error updating country like:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
              My Liked Countries
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Countries you've marked as favorites during your exploration.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
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
              {countries.length > 0 ? (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-10">
                  {countries.map((country) => (
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
                        
                        {/* Unlike button */}
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => handleUnlikeCountry(e, country.name.common)}
                            className="p-2 rounded-full bg-pink-500 text-white shadow-md transition-all duration-200 hover:bg-pink-600"
                            aria-label={`Unlike ${country.name.common}`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <h2 className="text-xl font-bold mb-3 text-gray-800">{country.name.common}</h2>
                        <div className="space-y-2 text-gray-600">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span><strong>Population:</strong> {country.population.toLocaleString()}</span>
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span><strong>Region:</strong> {country.region}</span>
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span><strong>Capital:</strong> {country.capital?.[0] || 'N/A'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No liked countries yet</h3>
                  <p className="mt-1 text-gray-500">Explore countries and click the heart icon to add them to your favorites.</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                  >
                    Explore Countries
                  </button>
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

export default Like;