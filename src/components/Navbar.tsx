
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-8 ${
        scrolled ? 'py-3 glass shadow-sm' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-semibold tracking-tight text-primary flex items-center group"
        >
          <span className="mr-2">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transform transition-transform group-hover:scale-110"
            >
              <path 
                d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10L4 21M20 10L20 21M8 14L8 17M12 14L12 17M16 14L16 17" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </span>
          StockPioneer
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link 
            to="/" 
            className={`transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          
          {isAuthenticated && (
            <Link 
              to="/dashboard" 
              className={`transition-colors hover:text-primary ${
                location.pathname === '/dashboard' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={logout}>
              Sign Out
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
