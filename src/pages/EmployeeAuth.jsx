import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HardHat, Mail, Lock, ArrowRight, User as UserIcon, Phone, Building } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import logo from '../assets/cec.png';

const EmployeeAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const { login, register, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }

    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all fields');
        return;
      }
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Employee logged in successfully!');
        navigate('/');
      }
    } else {
      if (!formData.fullName || !formData.email || !formData.password || !formData.phoneNumber || !formData.companyName) {
        toast.error('Please fill in all fields');
        return;
      }
      // Automatically set role to employee
      const success = await register({ ...formData, role: 'employee' });
      if (success) {
        toast.success('Employee account created successfully!');
        navigate('/');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-black overflow-hidden">
      {/* Left Side: Logo Branding */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-navy-950 border-r border-navy-800 relative overflow-hidden p-12">
        <div className="absolute inset-0 opacity-10 bg-center bg-no-repeat" style={{ backgroundImage: `url(${logo})`, backgroundSize: '150%' }}></div>
        <img
          src={logo}
          alt="CEC Logo Large"
          className="relative z-10 w-full max-w-md max-h-full object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]"
        />
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-black relative overflow-y-auto">
        <div className="absolute inset-0 opacity-5 bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: `url(${logo})`, backgroundSize: '80%' }}></div>

        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="flex flex-col items-center md:items-start">
            <img src={logo} alt="CEC Logo" className="h-12 w-auto mb-4 md:hidden" />
            <h2 className="text-3xl font-heading font-bold text-white tracking-wider">
              {isLogin ? 'Employee Portal' : 'Join as Employee'}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {isLogin ? 'Access the CEC project dashboard' : 'Create your view-only employee account'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border-b border-navy-800">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all ${isLogin ? 'text-gold-500 border-b-2 border-gold-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-all ${!isLogin ? 'text-gold-500 border-b-2 border-gold-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <UserIcon className="h-5 w-5" />
                    </span>
                    <input
                      name="fullName"
                      type="text"
                      required
                      className="input-field pl-10"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Building className="h-5 w-5" />
                    </span>
                    <input
                      name="companyName"
                      type="text"
                      required
                      className="input-field pl-10"
                      placeholder="Chand Elite Constructions"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Phone className="h-5 w-5" />
                    </span>
                    <input
                      name="phoneNumber"
                      type="text"
                      required
                      className="input-field pl-10"
                      placeholder="+91 00000 00000"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="employee@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-navy-900 bg-gold-500 hover:bg-gold-600 transition-all active:scale-95 disabled:opacity-70 group"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    {isLogin ? 'Sign In as Employee' : 'Sign Up as Employee'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gold-500 transition-colors">
              Are you a Contractor? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuth;
