import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import logo from '../assets/cec.png';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
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
                <div className="hidden md:flex flex-col items-end gap-0.5 text-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gold-500" />
                    <span className="text-sm font-medium">{user?.fullName}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-navy-800 px-2 py-0.5 rounded-full border border-navy-700">
                    {user?.role === 'employee' ? 'Employee View' : 'Admin'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-gray-300 hover:text-gold-500 transition-colors bg-navy-800 px-3 py-1.5 rounded-md border border-navy-700 hover:border-gold-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-gold-500"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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

      {/* Mobile Menu Content */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="md:hidden bg-navy-800 border-b border-navy-700 animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <div className="flex items-center gap-3 px-3 py-4 border-b border-navy-700 mb-2">
              <div className="bg-gold-500/10 p-2 rounded-full">
                <User className="h-5 w-5 text-gold-500" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{user?.fullName}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-navy-700 transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/get-and-pay"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-gold-500 hover:bg-navy-700 transition-all"
            >
              Get & Pay
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 transition-all mt-4 border border-red-500/20"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
