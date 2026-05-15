import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HardHat, Mail, Lock, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import logo from '../assets/cec.png';
import loginBg from '../assets/login-bg.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }

    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, from, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      toast.success('Logged in successfully!');
      navigate('/');
    } else {
      toast.error(useAuthStore.getState().error || 'Login failed');
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-black overflow-hidden">
      {/* Left Side: Logo Branding */}
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center bg-navy-950 border-r border-navy-800 relative overflow-hidden p-12"
      >
        <div className="absolute inset-0 opacity-10 bg-center bg-no-repeat" style={{ backgroundImage: `url(${logo})`, backgroundSize: '150%' }}></div>
        <img
          src={logo}
          alt="CEC Logo Large"
          className="relative z-10 w-full max-w-md max-h-full object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]"
        />
      </div>

      {/* Right Side: Login Form */}
      <div
        className="flex-1 flex items-center justify-center p-6 bg-black relative overflow-y-auto"
      >
        {/* Subtle background logo on the right side too */}
        <div
          className="absolute inset-0 opacity-5 bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url(${logo})`, backgroundSize: '80%' }}
        ></div>

        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="flex flex-col items-center md:items-start">
            {/* Small logo for mobile/context */}
            <img src={logo} alt="CEC Logo" className="h-12 w-auto mb-4 md:hidden" />
            <h2 className="text-3xl font-heading font-bold text-white tracking-wider">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Sign in to the CEC Management Portal
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    className="input-field pl-10"
                    placeholder="contractor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  {/* <input 
                    id="password"
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />*/}
                  <input
                    id="password"
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="••••••••"

                    pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

                    title="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and minimum 8 characters"

                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <a href="#" className="font-medium text-gold-500 hover:text-gold-400 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-navy-900 bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all active:scale-95 disabled:opacity-70 group"
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center md:text-left mt-4">
            <span className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-gold-500 hover:text-gold-400 transition-colors">
                Sign up here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
