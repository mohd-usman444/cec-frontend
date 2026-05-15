import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import logo from '../assets/cec.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { resetPassword, isLoading } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Basic length validation (browser pattern will handle complexity)
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const success = await resetPassword(token, password);
    if (success) {
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(useAuthStore.getState().error || 'Failed to reset password');
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
          <div className="bg-gold-500/10 p-4 rounded-full mb-4">
            <ShieldCheck className="h-10 w-10 text-gold-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-white tracking-wider">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Create a new secure password for your account.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                  title="Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-navy-900 bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all active:scale-95 disabled:opacity-70 group"
          >
            {isLoading ? (
              'Resetting...'
            ) : (
              <>
                Reset Password
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
