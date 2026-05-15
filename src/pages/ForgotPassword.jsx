import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import logo from '../assets/cec.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    const success = await forgotPassword(email);
    if (success) {
      setIsSubmitted(true);
      toast.success('Reset link sent to your email!');
    } else {
      toast.error(useAuthStore.getState().error || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-black p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle background logo */}
      <div
        className="absolute inset-0 opacity-5 bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url(${logo})`, backgroundSize: '60%' }}
      ></div>

      <div className="max-w-md w-full space-y-6 relative z-10 bg-navy-950/50 p-8 rounded-2xl border border-navy-800 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="CEC Logo" className="h-16 w-auto mb-6" />
          <h2 className="text-3xl font-heading font-bold text-white tracking-wider">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isSubmitted 
              ? "We've sent a password reset link to your email." 
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-navy-900 bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                'Sending...'
              ) : (
                <>
                  Send Reset Link
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="mt-6 text-center">
             <p className="text-gold-500 font-medium mb-6">Check your inbox for further instructions.</p>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gold-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
