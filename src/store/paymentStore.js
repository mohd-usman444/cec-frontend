import { create } from 'zustand';
import api from '../api/axios';

const usePaymentStore = create((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/payments');
      set({ payments: response.data, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch payments' 
      });
    }
  },

  addPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/payments', paymentData);
      set((state) => ({ 
        payments: [response.data, ...state.payments],
        isLoading: false 
      }));
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to add payment' 
      });
      return false;
    }
  },

  updatePayment: async (id, paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      set((state) => ({
        payments: state.payments.map((p) => (p._id === id ? response.data : p)),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to update payment' 
      });
      return false;
    }
  },

  deletePayment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/payments/${id}`);
      set((state) => ({
        payments: state.payments.filter((p) => p._id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete payment' 
      });
      return false;
    }
  },

  getStats: () => {
    const { payments } = get();
    // Filter out old supplier payments to match Get & Pay exactly
    const relevantPayments = payments.filter(p => 
      p.reason !== 'Quick Pay settlement towards material due balance' &&
      p.reason !== 'Quick Pay settlement'
    );
    
    const totalGet = relevantPayments
      .filter((p) => p.type === 'Get')
      .reduce((acc, p) => acc + p.amount, 0);
    const totalPay = relevantPayments
      .filter((p) => p.type === 'Pay')
      .reduce((acc, p) => acc + p.amount, 0);
      
    return {
      totalGet,
      totalPay,
      balance: totalGet - totalPay
    };
  }
}));

export default usePaymentStore;
