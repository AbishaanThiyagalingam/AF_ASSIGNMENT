import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is logged in by looking for token in localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('token') !== null);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update state to reflect logged out status
    setIsLoggedIn(false);
    
    // Redirect to home page or login page
    navigate('/');
    
    // You might want to refresh the page to reset all states
    // window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              TRAVEL
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium">
              Home
            </Link>
            
            {/* Only show these if user is logged in */}
            {isLoggedIn && (
              <>
                <Link to="/Like" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Liked
                </Link>
                <Link to="/Wishlist" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Wishlist
                </Link>
              </>
            )}
            
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-3 px-4">
          <Link to="/" className="block py-2 text-gray-700 hover:text-indigo-600">
            Home
          </Link>
          
          {/* Only show these if user is logged in */}
          {isLoggedIn && (
            <>
              <Link to="/Like" className="block py-2 text-gray-700 hover:text-indigo-600">
                Liked
              </Link>
              <Link to="/Wishlist" className="block py-2 text-gray-700 hover:text-indigo-600">
                Wishlist
              </Link>
            </>
          )}
          
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="block py-2 text-gray-700 hover:text-indigo-600 w-full text-left"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link to="/register" className="block py-2 text-gray-700 hover:text-indigo-600">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;