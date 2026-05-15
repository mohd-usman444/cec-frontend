import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Computed role check
  isEmployee: () => get().user?.role === 'employee',

  // Initialize Auth State on app load
  checkAuth: async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await api.get('/auth/profile');
      set({ user: response.data, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
      }
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed'
      });
      return false;
    }
  },

  // Signup
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
      }
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed'
      });
      return false;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
      sessionStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Clear errors
  clearError: () => set({ error: null })
}));

export default useAuthStore;
