import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, LogOut, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import logo from '../assets/cec.png';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-navy-900 border-b border-navy-700 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="Logo" className="h-10 w-auto group-hover:scale-110 transition-transform" />
              <span className="font-heading text-xl font-bold tracking-wider text-white">
                CHAND ELITE <span className="text-gold-500">CONSTRUCTIONS</span>
              </span>
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 mr-4">
                <Link to="/" className="text-gray-300 hover:text-gold-500 transition-colors text-sm font-medium">Dashboard</Link>
                <Link to="/get-and-pay" className="text-gray-300 hover:text-gold-500 transition-colors text-sm font-medium">Get & Pay</Link>
              </div>
              <div className="flex items-center gap-4 border-l border-navy-700 pl-6">
                <div className="hidden md:flex items-center gap-2 text-gray-300">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">{user?.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-gold-500 transition-colors bg-navy-800 px-3 py-1.5 rounded-md border border-navy-700 hover:border-gold-500"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Login
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
