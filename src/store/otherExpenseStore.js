import { create } from 'zustand';
import api from '../api/axios';

const useOtherExpenseStore = create((set) => ({
  otherExpenses: [],
  isLoading: false,
  error: null,

  fetchOtherExpenses: async (siteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/other-expenses/${siteId}`);
      set({ otherExpenses: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to fetch other expenses' });
    }
  },

  addOtherExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/other-expenses', expenseData);
      set((state) => ({ 
        otherExpenses: [response.data, ...state.otherExpenses], 
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to add other expense' });
      return null;
    }
  },

  updateOtherExpense: async (id, expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/other-expenses/${id}`, expenseData);
      set((state) => ({
        otherExpenses: state.otherExpenses.map(e => e._id === id ? response.data : e),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to update other expense' });
      return false;
    }
  },

  deleteOtherExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/other-expenses/${id}`);
      set((state) => ({
        otherExpenses: state.otherExpenses.filter(e => e._id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to delete other expense' });
      return false;
    }
  }
}));

export default useOtherExpenseStore;
